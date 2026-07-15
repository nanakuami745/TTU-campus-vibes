-- ============================================
-- COURSE GROUPS MIGRATION
-- Run this in the Supabase SQL Editor AFTER
-- marketplace-migration.sql has already been applied.
--
-- Unlike the earlier "Groups" concept (department-wide, admin-only,
-- automatic membership), these are scoped to a specific COURSE and
-- can be created by either an admin or a Class Rep assigned to that
-- course. Since there's no course-enrollment data in this schema,
-- membership is opt-in (students discover and join), not automatic.
-- ============================================

-- ============================================
-- 1. COURSE GROUPS
-- ============================================
CREATE TABLE IF NOT EXISTS course_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    pinned_announcement TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view course groups"
    ON course_groups FOR SELECT
    TO authenticated
    USING (true);

-- Only a Class Rep assigned to this specific course, or an admin, may create its group.
CREATE POLICY "Class reps or admins can create a course group"
    ON course_groups FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid()
        AND (
            EXISTS (SELECT 1 FROM class_reps WHERE user_id = auth.uid() AND course_id = course_groups.course_id)
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY "Creating rep or admin can manage the group"
    ON course_groups FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM class_reps WHERE user_id = auth.uid() AND course_id = course_groups.course_id)
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Creating rep or admin can delete the group"
    ON course_groups FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM class_reps WHERE user_id = auth.uid() AND course_id = course_groups.course_id)
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 2. MEMBERSHIP (self-join — students discover and join)
-- ============================================
CREATE TABLE IF NOT EXISTS course_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

ALTER TABLE course_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view group membership"
    ON course_group_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can join/leave for themselves"
    ON course_group_members FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- 3. EXTEND POSTS — reuse the feed for course group discussions
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS course_group_id UUID REFERENCES course_groups(id) ON DELETE CASCADE;

-- Server-enforced: only group members (or an admin) may post into a course group.
CREATE OR REPLACE FUNCTION validate_course_group_post()
RETURNS TRIGGER AS $$
DECLARE
    is_member BOOLEAN;
    author_is_admin BOOLEAN;
BEGIN
    IF NEW.course_group_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM course_group_members
            WHERE group_id = NEW.course_group_id AND user_id = NEW.author_id
        ) INTO is_member;

        SELECT EXISTS(SELECT 1 FROM profiles WHERE id = NEW.author_id AND role = 'admin') INTO author_is_admin;

        IF NOT is_member AND NOT author_is_admin THEN
            RAISE EXCEPTION 'You must join this course group before posting in it';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS before_course_group_post ON posts;
CREATE TRIGGER before_course_group_post
    BEFORE INSERT ON posts
    FOR EACH ROW EXECUTE FUNCTION validate_course_group_post();
