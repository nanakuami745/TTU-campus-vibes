# 🏗️ TTU Campus Vibes - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React + Vite + Tailwind)                 │
│                   Deployed on Netlify                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │  PostgreSQL  │  │   Storage    │     │
│  │              │  │   Database   │  │   Buckets    │     │
│  │ - Login      │  │              │  │              │     │
│  │ - Register   │  │ - 7 Tables   │  │ - avatars    │     │
│  │ - Password   │  │ - RLS        │  │ - covers     │     │
│  │   Reset      │  │ - Triggers   │  │ - post-media │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Application Flow

### 1. User Registration (Students Only)

```
User visits /register
       │
       ▼
Enters email (@ttu.edu.gh)
       │
       ▼
Supabase Auth creates user
       │
       ▼
Trigger auto-creates profile
       │
       ▼
User redirected to /login
```

### 2. User Login

```
User enters credentials
       │
       ▼
Supabase Auth validates
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
   Role Check   Is Active?    Get Profile
       │             │             │
       └─────────────┴─────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    role='admin'           role='student'
         │                       │
         ▼                       ▼
  /admin/dashboard            / (feed)
```

### 3. Post Creation Flow

```
Student creates post
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
  visibility:    visibility:    author:
   'friends'      'public'      'admin'
       │              │              │
       ▼              ▼              ▼
  status:        status:        status:
  'approved'     'pending'      'approved'
       │              │              │
       ▼              ▼              ▼
  Visible to    Waits for      Visible to
   friends       admin          everyone
                    │
                    ▼
              Admin reviews
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
    Approve               Reject
         │                     │
         ▼                     ▼
  status:              status:
  'approved'           'rejected'
         │                     │
         ▼                     ▼
  Visible to           Only author
  everyone             can see
```

### 4. Friend Request Flow

```
User A searches for User B
       │
       ▼
Sends friend request
       │
       ├─────────────────────────┐
       ▼                         ▼
Create friendship          Create notification
status: 'pending'          for User B
requester: User A
receiver: User B
       │
       ▼
User B receives notification
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
   Accept     Decline    Ignore
       │          │
       ▼          ▼
Update to    Delete
'accepted'   friendship
       │
       ▼
Both users are now friends
       │
       ▼
Can see each other's
'friends only' posts
```

---

## Database Schema

### Tables Relationship

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
profiles
    │
    ├─── 1:N ───► posts
    │                │
    │                ├─── 1:N ───► likes
    │                │
    │                └─── 1:N ───► comments
    │
    ├─── N:N ───► friendships
    │              (self-referential)
    │
    ├─── 1:N ───► messages (as sender)
    │
    ├─── 1:N ───► messages (as receiver)
    │
    └─── 1:N ───► notifications
```

### Detailed Schema

```sql
profiles
├── id (UUID, PK, FK to auth.users)
├── email (TEXT, UNIQUE)
├── full_name (TEXT)
├── avatar_url (TEXT)
├── cover_url (TEXT)
├── bio (TEXT)
├── department (TEXT)
├── level (TEXT)
├── role (TEXT: 'student' | 'admin')
├── is_active (BOOLEAN)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

posts
├── id (UUID, PK)
├── author_id (UUID, FK to profiles)
├── content (TEXT)
├── media_url (TEXT)
├── visibility (TEXT: 'public' | 'friends')
├── feeling (JSONB)
├── status (TEXT: 'pending' | 'approved' | 'rejected')
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

friendships
├── id (UUID, PK)
├── requester_id (UUID, FK to profiles)
├── receiver_id (UUID, FK to profiles)
├── status (TEXT: 'pending' | 'accepted')
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

messages
├── id (UUID, PK)
├── sender_id (UUID, FK to profiles)
├── receiver_id (UUID, FK to profiles)
├── content (TEXT)
├── is_read (BOOLEAN)
└── created_at (TIMESTAMPTZ)

notifications
├── id (UUID, PK)
├── user_id (UUID, FK to profiles)
├── sender_id (UUID, FK to profiles)
├── type (TEXT)
├── content (TEXT)
├── reference_id (UUID)
├── post_id (UUID, FK to posts)
├── is_read (BOOLEAN)
└── created_at (TIMESTAMPTZ)

likes
├── id (UUID, PK)
├── post_id (UUID, FK to posts)
├── user_id (UUID, FK to profiles)
└── created_at (TIMESTAMPTZ)

comments
├── id (UUID, PK)
├── post_id (UUID, FK to posts)
├── author_id (UUID, FK to profiles)
├── content (TEXT)
└── created_at (TIMESTAMPTZ)
```

---

## Component Architecture

```
App.jsx (Root)
├── AuthProvider (Context)
│   └── NotificationProvider (Context)
│       └── Routes
│           ├── Public Routes
│           │   ├── /login → Login
│           │   ├── /register → Register
│           │   └── /forgot-password → ForgotPassword
│           │
│           ├── Protected Routes (Student)
│           │   ├── / → Feed
│           │   │   ├── CreatePost
│           │   │   └── PostCard[]
│           │   │
│           │   ├── /network → Network
│           │   │   └── Friend search & requests
│           │   │
│           │   ├── /messages → Messages
│           │   │   └── Conversation list
│           │   │
│           │   ├── /notifications → Notifications
│           │   │   └── NotificationItem[]
│           │   │
│           │   └── /profile/:userId → Profile
│           │       ├── ProfileHeader
│           │       ├── ProfileAbout
│           │       ├── ProfileFriends
│           │       ├── ProfilePhotos
│           │       └── ProfilePosts
│           │
│           └── Protected Routes (Admin)
│               └── /admin → AdminLayout
│                   ├── /dashboard → AdminDashboard
│                   ├── /moderation → AdminModeration
│                   ├── /users → AdminUsers
│                   └── /broadcast → AdminBroadcast
```

---

## Service Layer

```
Services (API Abstraction)
├── postService.js
│   ├── getFeed()
│   ├── createPost()
│   ├── getPostsByUser()
│   ├── toggleLike()
│   ├── getComments()
│   └── addComment()
│
├── profileService.js
│   ├── getProfile()
│   ├── updateProfile()
│   ├── uploadAvatar()
│   └── uploadCover()
│
├── friendService.js
│   ├── searchUsers()
│   ├── getFriendshipStatus()
│   ├── sendRequest()
│   ├── respondToRequest()
│   └── getFriends()
│
├── messageService.js
│   ├── sendMessage()
│   ├── getConversation()
│   ├── getRecentChats()
│   └── markRead()
│
├── notificationService.js
│   ├── getNotifications()
│   ├── createNotification()
│   ├── markAsRead()
│   └── getUnreadCount()
│
└── adminService.js
    ├── getStats()
    ├── getPendingPosts()
    ├── approvePost()
    ├── rejectPost()
    ├── getUsers()
    └── updateUserStatus()
```

---

## Security Architecture

### Row Level Security (RLS)

```
Every table has RLS enabled

profiles:
├── SELECT: Authenticated users can view active profiles
├── UPDATE: Users can update own profile
└── ADMIN: Can view/update all profiles

posts:
├── SELECT: View approved posts OR own posts
├── INSERT: Users can create posts
├── UPDATE: Users can update own posts
└── ADMIN: Can update any post (moderation)

friendships:
├── SELECT: View own friendships
├── INSERT: Create friend requests
└── UPDATE: Update own friendships

messages:
├── SELECT: View own messages
├── INSERT: Send messages
└── UPDATE: Mark own messages as read

notifications:
├── SELECT: View own notifications
├── INSERT: Anyone can create
└── UPDATE: Update own notifications

likes:
├── SELECT: View all likes
├── INSERT: Create likes
└── DELETE: Delete own likes

comments:
├── SELECT: View all comments
├── INSERT: Create comments
└── UPDATE/DELETE: Own comments only
```

### Authentication Flow

```
1. User submits credentials
        ↓
2. Supabase Auth validates
        ↓
3. JWT token generated
        ↓
4. Token stored in browser
        ↓
5. Token sent with every request
        ↓
6. RLS policies check token
        ↓
7. Access granted/denied
```

---

## Data Flow Examples

### Example 1: Creating a Post

```
1. User clicks "Create Post"
2. CreatePost component renders
3. User types content, selects visibility
4. User clicks "Post"
5. postService.createPost() called
6. Service checks user role
7. Sets status based on role + visibility
8. Inserts into posts table
9. RLS policy validates
10. Post created
11. UI updates with new post
```

### Example 2: Sending a Friend Request

```
1. User searches for another user
2. friendService.searchUsers() called
3. Results displayed
4. User clicks "Add Friend"
5. friendService.sendRequest() called
6. Friendship record created (status: pending)
7. notificationService.createNotification() called
8. Notification created for receiver
9. UI updates button to "Request Sent"
10. Receiver sees notification
```

### Example 3: Admin Moderating a Post

```
1. Admin logs in
2. Redirected to /admin/dashboard
3. Sees pending posts count
4. Clicks "Moderation"
5. adminService.getPendingPosts() called
6. List of pending posts displayed
7. Admin clicks "Approve" on a post
8. adminService.approvePost() called
9. Post status updated to 'approved'
10. Post now visible to all users
11. Author receives notification
```

---

## Storage Architecture

```
Supabase Storage
├── avatars/
│   └── {user_id}/
│       └── avatar-{random}.{ext}
│
├── covers/
│   └── {user_id}/
│       └── cover-{random}.{ext}
│
└── post-media/
    └── {user_id}-{random}.{ext}

All buckets are PUBLIC
Access controlled by RLS policies
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│            GitHub Repository             │
│         (Version Control)                │
└─────────────────────────────────────────┘
                  │
                  │ Push
                  ▼
┌─────────────────────────────────────────┐
│              Netlify                     │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  Build Process                 │    │
│  │  1. npm install                │    │
│  │  2. npm run build              │    │
│  │  3. Deploy dist/ folder        │    │
│  └────────────────────────────────┘    │
│                                          │
│  Environment Variables:                 │
│  - VITE_SUPABASE_URL                   │
│  - VITE_SUPABASE_ANON_KEY              │
└─────────────────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────┐
│            Supabase Cloud                │
│  (Database + Auth + Storage)            │
└─────────────────────────────────────────┘
```

---

## Performance Considerations

### Database Indexes

```sql
-- Indexes created for fast queries
idx_posts_author      → Fast author lookup
idx_posts_status      → Fast status filtering
idx_posts_created     → Fast chronological sorting
idx_friendships_*     → Fast friendship queries
idx_messages_*        → Fast message queries
idx_notifications_*   → Fast notification queries
```

### Caching Strategy

```
1. Auth state cached in React Context
2. Profile data cached in React Context
3. Supabase client caches auth tokens
4. Browser caches static assets
5. CDN caches images from storage
```

---

## Scalability

### Current Capacity
- **Users:** Unlimited (Supabase scales automatically)
- **Storage:** 1GB free tier (upgradeable)
- **Database:** 500MB free tier (upgradeable)
- **Bandwidth:** 2GB free tier (upgradeable)

### Scaling Strategy
```
Phase 1: Free tier (0-100 users)
Phase 2: Pro tier ($25/mo) (100-10,000 users)
Phase 3: Team tier ($599/mo) (10,000+ users)
Phase 4: Enterprise (Custom pricing)
```

---

## Monitoring & Logging

```
Supabase Dashboard
├── Logs
│   ├── Database logs
│   ├── Auth logs
│   └── Storage logs
│
├── Metrics
│   ├── API requests
│   ├── Database queries
│   └── Storage usage
│
└── Alerts
    ├── Error rate
    ├── Response time
    └── Resource usage
```

---

This architecture provides a solid foundation for a production-ready social network platform! 🚀
