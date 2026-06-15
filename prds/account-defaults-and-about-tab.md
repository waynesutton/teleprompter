# Account Defaults And About Tab

Created: 2026-06-14 23:08 UTC
Last Updated: 2026-06-14 23:08 UTC
Status: Done

## Problem

Default script settings currently live on the Help page, even though authenticated users expect personal defaults to live with their profile and account settings. The prompter counter toggle also lives in Help, but it controls the active Prompter surface and belongs in the Tab 1 gear menu. The bottom navigation still labels the docs/about area as Help.

## Root Cause

Earlier app versions used Tab 3 as both Help and default settings. After the Account page was added for per-user data and BYOK settings, the defaults panel stayed behind in the old Help layout. The counter toggle also stayed there even though Tab 1 now has a gear menu for secondary prompter controls.

## Proposed Solution

- Move the existing Default script settings panel and Save Defaults action from the Help page to the signed-in Account page.
- Keep the default settings save flow gated by GitHub login through the existing `saveCurrentDefaults` function.
- Move the Prompter counter hide/show control into the Tab 1 gear settings menu.
- Change the visible bottom tab label from `Help` to `About`.
- Update Help/About page copy so it no longer says defaults are tuned there.

## Files To Change

- `src/App.tsx`
- `files.md`
- `task.md`
- `changelog.md`

## Edge Cases

- Logged-out users should still see the Account sign-in prompt, not personal default controls.
- Saving defaults should keep the same behavior and message.
- Counter visibility should remain available from Tab 1 without leaving the prompter.
- Keyboard shortcut labels can keep referring to the internal Help route only if UI copy is updated to About.

## Verification Steps

- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm run build`.
- Manually inspect the Prompter gear menu, Account page, and bottom tab labels.

## Task Completion Log

- 2026-06-14 23:08 UTC - Created the PRD and started the UI relocation.
- 2026-06-14 23:08 UTC - Moved default script settings to Account for signed-in users, moved the prompter counter toggle into the Tab 1 gear menu, renamed the bottom rail Help label to About, and verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
