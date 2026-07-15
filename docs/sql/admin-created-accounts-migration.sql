-- ============================================
-- ADMIN-CREATED ACCOUNTS MIGRATION
-- Run this in the Supabase SQL Editor AFTER
-- course-groups-migration.sql has already been applied.
--
-- Extends the signup trigger so accounts created by an admin (via the
-- server-side admin endpoint) can have department/level pre-filled,
-- saving the student that step. Self-registration is unaffected —
-- those fields simply won't be present in that metadata and stay
-- NULL as before, same as today.
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, index_number, department, level)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'index_number',
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'level'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
