Created: 2026-05-31 23:23 UTC
Last Updated: 2026-05-31 23:23 UTC
Status: Done

# Mini Prompter Chrome Polish

## Problem

The mini prompter popup controls are too large, the mini footer adds visual noise, and the mini view button is in the main control bar instead of beside the Tab 1 hide-bar control.

## Root Cause

The first mini popup used large touch-sized controls and a footer shortcut strip. The launcher was added to the display cluster, while the hide-bar button lives beside the bottom tab row.

## Proposed Solution

- Shrink the mini popup fake window dots and action buttons.
- Remove the mini popup footer/help strip.
- Request leaner popup chrome through the `window.open` feature string.
- Move the Tab 1 mini view launcher beside the hide-bar `Layout` button.
- Remove the duplicate mini launcher from the main action row.

## Files To Change

- `src/App.tsx`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- Browsers may still show their native address bar for security. The app can request a popup window but cannot guarantee hidden browser chrome.
- Keyboard shortcuts must keep working from the popup after removing the footer.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-05-31 23:23 UTC - Shrunk the mini popup controls, removed the internal footer strip, requested leaner popup chrome, moved the mini launcher beside the Tab 1 hide-bar control, removed the duplicate launcher from the main action row, and updated project tracking. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run deploy:static:dev`.
