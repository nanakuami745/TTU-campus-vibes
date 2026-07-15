-- ============================================
-- TTU Campus Vibes - Complete Database Setup
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    department TEXT,
    level TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends')),
    feeling JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FRIENDSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id),
    CHECK (requester_id != receiver_id)
);

-- ============================================
-- 4. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    reference_id UUID,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ============================================
-- 7. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Anyone authenticated can view active profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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
-- POSTS POLICIES
-- ============================================
-- Users can view approved posts, their own posts, and admin posts
CREATE POLICY "Users can view approved posts and own posts"
    ON posts FOR SELECT
    TO authenticated
    USING (
        status = 'approved' OR
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can create posts
CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());

-- Admins can update any post (for moderation)
CREATE POLICY "Admins can update any post"
    ON posts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- FRIENDSHIPS POLICIES
-- ============================================
-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships"
    ON friendships FOR SELECT
    TO authenticated
    USING (
        requester_id = auth.uid() OR
        receiver_id = auth.uid()
    );

-- Users can create friend requests
CREATE POLICY "Users can create friend requests"
    ON friendships FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

-- Users can update friendships they're part of
CREATE POLICY "Users can update own friendships"
    ON friendships FOR UPDATE
    TO authenticated
    USING (
        requester_id = auth.uid() OR
        receiver_id = auth.uid()
    );

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete own friendships"
    ON friendships FOR DELETE
    TO authenticated
    USING (
        requester_id = auth.uid() OR
        receiver_id = auth.uid()
    );

-- ============================================
-- MESSAGES POLICIES
-- ============================================
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() OR
        receiver_id = auth.uid()
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (receiver_id = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Anyone can create notifications
CREATE POLICY "Authenticated users can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- LIKES POLICIES
-- ============================================
-- Users can view all likes
CREATE POLICY "Users can view likes"
    ON likes FOR SELECT
    TO authenticated
    USING (true);

-- Users can create likes
CREATE POLICY "Users can create likes"
    ON likes FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- COMMENTS POLICIES
-- ============================================
-- Users can view all comments
CREATE POLICY "Users can view comments"
    ON comments FOR SELECT
    TO authenticated
    USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    TO authenticated
    USING (author_id = auth.uid());

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================
-- Note: Run these in Supabase Dashboard > Storage
-- Or use the Supabase Dashboard UI to create buckets

-- Create storage buckets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('covers', 'covers', true),
    ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for covers
CREATE POLICY "Cover images are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own cover"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own cover"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for post-media
CREATE POLICY "Post media are publicly accessible"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'post-media');

CREATE POLICY "Users can update their own post media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'post-media');

-- ============================================
-- DONE! 
-- ============================================
-- Next steps:
-- 1. Create admin user manually (see admin-setup.sql)
-- 2. Test student registration
-- 3. Configure email settings in Supabase Auth
