-- ============================================
-- USEFUL SQL QUERIES FOR TTU CAMPUS VIBES
-- ============================================
-- Copy and paste these into Supabase SQL Editor
-- ============================================

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- View all users with their roles
SELECT 
    id,
    email,
    full_name,
    role,
    department,
    level,
    is_active,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Count users by role
SELECT 
    role,
    COUNT(*) as count
FROM profiles
GROUP BY role;

-- Find specific user by email
SELECT * FROM profiles 
WHERE email = 'student@ttu.edu.gh';

-- View all admins
SELECT 
    email,
    full_name,
    created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- View all students
SELECT 
    email,
    full_name,
    department,
    level,
    created_at
FROM profiles
WHERE role = 'student'
ORDER BY created_at DESC;

-- View inactive users
SELECT 
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE is_active = false;

-- Promote user to admin
UPDATE profiles 
SET role = 'admin'
WHERE email = 'user@ttu.edu.gh';

-- Demote admin to student
UPDATE profiles 
SET role = 'student'
WHERE email = 'admin@ttu.edu.gh';

-- Deactivate user
UPDATE profiles 
SET is_active = false
WHERE email = 'user@ttu.edu.gh';

-- Reactivate user
UPDATE profiles 
SET is_active = true
WHERE email = 'user@ttu.edu.gh';

-- Delete user (careful!)
DELETE FROM profiles 
WHERE email = 'user@ttu.edu.gh';

-- ============================================
-- POST MANAGEMENT
-- ============================================

-- View all posts with author info
SELECT 
    p.id,
    p.content,
    p.visibility,
    p.status,
    pr.full_name as author,
    pr.email as author_email,
    p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC;

-- View pending posts (for moderation)
SELECT 
    p.id,
    p.content,
    p.visibility,
    pr.full_name as author,
    pr.email as author_email,
    p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- View approved posts
SELECT 
    p.id,
    p.content,
    pr.full_name as author,
    p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'approved'
ORDER BY p.created_at DESC;

-- View rejected posts
SELECT 
    p.id,
    p.content,
    pr.full_name as author,
    p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'rejected'
ORDER BY p.created_at DESC;

-- Count posts by status
SELECT 
    status,
    COUNT(*) as count
FROM posts
GROUP BY status;

-- Count posts by visibility
SELECT 
    visibility,
    COUNT(*) as count
FROM posts
GROUP BY visibility;

-- View posts by specific user
SELECT 
    content,
    visibility,
    status,
    created_at
FROM posts
WHERE author_id = (
    SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh'
)
ORDER BY created_at DESC;

-- Approve a post
UPDATE posts 
SET status = 'approved'
WHERE id = 'post-id-here';

-- Reject a post
UPDATE posts 
SET status = 'rejected'
WHERE id = 'post-id-here';

-- Delete a post
DELETE FROM posts 
WHERE id = 'post-id-here';

-- View posts with like and comment counts
SELECT 
    p.id,
    p.content,
    pr.full_name as author,
    COUNT(DISTINCT l.id) as likes_count,
    COUNT(DISTINCT c.id) as comments_count,
    p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, pr.full_name
ORDER BY p.created_at DESC;

-- ============================================
-- FRIENDSHIP MANAGEMENT
-- ============================================

-- View all friendships
SELECT 
    f.id,
    pr1.full_name as requester,
    pr1.email as requester_email,
    pr2.full_name as receiver,
    pr2.email as receiver_email,
    f.status,
    f.created_at
FROM friendships f
JOIN profiles pr1 ON f.requester_id = pr1.id
JOIN profiles pr2 ON f.receiver_id = pr2.id
ORDER BY f.created_at DESC;

-- View pending friend requests
SELECT 
    f.id,
    pr1.full_name as requester,
    pr2.full_name as receiver,
    f.created_at
FROM friendships f
JOIN profiles pr1 ON f.requester_id = pr1.id
JOIN profiles pr2 ON f.receiver_id = pr2.id
WHERE f.status = 'pending'
ORDER BY f.created_at DESC;

-- View accepted friendships
SELECT 
    f.id,
    pr1.full_name as user1,
    pr2.full_name as user2,
    f.created_at
FROM friendships f
JOIN profiles pr1 ON f.requester_id = pr1.id
JOIN profiles pr2 ON f.receiver_id = pr2.id
WHERE f.status = 'accepted'
ORDER BY f.created_at DESC;

-- Count friendships by status
SELECT 
    status,
    COUNT(*) as count
FROM friendships
GROUP BY status;

-- View friends of a specific user
SELECT 
    CASE 
        WHEN f.requester_id = (SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh')
        THEN pr2.full_name
        ELSE pr1.full_name
    END as friend_name,
    CASE 
        WHEN f.requester_id = (SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh')
        THEN pr2.email
        ELSE pr1.email
    END as friend_email
FROM friendships f
JOIN profiles pr1 ON f.requester_id = pr1.id
JOIN profiles pr2 ON f.receiver_id = pr2.id
WHERE f.status = 'accepted'
AND (
    f.requester_id = (SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh')
    OR f.receiver_id = (SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh')
);

-- Delete a friendship
DELETE FROM friendships 
WHERE id = 'friendship-id-here';

-- ============================================
-- MESSAGE MANAGEMENT
-- ============================================

-- View all messages
SELECT 
    m.id,
    ps.full_name as sender,
    pr.full_name as receiver,
    m.content,
    m.is_read,
    m.created_at
FROM messages m
JOIN profiles ps ON m.sender_id = ps.id
JOIN profiles pr ON m.receiver_id = pr.id
ORDER BY m.created_at DESC;

-- View unread messages
SELECT 
    m.id,
    ps.full_name as sender,
    pr.full_name as receiver,
    m.content,
    m.created_at
FROM messages m
JOIN profiles ps ON m.sender_id = ps.id
JOIN profiles pr ON m.receiver_id = pr.id
WHERE m.is_read = false
ORDER BY m.created_at DESC;

-- View conversation between two users
SELECT 
    ps.full_name as sender,
    pr.full_name as receiver,
    m.content,
    m.created_at
FROM messages m
JOIN profiles ps ON m.sender_id = ps.id
JOIN profiles pr ON m.receiver_id = pr.id
WHERE (
    (m.sender_id = 'user1-id' AND m.receiver_id = 'user2-id')
    OR (m.sender_id = 'user2-id' AND m.receiver_id = 'user1-id')
)
ORDER BY m.created_at ASC;

-- Count messages by read status
SELECT 
    is_read,
    COUNT(*) as count
FROM messages
GROUP BY is_read;

-- Mark message as read
UPDATE messages 
SET is_read = true
WHERE id = 'message-id-here';

-- Delete a message
DELETE FROM messages 
WHERE id = 'message-id-here';

-- ============================================
-- NOTIFICATION MANAGEMENT
-- ============================================

-- View all notifications
SELECT 
    n.id,
    pr.full_name as recipient,
    ps.full_name as sender,
    n.type,
    n.content,
    n.is_read,
    n.created_at
FROM notifications n
JOIN profiles pr ON n.user_id = pr.id
LEFT JOIN profiles ps ON n.sender_id = ps.id
ORDER BY n.created_at DESC;

-- View unread notifications
SELECT 
    n.id,
    pr.full_name as recipient,
    ps.full_name as sender,
    n.type,
    n.content,
    n.created_at
FROM notifications n
JOIN profiles pr ON n.user_id = pr.id
LEFT JOIN profiles ps ON n.sender_id = ps.id
WHERE n.is_read = false
ORDER BY n.created_at DESC;

-- Count notifications by type
SELECT 
    type,
    COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- Count notifications by read status
SELECT 
    is_read,
    COUNT(*) as count
FROM notifications
GROUP BY is_read;

-- Mark notification as read
UPDATE notifications 
SET is_read = true
WHERE id = 'notification-id-here';

-- Mark all notifications as read for a user
UPDATE notifications 
SET is_read = true
WHERE user_id = (SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh')
AND is_read = false;

-- Delete old read notifications (cleanup)
DELETE FROM notifications 
WHERE is_read = true 
AND created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- LIKES & COMMENTS
-- ============================================

-- View posts with most likes
SELECT 
    p.content,
    pr.full_name as author,
    COUNT(l.id) as likes_count
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
LEFT JOIN likes l ON p.id = l.post_id
GROUP BY p.id, pr.full_name
ORDER BY likes_count DESC
LIMIT 10;

-- View posts with most comments
SELECT 
    p.content,
    pr.full_name as author,
    COUNT(c.id) as comments_count
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, pr.full_name
ORDER BY comments_count DESC
LIMIT 10;

-- View all comments on a post
SELECT 
    c.content,
    pr.full_name as author,
    c.created_at
FROM comments c
JOIN profiles pr ON c.author_id = pr.id
WHERE c.post_id = 'post-id-here'
ORDER BY c.created_at ASC;

-- View who liked a post
SELECT 
    pr.full_name,
    pr.email,
    l.created_at
FROM likes l
JOIN profiles pr ON l.user_id = pr.id
WHERE l.post_id = 'post-id-here'
ORDER BY l.created_at DESC;

-- ============================================
-- STATISTICS & ANALYTICS
-- ============================================

-- Overall platform stats
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM posts) as total_posts,
    (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_posts,
    (SELECT COUNT(*) FROM friendships WHERE status = 'accepted') as total_friendships,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM notifications WHERE is_read = false) as unread_notifications;

-- Most active users (by post count)
SELECT 
    pr.full_name,
    pr.email,
    COUNT(p.id) as post_count
FROM profiles pr
LEFT JOIN posts p ON pr.id = p.author_id
GROUP BY pr.id
ORDER BY post_count DESC
LIMIT 10;

-- Most popular users (by friend count)
SELECT 
    pr.full_name,
    pr.email,
    COUNT(f.id) as friend_count
FROM profiles pr
LEFT JOIN friendships f ON (pr.id = f.requester_id OR pr.id = f.receiver_id)
WHERE f.status = 'accepted'
GROUP BY pr.id
ORDER BY friend_count DESC
LIMIT 10;

-- Daily post count (last 7 days)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as post_count
FROM posts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Daily registration count (last 7 days)
SELECT 
    DATE(created_at) as date,
    COUNT(*) as registration_count
FROM profiles
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Posts by department
SELECT 
    pr.department,
    COUNT(p.id) as post_count
FROM profiles pr
LEFT JOIN posts p ON pr.id = p.author_id
WHERE pr.department IS NOT NULL
GROUP BY pr.department
ORDER BY post_count DESC;

-- ============================================
-- MAINTENANCE & CLEANUP
-- ============================================

-- Find orphaned records (shouldn't exist with proper FK constraints)
-- But useful for debugging

-- Posts without authors (shouldn't exist)
SELECT * FROM posts 
WHERE author_id NOT IN (SELECT id FROM profiles);

-- Likes on non-existent posts (shouldn't exist)
SELECT * FROM likes 
WHERE post_id NOT IN (SELECT id FROM posts);

-- Comments on non-existent posts (shouldn't exist)
SELECT * FROM comments 
WHERE post_id NOT IN (SELECT id FROM posts);

-- Notifications for non-existent users (shouldn't exist)
SELECT * FROM notifications 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Clean up old rejected posts (optional)
DELETE FROM posts 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '90 days';

-- Clean up old read notifications (optional)
DELETE FROM notifications 
WHERE is_read = true 
AND created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- BACKUP & EXPORT
-- ============================================

-- Export all users to CSV (run in SQL Editor, then download)
SELECT 
    email,
    full_name,
    role,
    department,
    level,
    is_active,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Export all posts to CSV
SELECT 
    p.content,
    pr.full_name as author,
    pr.email as author_email,
    p.visibility,
    p.status,
    p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC;

-- ============================================
-- TESTING QUERIES
-- ============================================

-- Create test student
-- (Do this via Supabase Auth UI, then profile is auto-created)

-- Create test friendship
INSERT INTO friendships (requester_id, receiver_id, status)
VALUES (
    (SELECT id FROM profiles WHERE email = 'student1@ttu.edu.gh'),
    (SELECT id FROM profiles WHERE email = 'student2@ttu.edu.gh'),
    'accepted'
);

-- Create test post
INSERT INTO posts (author_id, content, visibility, status)
VALUES (
    (SELECT id FROM profiles WHERE email = 'student@ttu.edu.gh'),
    'This is a test post!',
    'public',
    'approved'
);

-- Create test notification
INSERT INTO notifications (user_id, sender_id, type, content)
VALUES (
    (SELECT id FROM profiles WHERE email = 'student1@ttu.edu.gh'),
    (SELECT id FROM profiles WHERE email = 'student2@ttu.edu.gh'),
    'friend_request',
    'sent you a friend request'
);

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- View all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- END OF USEFUL QUERIES
-- ============================================
