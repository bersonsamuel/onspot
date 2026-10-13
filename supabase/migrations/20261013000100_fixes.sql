-- ============================================================================
-- ONSPOT DATABASE FIXES MIGRATION
-- Migration: 20261013000100_fixes.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD MISSING notes COLUMN TO applications
-- ----------------------------------------------------------------------------
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ----------------------------------------------------------------------------
-- 2. ADD start_at / end_at TO jobs; BACKFILL; DROP date_type AS STORED VALUE
-- ----------------------------------------------------------------------------
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_at   TIMESTAMPTZ;

-- Backfill: attempt to parse the existing `date` text into a real timestamp.
-- We fall back to created_at when parsing fails (e.g. "Today, 12 Oct").
UPDATE public.jobs
SET start_at = COALESCE(
    -- try ISO-like "DD Mon YYYY" format
    to_timestamp(date, 'DD Mon YYYY')::TIMESTAMPTZ,
    created_at
)
WHERE start_at IS NULL;

UPDATE public.jobs
SET end_at = NULL   -- will be derived from start_at + duration_hours in the UI
WHERE end_at IS NULL AND duration_hours IS NULL;

-- Make start_at NOT NULL after backfill
ALTER TABLE public.jobs
  ALTER COLUMN start_at SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. CHECK CONSTRAINTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS chk_slots_filled_lte_total,
  DROP CONSTRAINT IF EXISTS chk_raw_pay_positive,
  DROP CONSTRAINT IF EXISTS chk_slots_total_positive;

ALTER TABLE public.jobs
  ADD CONSTRAINT chk_slots_filled_lte_total CHECK (slots_filled <= slots_total),
  ADD CONSTRAINT chk_raw_pay_positive        CHECK (raw_pay > 0),
  ADD CONSTRAINT chk_slots_total_positive    CHECK (slots_total > 0);

-- ----------------------------------------------------------------------------
-- 4. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jobs_status_start_at        ON public.jobs(status, start_at);
CREATE INDEX IF NOT EXISTS idx_jobs_dealer_id              ON public.jobs(dealer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id         ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id        ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created       ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read  ON public.notifications(user_id, is_read);

-- ----------------------------------------------------------------------------
-- 5. updated_at TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ATOMIC SLOT COUNTING via trigger (AFTER INSERT/DELETE on applications)
--    Also rejects applying to a full or non-active job.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_application_slots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Re-read the job under lock to guard against race
    SELECT status, slots_total, slots_filled
    INTO v_job
    FROM public.jobs
    WHERE id = NEW.job_id
    FOR UPDATE;

    IF v_job.status <> 'active' THEN
      RAISE EXCEPTION 'This job is no longer accepting applications.';
    END IF;

    IF v_job.slots_filled >= v_job.slots_total THEN
      RAISE EXCEPTION 'All slots for this job are already filled.';
    END IF;

    UPDATE public.jobs
    SET slots_filled = slots_filled + 1
    WHERE id = NEW.job_id;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.jobs
    SET slots_filled = GREATEST(0, slots_filled - 1)
    WHERE id = OLD.job_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_slots ON public.applications;
CREATE TRIGGER trg_application_slots
  AFTER INSERT OR DELETE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_slots();

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS via SECURITY DEFINER function
--    (called from trigger; direct INSERT from users is blocked by RLS)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type    TEXT,
  p_title   TEXT,
  p_message TEXT,
  p_job_id  UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, job_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_job_id);
END;
$$;

-- Trigger: notify dealer on new application
CREATE OR REPLACE FUNCTION public.handle_notify_on_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job     RECORD;
  v_profile RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT dealer_id, title INTO v_job FROM public.jobs WHERE id = NEW.job_id;
    SELECT name INTO v_profile FROM public.profiles WHERE id = NEW.user_id;

    IF v_job.dealer_id IS NOT NULL THEN
      PERFORM public.create_notification(
        v_job.dealer_id,
        'new_application',
        'New Application Received',
        (COALESCE(v_profile.name, 'Someone') || ' applied for your job: ' || COALESCE(v_job.title, 'a job')),
        NEW.job_id
      );
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'status_update',
      'Application Update',
      ('Your application status changed to: ' || NEW.status),
      NEW.job_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application ON public.applications;
CREATE TRIGGER trg_notify_application
  AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_notify_on_application();

-- Block direct INSERT into notifications from regular users
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (false);  -- only SECURITY DEFINER functions can insert

-- ----------------------------------------------------------------------------
-- 8. FIX handle_new_user: add SET search_path and cap role at non-admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Prevent self-promotion to admin via signup metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'seeker');
  IF v_role NOT IN ('seeker', 'dealer') THEN
    v_role := 'seeker';
  END IF;

  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. IMPROVED RLS POLICIES
-- ----------------------------------------------------------------------------

-- 9a. profiles: restrict public read to safe columns only via a view
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, name, avatar_url, rating, city
  FROM public.profiles;

-- Drop & recreate the overly permissive public read policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Public: only non-sensitive columns; done via the view above.
-- Authenticated users can read their own full row.
CREATE POLICY "Users can read their own full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Dealers can see full profiles of users who applied to their jobs
CREATE POLICY "Dealers can read applicant profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.user_id = profiles.id
        AND j.dealer_id = auth.uid()
    )
  );

-- Block self-role promotion trigger
CREATE OR REPLACE FUNCTION public.prevent_role_self_promote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Allow only seeker <-> dealer; never allow setting admin
  IF NEW.role = 'admin' AND OLD.role <> 'admin' THEN
    RAISE EXCEPTION 'You cannot promote yourself to admin.';
  END IF;
  -- Non-admin users cannot change their own role
  IF auth.uid() = NEW.id AND NEW.role <> OLD.role THEN
    RAISE EXCEPTION 'You cannot change your own role.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_promote ON public.profiles;
CREATE TRIGGER trg_prevent_role_self_promote
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_promote();

-- 9b. jobs INSERT: only authenticated dealers/seekers (role checked server-side)
DROP POLICY IF EXISTS "Dealers can insert jobs" ON public.jobs;
CREATE POLICY "Dealers can insert jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = dealer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('dealer', 'admin')
    )
  );

-- 9c. applications: split UPDATE into two policies
DROP POLICY IF EXISTS "Users or dealers can update applications" ON public.applications;

-- Applicants may only cancel their own pending application
CREATE POLICY "Applicants can cancel own application"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND NEW.status = 'Cancelled'
    AND NEW.job_id = OLD.job_id
    AND NEW.user_id = OLD.user_id
  );

-- Dealers can accept/decline/complete applications for their jobs
CREATE POLICY "Dealers can update application status"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
        AND jobs.dealer_id = auth.uid()
    )
  )
  WITH CHECK (
    NEW.status IN ('Accepted', 'Declined', 'Completed')
    AND NEW.job_id = OLD.job_id
    AND NEW.user_id = OLD.user_id
  );

-- 9d. messages: require receiver_id; sender/receiver check on INSERT; UPDATE only for read flag by receiver
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND receiver_id IS NOT NULL
    AND (
      auth.uid() = sender_id OR auth.uid() = receiver_id
    )
  );

DROP POLICY IF EXISTS "Receivers can update message read status" ON public.messages;
CREATE POLICY "Receivers can update message read status"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (
    auth.uid() = receiver_id
    AND NEW.read = true
    AND NEW.message = OLD.message
    AND NEW.sender_id = OLD.sender_id
    AND NEW.receiver_id = OLD.receiver_id
    AND NEW.conversation_id = OLD.conversation_id
  );

-- 9e. notifications: users can only read/mark-read their own; no direct insert
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can mark their notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND NEW.is_read = true
    AND NEW.user_id = OLD.user_id
    AND NEW.type = OLD.type
    AND NEW.title = OLD.title
    AND NEW.message = OLD.message
  );

-- ----------------------------------------------------------------------------
-- 10. Make ALTER PUBLICATION idempotent (safe re-runs)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Add tables to realtime only if not already members
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END;
$$;
-- ----------------------------------------------------------------------------
-- 11. ADD wallet_balance TO profiles (escrow balance in INR)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (wallet_balance >= 0);
