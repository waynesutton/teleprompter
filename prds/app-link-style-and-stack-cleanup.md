Created: 2026-06-15 05:52 UTC
Last Updated: 2026-06-15 05:56 UTC
Status: Done

# App Link Style And Stack Cleanup

## Problem

Some links in the app, especially the About page reference link, still render like browser-default links. The Stack snapshot also uses a decorative gradient that the user wants removed.

## Root Cause

The app has strong button/control styles but does not define a scoped global anchor treatment. The Stack snapshot added a radial and linear gradient for visual emphasis.

## Proposed Solution

- Add scoped `.app-shell a` styles so app links match PromptDeck controls.
- Preserve accessibility with visible focus styles.
- Remove the Stack snapshot gradient and keep a solid panel surface.
- Keep the Stack snapshot layout and content unchanged.
- Sync `task.md`, `changelog.md`, and `files.md`.
- Deploy to dev and production static-hosting targets after verification.

## Files To Change

- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Footer and modal links should remain readable and keyboard-focusable.
- The Stack snapshot should stay screenshot-ready without the gradient.
- Deploy commands should use their configured static-hosting workflows without a separate manual build step.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run deploy:static:dev`
- `npm run deploy`

## Task Completion Log

- 2026-06-15 05:52 UTC - Added scoped app-wide link styling so links render like PromptDeck controls and removed the Stack snapshot gradient.
- 2026-06-15 05:56 UTC - Verified with `npm run typecheck` and `npm run lint`.
- 2026-06-15 05:56 UTC - Deployed dev with `npm run deploy:static:dev`.
- 2026-06-15 05:56 UTC - Deployed production with `npm run deploy` and smoke checked the production JS bundle for `https://befitting-dodo-95.convex.cloud`.
