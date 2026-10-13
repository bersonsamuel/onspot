import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/** Simple in-memory rate limiter: max 5 applications per user per minute */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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
        { error: 'You must be signed in to apply for a shift.' },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const jobId = body.job_id;
    if (typeof jobId !== 'string' || !isUUID(jobId)) {
      return NextResponse.json({ error: 'A valid job_id is required.' }, { status: 400 });
    }

    const notes = typeof body.notes === 'string' ? body.notes.slice(0, 1000) : null;

    // Verify the job exists and is active (the DB trigger will also check, but give friendly error first)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, slots_filled, slots_total')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications.' },
        { status: 409 }
      );
    }

    if (job.slots_filled >= job.slots_total) {
      return NextResponse.json(
        { error: 'All slots for this job are already filled.' },
        { status: 409 }
      );
    }

    // Check for duplicate application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied for this shift.' },
        { status: 409 }
      );
    }

    // Insert the application (slots_filled is updated atomically by DB trigger)
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        user_id: user.id,   // always from authenticated user, never from body
        status: 'Applied',
        notes,
      })
      .select()
      .single();

    if (insertError) {
      // Duplicate key constraint (race condition)
      if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already applied for this shift.' },
          { status: 409 }
        );
      }
      // Trigger rejection (full slots, inactive job)
      if (insertError.message.includes('no longer accepting') || insertError.message.includes('slots')) {
        return NextResponse.json({ error: insertError.message }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json(application, { status: 201 });
  } catch (err: unknown) {
    console.error('Applications API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
