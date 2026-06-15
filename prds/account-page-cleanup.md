Created: 2026-06-15 05:40 UTC
Last Updated: 2026-06-15 05:40 UTC
Status: Done

# Account Page Cleanup

## Problem

The Account page shows sign out, delete account, and the ownership explanation too high on the page. The BYOK status chips can also show old saved services that are no longer part of the script-focused app UI.

## Root Cause

The Account profile panel originally combined identity, counts, ownership copy, and account actions in one section. After the app was refocused around scripts, the service picker was narrowed but the status chip list still renders every key returned by Convex.

## Proposed Solution

- Keep identity and account counts at the top of Account.
- Move ownership copy, sign out, and delete account controls to a bottom Account access section.
- Filter BYOK status chips and BYOK key counts to the currently supported Account services.
- Keep existing backend data untouched so old stored keys do not require a migration.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Old key records for removed services may still exist in Convex, but should not render in the current UI.
- Delete account confirmation must still appear near the delete action.
- Account message should stay visible after sign out/delete attempts.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-15 05:40 UTC - Started Account layout cleanup and BYOK status filtering.
- 2026-06-15 05:40 UTC - Moved Account ownership/sign out/delete controls to a bottom Account access panel, filtered BYOK status/counts to active services, synced project docs, and verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
