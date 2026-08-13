# AI Integration (Gemini API)

## What this branch does
Connects the app to Google's Gemini API to generate real cover letter feedback,
replacing the placeholder/mock data used during earlier UI development.

## Route
`POST /api/analyze-cover-letter`

## What it touches
This branch isn't a single page — it wires the AI response through several
existing pieces:
- **`app/api/analyze-cover-letter/route.ts`** — the API route itself. Accepts
  a job description, resume file, and cover letter file. Extracts text from
  the files, sends everything to Gemini with a weighted rubric prompt, and
  returns structured JSON.
- **`lib/extractText.ts`** — extracts plain text from uploaded PDF/DOCX files
  using `mammoth` (DOCX) and `pdf-parse` (PDF), so the route can pass readable
  text to Gemini instead of binary files.
- **`app/context/CoverLetterContext.tsx`** — extended with `analysisResult`
  and `analysisError` state so the AI response can be read by the feedback
  page after the loading page fetches it.
- **`app/loading/page.tsx`** — replaced the earlier fake 5-second timer with
  a real `fetch` call to the API route. Builds a `FormData` object from
  context, calls the route, stores the result (or error) in context, then
  navigates to `/feedback`.
- **`app/feedback/page.tsx`** — renders the real AI response from context
  instead of mock data. Handles two edge cases: someone navigating directly
  to `/feedback` without going through the flow (shows a redirect prompt),
  and a failed API call (shows a simple error state with a retry link).

## The rubric
The scoring logic lives in a `SYSTEM_PROMPT` constant at the top of
`route.ts`. It's a 100-point weighted rubric (job description alignment,
specificity, "why this company," structure, persona consistency, writing
mechanics), plus explicit rules for handling thin/early-stage drafts and
maintaining an encouraging tone regardless of score. This is currently based
on a general resume/cover letter writing guide (CCNY Rangel Center) as a
placeholder — swap in the team's actual approved rubric when available. The
tone rules, thin-draft handling, and output format don't need to change when
the rubric content does.

## Environment setup
Requires a `GEMINI_API_KEY` in `.env.local` (gitignored, not committed).
Currently using a personal/temporary key — ownership (whose account this
should live under long-term) is still an open question with Devika/Kiti.

## Known issues / things still being worked on
- **Scoring variance**: identical inputs have produced different scores
  across repeated calls (e.g., 35 vs. 41 on the same test case). This
  contradicts the consistency confirmed during earlier PartyRock testing.
  Root cause is Gemini's default sampling temperature; fix in progress is
  setting `temperature: 0.2` (or lower) in the route's `config` object to
  reduce variance while still allowing natural phrasing.
- **No error modal yet**: the feedback page's error state is a bare-minimum
  fallback, not the real error handling planned for the `error-modal` branch.
- **No rate-limit handling**: if the Gemini free tier limit is hit, the
  route will currently just return a generic failure — no retry logic or
  friendly messaging yet.

## Notes for reviewers
- Model name in use: `gemini-3.6-flash`. Gemini model names/availability
  change over time — if this route suddenly starts failing, check Google AI
  Studio for the current valid model name before assuming the code broke.
- `responseMimeType: "application/json"` in the route's config is required
  for reliable JSON parsing — without it, Gemini sometimes ignores the
  "return only JSON" instruction in the prompt text and returns markdown
  instead, which breaks `JSON.parse()`.
- `@napi-rs/canvas` + `serverExternalPackages` in `next.config.ts` are
  required for `pdf-parse` to work at all in this environment — without them,
  PDF extraction throws a `DOMMatrix is not defined` error at import time.