# Feedback Page

## What this page does
Displays the AI-generated feedback on the student's cover letter — the final result screen of the flow.

## Route
`/feedback`

## Key components
- **Two-card layout:**
  - **Cover Letter Strategy card** — qualitative feedback on content, structure, and alignment with the job description
  - **Grade My Cover Letter card** — includes an SVG score ring showing a numeric/visual score
- (Edit functionality, if present) — allows the student to go back and revise inputs, relying on `CoverLetterContext` to preserve what they already entered

## State/context dependencies
Reads from `CoverLetterContext`. This page expects job description text and uploaded file data to already be present from the input page — if a student navigates directly to `/feedback` (e.g., refreshing the page or pasting the URL) without going through the normal flow, context will be empty and the page may not render correctly.

## Known placeholder/temporary behavior
- Feedback and score shown are currently **not connected to real AI output** — this page is being tested with placeholder/mock data until the `api-integration` branch wires in the actual Gemini response.
- "Thin draft" handling (very low-effort submissions) is designed to produce a low score with encouraging inline feedback rather than a separate error screen — this logic will need to be implemented once real scoring exists.

## Notes for reviewers
- This page should only be reached via the input → loading → feedback flow, not direct navigation, until context persistence across page refreshes is addressed (currently out of scope).