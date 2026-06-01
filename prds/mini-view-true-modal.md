Created: 2026-05-31 23:38 UTC
Last Updated: 2026-05-31 23:38 UTC
Status: Done

# Mini View True Modal

## Problem

The Mini View still shows browser popup chrome, including the native `about:blank` bar and browser download icon. It also includes fake window dots that are not useful inside the app.

## Root Cause

The current Mini View uses `window.open`. Browser vendors intentionally keep address and window controls visible in many popup contexts for security, so the app cannot reliably hide them.

## Proposed Solution

- Replace the separate browser popup with an app-owned modal overlay.
- Remove the fake three-dot window controls.
- Keep the mini controls very small.
- Keep Mini View synced with the active Tab 1 script, reading mode, progress, playback state, text color, alignment, mirror, and font size.
- Keep keyboard shortcuts working while the modal is open.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- Clicking outside the modal should close it.
- `Escape` should close the modal before triggering stop/reset.
- Scroll mode should keep the mini stage aligned with the current progress.
- RSVP mode should keep showing the current word and ORP pivot.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 23:38 UTC - Converted Mini View from `window.open` to an app-owned modal, removed fake three-dot window controls, removed browser chrome dependency, kept synced scroll and RSVP rendering, and updated project docs. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run deploy:static:dev`.
