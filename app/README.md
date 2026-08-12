# Landing Page

## What this page does
The entry point to the Cover Letter Optimizer. Introduces the tool, gates access behind a disclaimer, and routes students into the main flow.

## Route
`/` (root)

## Key components
- **CPDI branding** — logo (`public/cpdi-logo.png`) and app copy
- **Disclaimer modal** — must be accepted before the page content is accessible; uses `sessionStorage` so returning users within the same session aren't re-prompted every time they navigate back to `/`
- **3-step cards** — brief walkthrough of how the tool works (upload → analyze → get feedback)
- **"Get Started" CTA** — routes to `/optimize` (input page)

## State/context dependencies
None. This page doesn't read from `CoverLetterContext` — it's the starting point before any student data exists.

## Known placeholder/temporary behavior
None currently. Copy and branding may still be revised for tone/design consistency once the `design-system` branch is built.

## Notes for reviewers
- Disclaimer gating relies on `sessionStorage`, not a database — this means it resets per browser session (closing the tab and reopening will re-trigger it), which is intentional given the app has no login.