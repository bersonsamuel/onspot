-- ============================================================================
-- 20261013000100_fixes.sql  (idempotent; safe to re-run)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COLUMNS
-- ----------------------------------------------------------------------------
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_at   TIMESTAMPTZ;

UPDATE public.jobs
SET start_at = CASE
  WHEN date ~* '^[0-9]{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-9]{4}$'
    THEN to_timestamp(date, 'DD Mon YYYY')
  ELSE created_at
END
WHERE start_at IS NULL;

UPDATE public.jobs
SET end_at = start_at + (duration_hours * INTERVAL '1 hour')
WHERE end_at IS NULL AND duration_hours IS NOT NULL;

ALTER TABLE public.jobs
  ALTER COLUMN start_at SET NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. CHECK CONSTRAINTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS chk_slots_filled_lte_total,
  DROP CONSTRAINT IF EXISTS chk_raw_pay_positive,
  DROP CONSTRAINT IF EXISTS chk_slots_total_positive;

ALTER TABLE public.jobs
  ADD CONSTRAINT chk_slots_filled_lte_total CHECK (slots_filled <= slots_total),
  ADD CONSTRAINT chk_raw_pay_positive       CHECK (raw_pay > 0),
  ADD CONSTRAINT chk_slots_total_positive   CHECK (slots_total > 0);

-- ----------------------------------------------------------------------------
-- 3. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jobs_status_start_at       ON public.jobs(status, start_at);
CREATE INDEX IF NOT EXISTS idx_jobs_dealer_id             ON public.jobs(dealer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id        ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id       ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created      ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON public.notifications(user_id, is_read);

-- ----------------------------------------------------------------------------
-- 4. updated_at TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
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
-- 5. ATOMIC SLOT COUNTING
--    Counted statuses = everything except 'Cancelled' and 'Declined'.
--    Rejects applying to a full or non-active job.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_application_slots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job         RECORD;
  v_old_counted BOOLEAN;
  v_new_counted BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
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

  IF TG_OP = 'UPDATE' THEN
    v_old_counted := OLD.status NOT IN ('Cancelled', 'Declined');
    v_new_counted := NEW.status NOT IN ('Cancelled', 'Declined');

    IF v_old_counted AND NOT v_new_counted THEN
      UPDATE public.jobs
      SET slots_filled = GREATEST(0, slots_filled - 1)
      WHERE id = NEW.job_id;

    ELSIF NOT v_old_counted AND v_new_counted THEN
      SELECT slots_total, slots_filled
      INTO v_job
      FROM public.jobs
      WHERE id = NEW.job_id
      FOR UPDATE;

      IF v_job.slots_filled >= v_job.slots_total THEN
        RAISE EXCEPTION 'All slots for this job are already filled.';
      END IF;

      UPDATE public.jobs
      SET slots_filled = slots_filled + 1
      WHERE id = NEW.job_id;
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.status NOT IN ('Cancelled', 'Declined') THEN
      UPDATE public.jobs
      SET slots_filled = GREATEST(0, slots_filled - 1)
      WHERE id = OLD.job_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_slots ON public.applications;
CREATE TRIGGER trg_application_slots
  AFTER INSERT OR DELETE OR UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_slots();

-- ----------------------------------------------------------------------------
-- 6. COLUMN-FREEZE GUARDS (replaces NEW/OLD checks that are illegal in policies)
-- ----------------------------------------------------------------------------

-- 6a. applications: job_id and user_id can never change
CREATE OR REPLACE FUNCTION public.guard_application_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'job_id and user_id of an application cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_application_update ON public.applications;
CREATE TRIGGER trg_guard_application_update
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_application_update();

-- 6b. messages: only the read flag may change
CREATE OR REPLACE FUNCTION public.guard_message_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.id              IS DISTINCT FROM OLD.id
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.sender_id       IS DISTINCT FROM OLD.sender_id
     OR NEW.receiver_id     IS DISTINCT FROM OLD.receiver_id
     OR NEW.message         IS DISTINCT FROM OLD.message
     OR NEW.created_at      IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the read status of a message can be changed.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_message_update ON public.messages;
CREATE TRIGGER trg_guard_message_update
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.guard_message_update();

-- 6c. notifications: only is_read may change
CREATE OR REPLACE FUNCTION public.guard_notification_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.id         IS DISTINCT FROM OLD.id
     OR NEW.user_id    IS DISTINCT FROM OLD.user_id
     OR NEW.type       IS DISTINCT FROM OLD.type
     OR NEW.title      IS DISTINCT FROM OLD.title
     OR NEW.message    IS DISTINCT FROM OLD.message
     OR NEW.job_id     IS DISTINCT FROM OLD.job_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the read status of a notification can be changed.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_notification_update ON public.notifications;
CREATE TRIGGER trg_guard_notification_update
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.guard_notification_update();

-- 6d. profiles: no self-promotion to admin, no self-edited rating.
--     auth.uid() is NULL for the dashboard / service role, so admins can still be set there.
CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NEW.role = 'admin' AND OLD.role <> 'admin' THEN
      RAISE EXCEPTION 'You cannot promote yourself to admin.';
    END IF;
    IF NEW.rating IS DISTINCT FROM OLD.rating THEN
      RAISE EXCEPTION 'Rating cannot be edited directly.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_promote ON public.profiles;
DROP TRIGGER IF EXISTS trg_guard_profile_update ON public.profiles;
CREATE TRIGGER trg_guard_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_update();

DROP FUNCTION IF EXISTS public.prevent_role_self_promote();

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS: created only by triggers, never by users
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

-- Without this, any logged-in user could call it through the RPC API and spam others
REVOKE ALL ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;

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
        COALESCE(v_profile.name, 'Someone') || ' applied for your job: ' || COALESCE(v_job.title, 'a job'),
        NEW.job_id
      );
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'status_update',
      'Application Update',
      'Your application status changed to: ' || NEW.status,
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

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- 8. handle_new_user: fixed search_path, no admin via signup metadata
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
-- 9. RLS POLICIES (no NEW/OLD here: columns refer to the new row directly)
-- ----------------------------------------------------------------------------

-- 9a. profiles: public sees only safe columns (via view); full row for owner,
--     and for dealers whose jobs the user applied to
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, name, avatar_url, rating, city
  FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own full profile"    ON public.profiles;
DROP POLICY IF EXISTS "Dealers can read applicant profiles"      ON public.profiles;

CREATE POLICY "Users can read their own full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

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

-- 9b. jobs INSERT: must be the dealer themself, with dealer/admin role
DROP POLICY IF EXISTS "Dealers can insert jobs" ON public.jobs;
CREATE POLICY "Dealers can insert jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    auth.uid() = dealer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('dealer', 'admin')
    )
  );

-- 9c. applications UPDATE: two policies. Postgres ORs their WITH CHECKs,
--     so each one must be fully self-contained (incl. ownership).
DROP POLICY IF EXISTS "Users or dealers can update applications"  ON public.applications;
DROP POLICY IF EXISTS "Applicants can cancel own application"     ON public.applications;
DROP POLICY IF EXISTS "Dealers can update application status"     ON public.applications;

CREATE POLICY "Applicants can cancel own application"
  ON public.applications FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('Applied', 'Under Review', 'Accepted')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'Cancelled'
  );

CREATE POLICY "Dealers can update application status"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id AND j.dealer_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('Accepted', 'Declined', 'Completed')
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = applications.job_id AND j.dealer_id = auth.uid()
    )
  );

-- 9d. messages
DROP POLICY IF EXISTS "Users can send messages"                    ON public.messages;
DROP POLICY IF EXISTS "Receivers can update message read status"   ON public.messages;

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND receiver_id IS NOT NULL
    AND receiver_id <> sender_id
  );

CREATE POLICY "Receivers can update message read status"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);   -- column freeze is in guard_message_update()

-- 9e. notifications
DROP POLICY IF EXISTS "Users can update their notifications"      ON public.notifications;
DROP POLICY IF EXISTS "Users can mark their notifications read"   ON public.notifications;

CREATE POLICY "Users can mark their notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);       -- column freeze is in guard_notification_update()

-- ----------------------------------------------------------------------------
-- 10. REALTIME PUBLICATION (idempotent)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['jobs', 'messages', 'applications', 'notifications']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END;
$$;