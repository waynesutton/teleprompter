Created: 2026-06-14 01:28 UTC
Last Updated: 2026-06-14 01:34 UTC
Status: Done

# Auth Account And BYOK Production Fix

## Problem

GitHub sign-in reaches Convex Auth but fails after callback with:

```text
Missing environment variable `JWT_PRIVATE_KEY`
```

The signed-in bottom tab also signs users out immediately instead of showing account state, profile actions, and logout/delete account controls. The Build BYOK area should remain useful before login by showing the official provider setup requirements.

## Root Cause

Convex Auth requires production JWT/JWKS environment variables. The production deployment for `https://www.promptdeck.app/` is missing `JWT_PRIVATE_KEY`, so token generation fails after GitHub OAuth verifies the code. Separately, the UI treats the authenticated account tab as a logout button instead of an account menu/profile entry point.

## Proposed Solution

- Document the exact production Auth env setup for `https://www.promptdeck.app/`, including `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`, and GitHub callback URL.
- Replace the signed-in account tab behavior with a PromptDeck account modal.
- Add sign out, profile details, BYOK summary, and delete-account confirmation.
- Add a protected `deleteCurrentAccount` mutation that removes user-owned scripts, settings, Build items, custom voices, BYOK key records, auth accounts/sessions/refresh tokens, and the user row.
- Keep BYOK settings visible on the Build page while logged out, with a clear provider checklist and a sign-in requirement to save keys.
- Update app/domain metadata and setup docs to use `https://www.promptdeck.app/`.

## Files To Change

- `convex/users.ts`
- `src/App.tsx`
- `src/styles.css`
- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `prds/authsetup.prd.md`
- `prds/promptdeck-domain-setup.md`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Logged-out users can still type/paste scripts and use Prompter.
- Logged-out users can see BYOK requirements but cannot save keys.
- Delete account must not use a browser confirm dialog.
- Delete account should be idempotent if some records are already gone.
- Missing `JWT_PRIVATE_KEY` cannot be fixed from client code; it must be set in the production Convex deployment.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual: GitHub sign-in after production Convex env vars are set.
- Manual: signed-in account tab opens modal with profile, sign out, delete account, and BYOK status.
- Manual: logged-out Build page still shows BYOK requirements.

## Task Completion Log

- 2026-06-14 01:28 UTC - Started production Auth env, account modal, BYOK requirements, and PromptDeck URL correction work.
- 2026-06-14 01:34 UTC - Added signed-in account/profile modal, sign out, delete-account confirmation, account deletion mutation, Build BYOK requirement checklist, and `https://www.promptdeck.app/` metadata/setup updates.
- 2026-06-14 01:34 UTC - Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
