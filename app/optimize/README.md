# Input Page

## What this page does
Collects the three pieces of information the AI needs to generate feedback: the job description, the student's resume, and their cover letter.

## Route
`/optimize`

## Key components
- **Job description textarea** — free-text input
- **Resume upload card** — drag-and-drop or file picker, accepts PDF/DOCX only
- **Cover letter upload card** — same upload behavior as resume
- **File confirmation row** — shows a green checkmark and filename once a file is successfully attached, with a remove button to clear and re-upload
- **Analyze button** — disabled until all three fields (job description + both files) are filled; becomes active once complete

## State/context dependencies
Writes to `CoverLetterContext` — job description text and both uploaded files are stored here so they persist if the student navigates back (e.g., via Edit from the feedback page) without losing their inputs.

## Known placeholder/temporary behavior
- Clicking "Analyze" currently routes to `/loading`, which runs a fixed 5-second timer before continuing to `/feedback` — this will later be replaced with an actual wait gated on the Gemini API response (see `loading-page` and `api-integration` branches).
- No file content is actually sent to an AI yet — files are stored in context but not processed.

## Notes for reviewers
- File type validation (PDF/DOCX only) happens client-side; no server-side validation exists yet since there's no backend processing these files at this stage.