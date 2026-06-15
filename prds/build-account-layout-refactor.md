# Build And Account Layout Refactor

Created: 2026-06-14 02:10 UTC
Status: Done

## Goal

Make the Build tab a focused creator console while moving account-owned setup into a dedicated Account page and moving video workflow documentation into Help.

## Scope

- Add an Account tab state opened by the logged-in profile icon.
- Move BYOK provider setup from Build into the Account page.
- Move video builder documentation from Build into Help.
- Rework Build so source details come before script generation.
- Collapse advanced video project builder controls by default.
- Keep logged-out users able to use local script and prompter workflows.

## Acceptance Criteria

- Build shows source fields, script generator, library save controls, and collapsed advanced video controls.
- Help contains the video workflow explanation and provider guide.
- Account contains profile status, sign out, delete account, and BYOK settings.
- Logged-in bottom nav shows a compact profile icon instead of a large account button.
- Existing script editor, prompter, auth, and BYOK actions keep working.

## Test Plan

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Completion

Completed: 2026-06-14 02:18 UTC

- Moved BYOK setup into a dedicated Account page.
- Moved video workflow docs into Help.
- Reworked Build into a source-first creator console.
- Collapsed advanced Video Project Builder controls by default.
- Changed the logged-in bottom rail account control to a compact profile icon.
