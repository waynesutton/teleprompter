Created: 2026-06-01 00:04 UTC
Last Updated: 2026-06-01 00:04 UTC
Status: Done

# Bottom Tab Auth Control

## Problem

The GitHub sign-in control is floating at the top of Tab 1, appears too prominent, and uses the green primary action treatment by default. It should live with the bottom navigation across all tabs.

## Root Cause

Auth was added as a fixed `auth-utility` outside the tab rail. That made it visually disconnected from the Tab 1/2/3 navigation and caused it to compete with the teleprompter surface.

## Proposed Solution

- Move GitHub sign-in/sign-out into the bottom tab list after Tab 3.
- Match the size and neutral visual style of Tab 1, Tab 2, and Tab 3.
- Use green on hover/focus for tab controls instead of making sign-in green by default.
- Show the signed-in user label and use the control as the sign-out action when authenticated.
- Remove the fixed top-right auth utility.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- Long user names should truncate cleanly.
- The four-tab rail should remain usable on mobile.
- Auth must remain available on Tab 1, Tab 2, and Tab 3.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-06-01 00:04 UTC - Moved GitHub sign-in/sign-out into the bottom tab rail after Tab 3, removed the fixed top-right auth utility, made auth neutral by default, added green hover/focus tab treatment, and updated docs. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run deploy:static:dev`.
