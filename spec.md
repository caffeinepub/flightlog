# Specification

## Summary
**Goal:** Build a flight log web application with Internet Identity authentication, per-user data storage, and an aviation-themed UI.

**Planned changes:**
- Implement Internet Identity authentication; unauthenticated users see a login screen and cannot access any other view
- Backend (Motoko) storage scoped per user principal for: students, instructors, aircraft, exercises, and flight log entries
- CRUD functions (add, update, delete, list) for students, instructors, aircraft, and exercises
- Flight log entry storage with fields: date, student, instructor, aircraft, flight type (Solo/Dual), exercise, takeoff time, landing time, total flight time (computed), landing type (Day/Night), and landing count
- Main menu screen with navigation buttons to all sections and a logout button
- Reusable List Manager UI for Students, Instructors, Aircraft, and Exercises (add, edit, delete, list)
- Flight Log Entry form with date defaulting to today, dropdowns populated from backend, flight/landing type selectors, time inputs, landing count, and computed total flight time on save
- Flight Records view with scrollable table of all 11 columns, and filters by month (YYYY-MM) and student name with Search/Reset controls
- Aviation-themed design: dark navy and sky-blue palette, white typography, card-based layout, responsive and mobile-friendly with 44px+ touch targets

**User-visible outcome:** Users can log in with Internet Identity, manage their own lists of students, instructors, aircraft, and exercises, log flight entries, and view/filter their flight records in a clean aviation-themed interface usable on desktop and mobile.
