-- ============================================
-- NEW FEATURES MIGRATION
-- Run this in the Supabase SQL Editor AFTER database-setup.sql
-- and fix-rls-policies.sql have already been applied.
--
-- Adds: Courses (shared reference table), Lost & Found,
-- Internship & Job Portal, Anonymous Course Feedback,
-- Academic Resources, and the Emergency Alert flag on posts.
-- ============================================

-- ============================================
-- 1. COURSES (shared reference table)
-- Used by both Course Feedback and Academic Resources.
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,          -- e.g. "CS 301"
    name TEXT NOT NULL,                 -- e.g. "Database Systems"
    department TEXT,
    level TEXT,
    lecturer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view courses"
    ON courses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage courses"
    ON courses FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 2. LOST AND FOUND
-- Students self-report and self-resolve; admins can remove any entry.
-- ============================================
CREATE TABLE IF NOT EXISTS lost_found_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    item_name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact_info TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view lost & found items"
    ON lost_found_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can report lost/found items"
    ON lost_found_items FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporter or admin can update item"
    ON lost_found_items FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = reporter_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Reporter or admin can delete item"
    ON lost_found_items FOR DELETE
    TO authenticated
    USING (
        auth.uid() = reporter_id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 3. INTERNSHIP & JOB PORTAL
-- Admin-posted only (on behalf of companies). Students read-only.
-- ============================================
CREATE TABLE IF NOT EXISTS job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('internship', 'job')),
    description TEXT NOT NULL,
    apply_info TEXT NOT NULL,          -- application link, email, or instructions
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view job listings"
    ON job_listings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage job listings"
    ON job_listings FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 4. ANONYMOUS COURSE FEEDBACK
-- IMPORTANT: no user/student reference column exists on this table,
-- by design, so submissions cannot be traced back to a student —
-- not even by an admin with full database access.
-- ============================================
CREATE TABLE IF NOT EXISTS course_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view course feedback"
    ON course_feedback FOR SELECT
    TO authenticated
    USING (true);

-- Any authenticated student may submit feedback. There is no ownership
-- check on write (and none is possible, since no identity is stored).
CREATE POLICY "Authenticated users can submit course feedback"
    ON course_feedback FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only admins can remove abusive/inappropriate entries (moderation).
CREATE POLICY "Admins can delete course feedback"
    ON course_feedback FOR DELETE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 5. ACADEMIC RESOURCES
-- Notes / past questions / videos, tagged by course, upvotable.
-- ============================================
CREATE TABLE IF NOT EXISTS academic_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('notes', 'past_question', 'video')),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    external_link TEXT,
    upvote_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE academic_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view academic resources"
    ON academic_resources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can upload academic resources"
    ON academic_resources FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploader or admin can delete resource"
    ON academic_resources FOR DELETE
    TO authenticated
    USING (
        auth.uid() = uploaded_by
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE TABLE IF NOT EXISTS resource_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES academic_resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

ALTER TABLE resource_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view upvotes"
    ON resource_upvotes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can upvote"
    ON resource_upvotes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own upvote"
    ON resource_upvotes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Keep upvote_count in sync automatically
CREATE OR REPLACE FUNCTION handle_resource_upvote_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE academic_resources SET upvote_count = upvote_count + 1 WHERE id = NEW.resource_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE academic_resources SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.resource_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_resource_upvote_change ON resource_upvotes;
CREATE TRIGGER on_resource_upvote_change
    AFTER INSERT OR DELETE ON resource_upvotes
    FOR EACH ROW EXECUTE FUNCTION handle_resource_upvote_change();

-- ============================================
-- 6. CAMPUS EMERGENCY ALERT
-- Reuses the existing posts/broadcast system; just adds an urgent flag.
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;

-- ============================================
-- OPTIONAL: seed a few example courses so Feedback/Resources aren't empty.
-- Safe to skip or edit — remove this block if you'd rather add courses
-- manually as an admin.
-- ============================================
INSERT INTO courses (code, name, department, level, lecturer_name) VALUES
    ('CS 101', 'Introduction to Computer Science', 'Computer Science', '100', 'Dr. Mensah'),
    ('CS 301', 'Database Systems', 'Computer Science', '300', 'Dr. Owusu'),
    ('EE 201', 'Circuit Theory', 'Electrical Engineering', '200', 'Prof. Boateng')
ON CONFLICT (code) DO NOTHING;
