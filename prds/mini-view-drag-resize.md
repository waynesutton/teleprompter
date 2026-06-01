Created: 2026-06-01 02:31 UTC
Last Updated: 2026-06-01 02:40 UTC
Status: Done

# Mini View Drag And Resize

## Problem

Mini View is now a clean in-app modal, but it is too fixed. It should behave like a small desktop panel that can be moved around and resized for different recording setups and screen sizes.

## Root Cause

The modal is centered by the scrim and uses fixed responsive max dimensions. That makes it clean, but not flexible enough for desktop teleprompter workflows.

## Proposed Solution

- Give Mini View a smaller default frame.
- Track Mini View position and size in React state.
- Add a slim drag handle at the top of the panel.
- Add a bottom-right resize handle.
- Clamp movement and resizing to the current browser viewport.
- Keep scroll and RSVP sync working while the panel moves or resizes.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- The panel should not move fully off screen.
- The panel should not resize below a usable reading size.
- Resizing should work with pointer input and not conflict with text scrolling.
- Window resize should keep the panel inside the viewport.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-06-01 02:40 UTC - Implemented smaller default Mini View sizing, drag-to-move, bottom-right resize, viewport clamping, and synced scroll/RSVP updates. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run deploy:static:dev`.
