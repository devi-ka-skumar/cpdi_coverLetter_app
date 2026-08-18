# AI Integration (Gemini API)

## What this branch does
Connects the app to Google's Gemini API to generate real cover letter
feedback using the official CPDI Cover Letter Guide and grading rubric.

## Route
`POST /api/analyze-cover-letter`

## What it touches
- **`app/api/analyze-cover-letter/route.ts`** — the API route. Accepts a
  job description, resume file, and cover letter file. Extracts text from
  the files, sends everything to Gemini with the CPDI rubric prompt, and
  returns structured JSON.
- **`lib/extractText.ts`** — extracts plain text from uploaded PDF/DOCX
  files using `mammoth` (DOCX) and `pdf-parse` v2 (PDF).
- **`app/context/CoverLetterContext.tsx`** — holds `analysisResult` and
  `analysisError` state so the AI response can be read by the feedback
  page after the loading page fetches it.
- **`app/loading/page.tsx`** — calls the API route with a real `fetch`,
  shows a simulated progress bar while waiting, stores the result (or
  error) in context, then navigates to `/feedback`.
- **`app/feedback/page.tsx`** — renders the AI response: score, category
  breakdown, strategy suggestions, spelling/grammar corrections, template
  checklist, and a "do this now" action.

## The rubric — now the official CPDI version
As of Aug 18, this uses the **actual CPDI Cover Letter Guide and grading
format**, provided by Devika from PartyRock prototyping (replacing the
earlier placeholder rubric based on a general CCNY resume guide).

**Scoring (100 points):** Job Match (25) · Resume Alignment (20) ·
Template Structure (20) · Clarity/Spelling/Grammar/Impact (20) ·
Professional Tone (15).

**Requires the strict 4-paragraph structure** (position+source+why you →
resume match → why this company → interview request). This is a
deliberate change from the earlier placeholder rubric, which explicitly
did *not* require rigid structure, based on findings from PartyRock
testing that flagged rigid structure scoring as unfairly penalizing valid
letters with different formats. Following Devika's official spec here —
worth revisiting with her if this shows up as a real problem in testing.

**New capabilities not in the old rubric:**
- Fabrication check — penalizes claims in the letter not supported by the resume
- Structured spelling/grammar corrections (`incorrect` → `correction` pairs)
- Category score breakdown, not just a single total
- "Must-haves" checklist (what the letter should include, generated from the job description)
- `hasCoverLetterDraft: false` fallback if no draft is present (defensive — the input page already requires a file, so this shouldn't normally trigger)

The tone rules, thin-draft handling, and JSON-only output requirement
carried over unchanged from the earlier prompt — those are independent of
rubric content.

## Reliability — model fallback + retry
- **7-model fallback chain** (`gemini-3.6-flash` down to `gemini-3.5-flash-lite`).
  If one model is rate-limited (429), the request automatically tries the
  next model rather than failing. Documented trade-off: different models
  may grade very slightly differently despite identical
  prompt/temperature/seed.
- **`temperature: 0` + fixed `seed: 42`** for scoring consistency across
  identical inputs (fixes an earlier bug where the same letter could score
  meaningfully differently on repeated submissions).
- **`maxOutputTokens: 3000`** — added after the new, longer rubric schema
  caused some responses to be silently truncated mid-generation, producing
  invalid JSON. Confirmed this was the cause via error logging showing the
  response cut off mid-string.
- **JSON parsing happens inside the retry loop**, not after it. A
  malformed response (e.g., a model closing an object with `]` instead of
  `}` — a real bug hit during testing) now retries the same model once,
  then falls through the model chain, instead of failing outright.
- **Prompt includes an explicit instruction** against using stray double
  quotes inside JSON string values (a literal `"` inside a string value
  was the root cause of one malformed-JSON incident during testing) and to
  double-check bracket types match.
- **Dev-only in-memory cache** (`devCache`) so repeated identical test
  runs during local development don't burn API quota. Never active in
  production (`NODE_ENV === "development"` gated).

## Environment setup
Requires `GEMINI_API_KEY` in `.env.local` (gitignored) and in Vercel's
Environment Variables (must be set separately for Production **and**
Preview environments — this was missed once during initial Vercel setup
and caused a live failure). Currently using a personal/temporary key;
ownership is still an open question with Devika/Kiti.

## Known issues / resolved issues
- **RESOLVED — DOMMatrix error on Vercel:** `pdf-parse` v2 depends on
  `pdfjs-dist`, which expects browser canvas APIs not present in Node.
  Fixed locally with `@napi-rs/canvas` + `serverExternalPackages` in
  `next.config.ts`. This alone worked locally but NOT on Vercel — the
  bundler only includes files it sees statically imported. Full fix
  required importing `pdf-parse/worker` before `pdf-parse` and passing
  `CanvasFactory` explicitly to the parser. Confirmed working on both
  local dev and live Vercel deployment.
- **RESOLVED — JSON truncation:** see `maxOutputTokens` above.
- **RESOLVED — malformed JSON from stray quotes:** see retry loop +
  prompt instruction above. Should self-heal via retry even if it recurs.
- **Open — no server-side rate limiting.** Current rate limiting
  (`lib/rateLimiter.ts`, on `development`) is client-side/localStorage
  only — a soft deterrent, not real enforcement. Would need student
  identity (from Career Connections SSO, not currently implemented) plus
  persistent storage to do properly.
- **Open — error states are plain text**, not styled modals. Rate-limit,
  overload, and parse-failure errors all currently render as a simple
  card on the feedback page. Planned: `error-modal` branch.

## Notes for reviewers
- Model name in use: `gemini-3.6-flash` (primary), with the fallback
  chain covering `gemini-3.5-flash`, `gemini-3-flash`, `gemini-2.5-flash`,
  `gemini-2.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`.
  Gemini model names/availability change over time — some of these fallback
  model ID strings were extrapolated from naming patterns and not all have
  been individually confirmed against Google's docs.
- `responseMimeType: "application/json"` is required for reliable JSON
  output — without it, Gemini sometimes ignores the "return only JSON"
  instruction in the prompt text and returns markdown instead.