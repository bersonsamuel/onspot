import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Simple in-memory rate limiter: max 10 job posts per user per hour */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

/** Validate and sanitise a job POST body. Returns error string or null. */
function validateJobBody(body: Record<string, unknown>): string | null {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
    return 'Title must be at least 3 characters.';
  }
  if (body.title.length > 200) return 'Title is too long (max 200 characters).';

  if (!body.category || typeof body.category !== 'string') return 'Category is required.';

  if (!body.location || typeof body.location !== 'string') return 'Location is required.';

  if (!body.pay || typeof body.pay !== 'string') return 'Pay display string is required.';

  const rawPay = Number(body.raw_pay);
  if (!Number.isFinite(rawPay) || rawPay <= 0) {
    return 'Pay must be a positive number.';
  }

  const slotsTotal = Number(body.slots_total);
  if (!Number.isFinite(slotsTotal) || slotsTotal < 1 || slotsTotal > 500) {
    return 'Slots must be between 1 and 500.';
  }

  if (!body.time || typeof body.time !== 'string') return 'Shift time is required.';

  // start_at must be present and in the future
  if (body.start_at) {
    const startAt = new Date(body.start_at as string);
    if (isNaN(startAt.getTime())) return 'Invalid start_at date.';
    if (startAt < new Date()) return 'Start time must be in the future.';
  }

  // perks max 10 items
  if (body.perks !== undefined) {
    if (!Array.isArray(body.perks)) return 'Perks must be an array.';
    if ((body.perks as unknown[]).length > 10) return 'Maximum 10 perks allowed.';
  }

  // phone format (optional)
  if (body.phone && typeof body.phone === 'string') {
    const phoneDigits = body.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      return 'Phone number must be 10–13 digits.';
    }
  }

  return null;
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('start_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(jobs || []);
  } catch (err: unknown) {
    console.error('Jobs GET error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Authenticate via getUser() — never trust getSession() alone
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to post a job.' },
        { status: 401 }
      );
    }

    // Verify user has dealer or admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, name, rating')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 401 });
    }

    if (!['dealer', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Only dealers can post jobs. Update your account role in settings.' },
        { status: 403 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'You have posted too many jobs. Please wait before posting again.' },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    // Validate
    const validationError = validateJobBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Build insert payload — never trust dealer_id, dealer_name, dealer_rating from body
    const insertPayload = {
      title: String(body.title).trim(),
      category: String(body.category),
      category_display: body.category_display ? String(body.category_display) : String(body.category),
      dealer_id: user.id,                     // always from auth
      dealer_name: profile.name,              // always from profile
      dealer_rating: Number(profile.rating) || 5.0,  // always from profile
      image_url: body.image_url
        ? String(body.image_url)
        : 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      pay: String(body.pay),
      pay_type: body.pay_type ? String(body.pay_type) : 'Per Shift',
      raw_pay: Number(body.raw_pay),
      venue_name: body.venue_name ? String(body.venue_name) : null,
      location: String(body.location),
      lat: body.lat != null ? Number(body.lat) : null,
      lng: body.lng != null ? Number(body.lng) : null,
      date: body.date ? String(body.date) : 'TBD',
      start_at: body.start_at ? new Date(body.start_at as string).toISOString() : new Date().toISOString(),
      end_at: body.end_at ? new Date(body.end_at as string).toISOString() : null,
      time: String(body.time),
      reporting_time: body.reporting_time ? String(body.reporting_time) : null,
      duration_hours: body.duration_hours != null ? Number(body.duration_hours) : null,
      slots_total: Number(body.slots_total) || 1,
      slots_filled: 0,                        // never from body; trigger keeps this accurate
      urgent: Boolean(body.urgent),
      instant_pay: Boolean(body.instant_pay),
      gender_req: body.gender_req ? String(body.gender_req) : 'any',
      perks: Array.isArray(body.perks) ? (body.perks as string[]).slice(0, 10) : [],
      requirements: body.requirements ? String(body.requirements) : null,
      dress_code: body.dress_code ? String(body.dress_code) : null,
      description: body.description ? String(body.description) : null,
      phone: body.phone ? String(body.phone) : null,
      status: 'active' as const,
    };

    const { data: job, error: insertError } = await supabase
      .from('jobs')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json(job, { status: 201 });
  } catch (err: unknown) {
    console.error('Jobs POST error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
