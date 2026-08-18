# CPDI Cover Letter Optimizer — Project Status (development branch)

## What this is
An AI-powered tool for CCNY students to get instant, encouraging feedback
on their cover letters — score, strengths, gaps, and specific fixes —
before submitting job/internship applications. Built by CPDI's Career &
Professional Development Institute web dev team.

Students reach this tool from Career Connections
(ccny-csm.symplicity.com), so every page links back there.

## Stack
- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`), 7-model fallback chain
- **File parsing:** `mammoth` (DOCX), `pdf-parse` v2 + `@napi-rs/canvas` (PDF)
- **Hosting:** Vercel, connected to this repo's `development` branch
- **State:** Fully stateless — no database. Session data lives in React
  Context (`CoverLetterContext`) and resets on page refresh, by design.

## How the app flows
```
/ (landing, disclaimer)
  → /optimize (input: job description + resume + cover letter upload)
    → /loading (calls the AI, shows progress)
      → /feedback (score, strategy, grading, More Services panel)
```
Each page has its own README with implementation detail:
`app/README.md`, `app/optimize/README.md`, `app/loading/README.md`,
`app/feedback/README.md`, `app/context/README.md`,
`app/api/analyze-cover-letter/README.md`.

## Current state (as of Aug 18, 2026)
Done:
- Full flow works end-to-end, tested locally and on live Vercel preview
- Real CPDI rubric integrated (replacing earlier placeholder rubric)
- Model fallback chain + retry logic for rate limits, overload, and
  malformed-JSON responses
- Client-side soft rate limit (5 analyses per 24 hours) to protect shared
  API quota during testing
- "More Services" panel linking to CPDI programs and Career Connections
- Career Connections link on every page
- Vercel deployed and connected

Not yet done:
- Server-side/per-student rate limiting (would need Career Connections
  SSO identity + persistent storage — not yet in scope)
- Polished error modals (current error states are plain cards)
- Visual design-system consistency pass
- Gemini API key ownership decision (currently a personal/temp key)
- PR review process — branches have mostly been merged directly rather
  than via PR; worth confirming with Devika if that should change

## Branch structure
- `development` — integration branch; everything gets merged here first
- `main` — not yet the deployment target; `development` is what Vercel
  currently builds from
- Feature branches (`api-integration`, `rate-limiting`, page branches,
  etc.) — merged into `development` once tested, not always via PR

## Known quirks worth knowing before you debug something that looks broken
- **Gemini model names change.** If a model in the fallback chain starts
  failing, check Google AI Studio for current valid model IDs before
  assuming the code is broken.
- **`pdf-parse` + Vercel needs specific import ordering** — see the
  api-integration README for the exact fix if PDF extraction breaks again
  after a dependency update.
- **Env vars must be set separately for Production and Preview** in
  Vercel — missing this caused a real live failure once.
- **The rate limiter is client-side only** — easily bypassed by clearing
  browser storage. This is intentional and documented, not a bug.

## Testing
A set of test resume/cover letter/job-listing trios exists covering: thin
drafts, strong letters across multiple fields, a mid-range letter, a
letter with deliberate grammar/spelling errors, and a letter with
fabricated/unsupported claims (to test the rubric's fabrication check).