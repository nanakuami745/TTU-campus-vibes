-- ============================================
-- FIX RLS POLICIES - Run this in Supabase SQL Editor
-- ============================================
-- This fixes the 500 errors by updating RLS policies
-- ============================================

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Drop profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Drop posts policies
DROP POLICY IF EXISTS "Users can view approved posts and own posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Admins can update any post" ON posts;

-- Drop friendships policies
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;

-- Drop messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update received messages" ON messages;

-- Drop notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Drop likes policies
DROP POLICY IF EXISTS "Users can view likes" ON likes;
DROP POLICY IF EXISTS "Users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

-- Drop comments policies
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- ============================================
-- CREATE NEW SIMPLIFIED POLICIES
-- ============================================

-- ============================================
-- PROFILES POLICIES (FIXED)
-- ============================================

-- Anyone authenticated can view all profiles
CREATE POLICY "Anyone can view profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can insert their own profile (for trigger)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- POSTS POLICIES (FIXED)
-- ============================================

-- Users can view approved posts, their own posts, or if they're admin
CREATE POLICY "Users can view posts"
    ON posts FOR SELECT
    TO authenticated
    USING (
        status = 'approved' 
        OR author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can create posts
CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Admins can update any post
CREATE POLICY "Admins can update any post"
    ON posts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- ============================================
-- FRIENDSHIPS POLICIES (FIXED)
-- ============================================

-- Users can view all friendships (needed for friend suggestions)
CREATE POLICY "Users can view friendships"
    ON friendships FOR SELECT
    TO authenticated
    USING (true);

-- Users can create friend requests
CREATE POLICY "Users can create friendships"
    ON friendships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

-- Users can update friendships they're part of
CREATE POLICY "Users can update friendships"
    ON friendships FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = requester_id 
        OR auth.uid() = receiver_id
    );

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete friendships"
    ON friendships FOR DELETE
    TO authenticated
    USING (
        auth.uid() = requester_id 
        OR auth.uid() = receiver_id
    );

-- ============================================
-- MESSAGES POLICIES (FIXED)
-- ============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view messages"
    ON messages FOR SELECT
    TO authenticated
    USING (
        auth.uid() = sender_id 
        OR auth.uid() = receiver_id
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id);

-- Users can delete their own sent messages
CREATE POLICY "Users can delete messages"
    ON messages FOR DELETE
    TO authenticated
    USING (auth.uid() = sender_id);

-- ============================================
-- NOTIFICATIONS POLICIES (FIXED)
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Anyone authenticated can create notifications
CREATE POLICY "Users can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "Users can update notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- LIKES POLICIES (FIXED)
-- ============================================

-- Anyone can view likes
CREATE POLICY "Users can view likes"
    ON likes FOR SELECT
    TO authenticated
    USING (true);

-- Users can create likes
CREATE POLICY "Users can create likes"
    ON likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete likes"
    ON likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS POLICIES (FIXED)
-- ============================================

-- Anyone can view comments
CREATE POLICY "Users can view comments"
    ON comments FOR SELECT
    TO authenticated
    USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Users can update comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete comments"
    ON comments FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check all policies are created
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- DONE!
-- ============================================
-- The 500 errors should now be fixed
-- Refresh your browser to test
