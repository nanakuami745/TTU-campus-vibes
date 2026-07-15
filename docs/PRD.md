# Product Requirements Document (PRD)

## 1. Product Overview

The TTU Campus Social Network is a closed, school-only social platform designed exclusively for Takoradi Technical University (TTU). The product mirrors the core interaction model of Facebook but is tailored for academic community use, moderation, and institutional control.

The platform enables verified TTU students to connect, share updates, communicate, and stay informed about campus-wide announcements, while administrators maintain oversight, moderation, and system integrity.

The system must be production-grade, fully integrated, and data-driven. There must be no dummy data, no mock flows, and no client-side persistence such as localStorage. All state must be server-backed and role-aware.

---

## 2. Goals and Objectives

The primary goals of the platform are:

* Provide a secure, verified social environment for TTU students
* Enable real-time social interaction similar to Facebook (posts, friends, messages, notifications)
* Ensure strong moderation and administrative oversight
* Maintain strict identity verification via institutional email
* Deliver a professional UI that closely matches Facebook’s interaction patterns
* Support scalable deployment and local development without data fragmentation

---

## 3. Target Users

### Students

* Verified TTU students only
* Must register using a valid TTU institutional email
* Can interact socially with peers
* Can control post visibility
* Can communicate privately with friends

### Administrators

* Appointed by the institution
* Cannot self-register
* Have moderation and control privileges
* Can broadcast information to the entire student body

---

## 4. Authentication and Authorization

### Authentication Provider

* Supabase Auth (email + password)
* Password recovery via Supabase email-based reset flow
* Single login form for both admins and students

### Registration Rules

* Only students can register
* Email must strictly match this pattern:

  * `*@ttu.edu.gh`
  * Example: `bcict22101@ttu.edu.gh`
* Email validation must occur both client-side and server-side

### Role Detection

* User roles stored in Supabase (e.g. `student`, `admin`)
* After login, users are redirected automatically based on role
* Unauthorized access to routes must be blocked at both UI and API levels

---

## 5. Student Features

### 5.1 Student Profile Management

Students must be able to:

* Upload and update profile picture
* Update cover photo
* Edit personal details (name, bio, department, level)
* View friend list
* View mutual friends

Profile data must always be fetched from Supabase and rendered dynamically.

---

### 5.2 Posts

#### Post Creation

Students can create text-based and media-supported posts.

When creating a post, the student must select one of the following visibility options:

* Friends Only
* Public

#### Post Behavior

* Friends-only posts:

  * Published immediately
  * Visible only to accepted friends

* Public posts:

  * Submitted for admin review
  * Not visible publicly until approved
  * Status tracked (pending, approved, rejected)

Students must be able to:

* Edit their own posts (before approval for public posts)
* Delete their own posts
* View post status for public submissions

---

### 5.3 Friends System

The platform must support a full Facebook-style friend system.

Students can:

* Search for other students
* Send friend requests
* Accept or decline friend requests
* Remove friends

Friendship is mutual and must be confirmed by both parties.

---

### 5.4 Feed

The student feed must dynamically display:

* Friends-only posts from friends
* Approved public posts
* Admin posts

The feed must be ordered by recency and optimized for performance.

---

### 5.5 Notifications

Students must receive notifications for:

* New friend requests
* Friend request acceptance
* Friends’ new posts
* Admin announcements
* Approved public posts (author notification)

Notifications must be:

* Stored in the database
* Delivered in real time where possible
* Markable as read

---

### 5.6 Messaging

Students can:

* Send direct messages to friends only
* Receive messages in real time
* View conversation history

Messaging must be:

* Secure
* Stored in Supabase
* Accessible across devices

---

## 6. Admin Features

### 6.1 Admin Posting

Admins can:

* Create posts
* All admin posts are public by default
* All students must receive a notification for admin posts

Admin posts bypass review automatically.

---

### 6.2 Post Moderation

Admins can:

* View all pending public posts
* Approve posts (make them publicly visible)
* Reject posts (with optional reason)

Moderation actions must be logged.

---

### 6.3 Student Account Management

Admins can:

* View all registered students
* Deactivate student accounts
* Reactivate student accounts if needed

Deactivated students:

* Cannot log in
* Cannot post or interact
* Retain data for audit purposes

---

## 7. System Architecture

### Frontend

* Deployed on Netlify
* Must be able to run locally using environment variables
* Role-based routing and UI rendering
* UI must visually and interactively mirror Facebook
* No localStorage or client-side persistence

### Backend

* Supabase as primary backend (Auth, Database, Realtime)
* Render used for any required server-side logic or APIs
* GitHub used for version control and CI integration

### Local Development

* Environment-based configuration
* Local Supabase connection support
* Same auth and data rules as production

---

## 8. Data Management

* All data stored in Supabase
* No dummy or seed data in production
* Strict row-level security (RLS)
* Access controlled by role and ownership

---

## 9. Security Requirements

* Supabase Row Level Security enforced everywhere
* Email domain validation
* Role-based access control
* Protected admin routes
* Secure password recovery via Supabase

---

## 10. UI and UX Requirements

* UI must closely replicate Facebook’s layout and interaction patterns
* Professional, production-quality design
* Responsive across devices
* No placeholder or fake content
* Every UI element must reflect real data

---

## 11. Non-Functional Requirements

* High availability
* Scalable architecture
* Fast feed rendering
* Real-time updates for notifications and messages
* Clean, maintainable codebase

---

## 12. Success Metrics

* Successful student registration with TTU email
* Smooth role-based login redirection
* Reliable post moderation flow
* Real-time messaging and notifications
* Zero unauthorized access incidents

---

## 13. Out of Scope (Phase 1)

* External integrations beyond Supabase
* Monetization features
* Non-TTU users
* Mobile native applications

---

## 14. Assumptions

* TTU provides administrative oversight
* Admin accounts are provisioned manually
* MCP servers are pre-configured and available

---

## 15. Future Considerations

* Group creation (clubs, departments)
* Event posting and RSVP
* Media optimization
* Analytics dashboard for admins

---

This PRD defines the functional, technical, and operational requirements for the TTU Campus Social Network and serves as the authoritative reference for design, development, and deployment.
