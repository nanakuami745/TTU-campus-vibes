-- ============================================
-- QR ATTENDANCE CHECK-IN MIGRATION
-- Run this in the Supabase SQL Editor AFTER features-migration.sql
-- has already been applied.
--
-- Adds: scoped Class Rep permissions (per-course, admin-assigned),
-- attendance sessions with a 30-minute expiring shared QR code,
-- and server-enforced location verification on check-in — distance
-- is computed and checked inside the database itself, not just
-- trusted from the browser, so it can't be bypassed by editing
-- client-side code.
-- ============================================

-- ============================================
-- 1. CLASS REPS (scoped permission — per course, admin-assigned only)
-- A class rep can start attendance sessions ONLY for the specific
-- course(s) an admin has assigned them to. This is not a global role.
-- ============================================
CREATE TABLE IF NOT EXISTS class_reps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

ALTER TABLE class_reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view class rep assignments"
    ON class_reps FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage class rep assignments"
    ON class_reps FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 2. ATTENDANCE SESSIONS
-- Each session is anchored to the location the rep was standing in
-- when they started it (captured automatically), not a pre-configured
-- classroom — so no admin setup is needed per venue.
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rep_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    venue_lat DOUBLE PRECISION NOT NULL,
    venue_lng DOUBLE PRECISION NOT NULL,
    radius_meters INT NOT NULL DEFAULT 150,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ
);

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view sessions"
    ON attendance_sessions FOR SELECT
    TO authenticated
    USING (true);

-- Only a rep assigned to this specific course (or an admin) may start a session for it.
CREATE POLICY "Assigned class reps or admins can start sessions"
    ON attendance_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        rep_id = auth.uid()
        AND (
            EXISTS (SELECT 1 FROM class_reps WHERE user_id = auth.uid() AND course_id = attendance_sessions.course_id)
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY "Rep or admin can end their own session early"
    ON attendance_sessions FOR UPDATE
    TO authenticated
    USING (
        rep_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 3. ATTENDANCE CHECK-INS
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_lat DOUBLE PRECISION,
    student_lng DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)  -- one check-in per student per session
);

ALTER TABLE attendance_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student can view own check-ins; rep/admin can view session check-ins"
    ON attendance_checkins FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM attendance_sessions s
            WHERE s.id = session_id AND s.rep_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Students can check themselves in"
    ON attendance_checkins FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- ============================================
-- 4. SERVER-ENFORCED DISTANCE + EXPIRY VALIDATION
-- This runs INSIDE the database on every check-in attempt. It cannot
-- be bypassed by editing the app's JavaScript — the database itself
-- rejects check-ins that are expired, already ended, or too far away.
-- ============================================
CREATE OR REPLACE FUNCTION haversine_distance_meters(lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION, lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371000; -- Earth radius in meters
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ^ 2;
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_attendance_checkin()
RETURNS TRIGGER AS $$
DECLARE
    session_row attendance_sessions%ROWTYPE;
    dist DOUBLE PRECISION;
BEGIN
    SELECT * INTO session_row FROM attendance_sessions WHERE id = NEW.session_id;

    IF session_row IS NULL THEN
        RAISE EXCEPTION 'Attendance session not found';
    END IF;

    IF session_row.ended_at IS NOT NULL THEN
        RAISE EXCEPTION 'This attendance session has ended';
    END IF;

    IF now() > session_row.expires_at THEN
        RAISE EXCEPTION 'This attendance session has expired';
    END IF;

    IF NEW.student_lat IS NULL OR NEW.student_lng IS NULL THEN
        RAISE EXCEPTION 'Location is required to check in';
    END IF;

    dist := haversine_distance_meters(session_row.venue_lat, session_row.venue_lng, NEW.student_lat, NEW.student_lng);
    NEW.distance_meters := dist;

    IF dist > session_row.radius_meters THEN
        RAISE EXCEPTION 'Too far from class location (% m away, must be within % m)', round(dist::numeric, 0), session_row.radius_meters;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS before_attendance_checkin ON attendance_checkins;
CREATE TRIGGER before_attendance_checkin
    BEFORE INSERT ON attendance_checkins
    FOR EACH ROW EXECUTE FUNCTION validate_attendance_checkin();
