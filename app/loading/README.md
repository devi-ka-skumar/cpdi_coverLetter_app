# Loading Page

## What this page does
Shows a waiting state while the cover letter is being analyzed, then routes the student to their feedback.

## Route
`/loading`

## Key components
- **Bear mascot icon** and encouraging copy ("Reading through your cover letter...")
- **Indeterminate progress bar** — pulsing animation, not tied to a real percentage since analysis duration is variable
- **Tip callout** — reassurance text shown while waiting

## State/context dependencies
None directly — this page doesn't read or write `CoverLetterContext`. It's a transitional screen between input and feedback.

## Known placeholder/temporary behavior
**This is currently a fake loading state.** A `setTimeout` fires after 5 seconds and automatically routes to `/feedback`, regardless of whether any real analysis has happened. This is intentional for testing the click-through flow before AI integration exists.

**This will change** once the `api-integration` branch is built: the timer will be replaced with an `async` call to the Gemini API route, and the page will stay up for however long the actual response takes, routing to `/feedback` only once real data comes back (see `useEffect` + `fetch` pattern planned for that branch).

## Notes for reviewers
- Do not treat the current timing (5 seconds) as final UX — it's purely a development convenience until the real API call replaces it.