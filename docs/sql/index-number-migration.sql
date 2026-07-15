-- ============================================
-- STUDENT INDEX NUMBER MIGRATION
-- Run this in the Supabase SQL Editor AFTER attendance-migration.sql
-- has already been applied.
--
-- Adds a dedicated Index Number field to profiles (separate from the
-- email-derived matriculation prefix used on the Digital ID card),
-- required for new signups, optional/backfillable for existing users,
-- and surfaced on the attendance check-in list.
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS index_number TEXT;

-- Prevent two accounts from claiming the same index number.
-- (Multiple NULLs are allowed by Postgres unique constraints, so this
-- does not block existing users who haven't set theirs yet.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_index_number_unique'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_index_number_unique UNIQUE (index_number);
    END IF;
END $$;

-- Update the signup trigger to capture index_number from registration metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, index_number)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'index_number'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
