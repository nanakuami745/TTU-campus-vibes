# Differentiation Strategy

## The problem

As built, TTU Campus Vibes mirrors Facebook's interaction model closely: posts, friends,
messaging, notifications, profiles. That's a solid technical foundation, but it doesn't
answer the question every final-year project needs to answer — **why would this exist
instead of using Facebook, WhatsApp, or Telegram, which every student already has?**

## The unfair advantage already built in

Every account on this platform is tied to a verified `@ttu.edu.gh` email and a real
academic profile (department, level). General-purpose platforms have no equivalent —
they can't guarantee a user is really a student, let alone which department or level.
The features below all lean into that verified, academically-structured identity, which
is the one thing this platform can do that WhatsApp, Telegram, and Facebook structurally
cannot.

## Proposed features

### 1. Course & Department Hubs
Auto-joined spaces derived from a student's verified department/level, rather than
manually created and joined like a Facebook Group. A department feed, announcements
scoped to a level, and class-rep broadcasts become first-class instead of a workaround.

### 2. Course-Tagged Resource Bank
Students upload notes and past questions tagged to a specific course code. Upvoted by
classmates, filterable by course/level. No general chat app has a structured, searchable,
course-linked knowledge base like this.

### 3. Verified Campus Marketplace
Buy/sell/swap textbooks, hostel items, and tutoring services — trustworthy specifically
*because* every seller is a real, verified TTU student. This directly solves the trust
problem that makes Facebook Marketplace and random WhatsApp groups risky.

### 4. Lecturer/Course Reviews
Anonymous, aggregated ratings per course code, visible only within the relevant
department. Helps students choose electives and gives the institution informal feedback.
Requires clear anonymity + moderation safeguards.

### 5. "Who's Free Now"
A lightweight status tied to level/timetable for finding a study partner on campus in
the moment — solves a real, everyday problem that generic messaging apps don't address
because they have no concept of a shared timetable.

### 6. Verified Institutional Broadcast Channel
The admin broadcast feature already exists — position it explicitly as a trust feature:
messages badged as coming from a verified institutional source (SRC alerts, exam
changes, emergencies), which a Telegram channel can never guarantee.

## Suggested priority for a final-year build

| Feature | Value | Build effort with current stack |
|---|---|---|
| Course & Department Hubs | High | Low — derives from existing profile fields |
| Course-Tagged Resource Bank | High | Medium — new table + file storage + upvotes |
| Verified Campus Marketplace | High | Medium — new table + moderation reuse |
| Lecturer/Course Reviews | Medium | Medium — needs careful anonymity design |
| "Who's Free Now" | Medium | Low — status field + simple UI |
| Broadcast channel badging | Low effort, good narrative | Very low — mostly UI/copy |

Recommendation: pick 1–2 features that can be built end-to-end and demoed well, rather
than shipping all six shallowly. Course Hubs + Resource Bank together tell a coherent
story: *"a social network built around how TTU students actually study together."*
