Created: 2026-05-30 22:35 UTC
Last Updated: 2026-05-30 22:41 UTC
Status: Done

# Control Toolbar Cleanup

## Problem

The Tab 1 status counter sits over the reading area and distracts from the script. Tab 2 still shows a redundant bold tool, saved scripts cannot be deleted, and the newer toolbar controls need clear tooltips.

## Root Cause

Recent feature work added more controls without fully rebalancing the reading surface, toolbar density, and destructive action flow.

## Proposed Solution

- Move the status counter to the bottom control area.
- Add a close button on the counter and a Tab 3 control to restore or hide it.
- Remove the selected-text Bold tool from Tab 2.
- Add a center text control beside Fit on Tab 1.
- Add a Convex mutation and custom in-app confirmation for deleting saved scripts.
- Add consistent tooltip labels to Tab 1, Tab 2, and Tab 3 controls.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/teleprompter.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Delete should not run without a selected saved script.
- Delete confirmation must not use browser default dialogs.
- Hidden counter must be recoverable from Tab 3.
- Tooltips must not break touch targets or small-screen layouts.

## Verification Steps

- Run Convex codegen after mutation changes.
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Deploy static dev hosting.

## Task Completion Log

- 2026-05-30 22:35 UTC - PRD created and implementation started.
- 2026-05-30 22:41 UTC - Moved the prompter counter into the bottom control stack, added counter hide/show controls, removed selection bold, added Tab 1 center control, added shared script delete with custom confirmation, and added tooltips. Verified with Convex push, `npm run typecheck`, `npm run lint`, and `npm run build`.
