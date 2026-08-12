# Session Storage / Shared Context

## What this branch does
Provides shared state across all pages so student inputs (job description, uploaded resume, uploaded cover letter) persist as they navigate client-side through the app — without a database, since this app is intentionally stateless.

## Not a standalone page
This branch doesn't add a route of its own. It wraps the whole app via `app/layout.tsx` so every page can access the same shared data.

## Key components
- **`CoverLetterContext.tsx`** (`app/context/CoverLetterContext.tsx`) — a React Context provider holding:
  - Job description text
  - Uploaded resume file
  - Uploaded cover letter file
- Wrapped around the app in `app/layout.tsx` so all child pages (landing, input, loading, feedback) can read and update it via `useContext`.

## Why this exists
Without this, navigating from input → loading → feedback (or back to input via "Edit") would lose everything the student entered, since Next.js client-side navigation doesn't persist component state by default. This context solves that without needing a backend/database, keeping the app stateless as required.

## Known placeholder/temporary behavior
- Data lives only in memory (React state) — a hard refresh clears it entirely. This is intentional given the no-database constraint, but means direct navigation to `/feedback` (bypassing the normal flow) will show an empty state.

## Notes for reviewers
- Any new page that needs access to student input data should consume this context rather than creating separate local state, to avoid data getting out of sync across pages.