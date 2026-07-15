-- ============================================
-- POST MEDIA TYPE MIGRATION
-- Run this in the Supabase SQL Editor AFTER
-- index-number-migration.sql has already been applied.
--
-- Without this, the app has no reliable way to know whether an
-- uploaded post attachment is an image or a video (it was guessing
-- from the file extension, which broke video playback in the feed).
-- ============================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video'));
