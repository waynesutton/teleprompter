# Script Editor Caret Stability

Created: 2026-06-28 05:59 UTC
Last Updated: 2026-06-28 05:59 UTC
Status: Done

## Problem

Typing in the Script tab does not behave like a normal notes app or text editor. With longer text, the cursor can jump to the bottom or lose its current position while the user is typing.

## Root Cause

The Script textarea is a controlled React input backed by `draft`. For signed-in users, the app also subscribes to the Convex current prompt. Every autosave echoes a new `savedPrompt` object through the subscription, and the existing effect applies `savedPrompt.script` back into `draft` on every update. That can replace the textarea value while the user is editing, which causes the browser to move the caret.

The autosave effect also depends on the full `savedPrompt` object. Each subscription echo can reschedule another save even when the user did not type.

## Proposed Solution

- Hydrate `draft` and prompt settings from `savedPrompt` only once per signed-in session after the query is ready.
- Reset that hydration guard on sign-out.
- Keep autosave gated on query readiness, but do not depend on the entire `savedPrompt` object.
- Preserve all existing save/load/new/clear/generated-script behavior.

## Files To Change

- `src/App.tsx`
- `task.md`
- `changelog.md`
- `files.md` if the app description needs a caret-stability note

## Edge Cases

- Signed-out users keep browser-local draft persistence.
- New signed-in users still hydrate from the default prompt.
- Existing signed-in users still load their last saved current prompt on page load.
- Saved-script loading and generated-script import still intentionally replace the editor draft.
- Autosave continues after editing without forcing the textarea caret to the end.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Completion Log

- 2026-06-28 05:59 UTC - Diagnosed Convex autosave subscription echo as the cause of textarea caret jumps and planned a one-time hydration guard.
- 2026-06-28 05:59 UTC - Added a one-time saved prompt hydration guard, kept last-saved timestamps updating, removed the full subscription object from the autosave dependency path, and verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
