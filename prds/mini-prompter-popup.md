Created: 2026-05-31 22:15 UTC
Last Updated: 2026-05-31 22:15 UTC
Status: Done

# Mini Prompter Popup

## Problem

Tab 1 needs a compact secondary prompter window that can stay in sync with the full teleprompter and still respond to the same keyboard shortcuts.

## Root Cause

The app currently has one full-screen browser prompter view. Keyboard shortcuts are bound only to the main window, so a separate popup needs a shared command path instead of its own disconnected controls.

## Proposed Solution

- Add a Phosphor `MonitorArrowUp` control to Tab 1.
- Open a compact popup window with a dark Graphite-styled mini prompter surface.
- Keep the popup synced with the active script page, scroll/RSVP mode, playback state, current RSVP word, progress, font, color, and page metadata.
- Forward popup keyboard events to the main app so existing shortcuts keep working.
- Add a shortcut for opening/focusing the mini view.
- Update Tab 3 docs, feature list, README, changelog, task tracking, and file map.

## Files To Change

- `src/App.tsx`
- `README.md`
- `changelog.md`
- `task.md`
- `files.md`

## Edge Cases

- Popup blockers can block the mini window unless opened from a direct click or keyboard action.
- The popup can be closed independently; the app should recover and reopen it cleanly.
- User script text must be escaped before rendering in the popup.
- Keyboard shortcuts should not hijack typing inside inputs or textareas.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual check: open mini view, start/pause, switch RSVP/scroll, page forward/back, open shortcuts, hide/show controls, and close/reopen the popup.

## Task Completion Log

- 2026-05-31 22:15 UTC - Added the Tab 1 mini prompter popup, shared keyboard forwarding, mini view shortcut, Tab 3 feature copy, README updates, and project tracking. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run deploy:static:dev`.
