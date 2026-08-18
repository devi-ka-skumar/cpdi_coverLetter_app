# Error Modal

## What this branch does
Converts the feedback page's error states from full-page replacements
into overlay modals, consistent with how the rest of the app's modals
(disclaimer, More Services) work — the normal page shell stays visible
underneath, the modal sits on top.

## What it touches
- **`app/components/errorModal.tsx`** — new, shared component. Takes
  `title`, `message`, `buttonText`, and `buttonHref` as props so all three
  error cases reuse one component instead of three separate ones.
- **`app/feedback/page.tsx`** — restructured so the page always renders
  its shell (nav pills, "Your Results" heading). A new `errorModal`
  variable is set based on which case applies, and rendered at the top of
  the page. Result cards and the More Services side tab are gated behind
  `hasValidResult` so nothing incomplete/broken-looking shows behind an
  error overlay.

## The three cases covered
1. **Direct navigation** — no `analysisResult` and no `analysisError`
   (someone hit `/feedback` without going through input → loading first,
   e.g. a page refresh or typed URL).
2. **AI failure** — `analysisError` is set (rate limit, model overload, or
   malformed JSON from Gemini — see `api-integration` branch/README for
   where these originate).
3. **No draft detected** — `hasCoverLetterDraft === false`, meaning the AI
   itself determined there was nothing to grade. Defensive case; the
   input page already requires a file before allowing submission, so this
   shouldn't normally trigger.

## Design decision: non-dismissible
Unlike `moreServicesModal` (which has a close button since it's optional
browsing), `ErrorModal` has no close button and the backdrop isn't
clickable to dismiss. Reasoning: there's nothing useful behind an error
state to reveal by dismissing it — no real results exist yet in any of
the three cases — so an X button would just expose an empty-looking page.
The only way forward is the button inside the modal itself, which always
navigates back to `/optimize`.

This matches `disclaimerModal`'s pattern (non-dismissible) rather than
`moreServicesModal`'s (dismissible).

## Testing notes
- **Case 1 (direct navigation)** was tested directly: complete the normal
  flow to get real results on `/feedback`, then refresh the page. Confirms
  the modal overlay pattern, the dimmed backdrop, and that result cards +
  More Services tab correctly disappear.
- **Cases 2 and 3** were not triggered live (hard to force reliably — would
  require an invalid API key or bypassing the input page's file
  requirement). They share the identical conditional structure as Case 1,
  just different trigger conditions and props passed to the same
  `ErrorModal` component, so Case 1 passing is strong evidence they work,
  but this is not the same as direct confirmation. Worth triggering for
  real for a real test if a failure happens naturally during future use.

## Notes for reviewers
- `buttonHref` uses a plain `<a>` tag rather than Next's `<Link>`,
  intentionally — a full page navigation guarantees a clean state reset,
  which matters more here than a smooth client-side transition would.