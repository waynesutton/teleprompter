Created: 2026-06-20 00:50 UTC
Last Updated: 2026-06-20 00:56 UTC
Status: Done

# HeyGen BYOK Video Gating

## Problem

The Video tab currently explains HyperFrames rendering, but it does not treat HeyGen/HyperFrames as a user-owned BYOK requirement. Wayne wants every user to bring their own HeyGen key for video rendering.

## Root Cause

The backend already accepts a stored `heygen` service key, but the Account UI filters it out of the active BYOK services. The Video tab only checks for an AI provider key and Firecrawl for URLs. There is no server-side `heygen` requirement before creating a video job.

## Proposed Solution

- Add HeyGen / HyperFrames to active Account BYOK service options.
- Update BYOK requirements, Account copy, privacy/terms copy, stack chips, and Video setup instructions.
- Add client-side Video tab checks for a saved HeyGen key.
- Add server-side `convex/videoJobs.create` checks for:
  - one AI provider key: OpenAI, Claude, or OpenRouter
  - HeyGen key for every video job
  - Firecrawl key when URL or design URL context is used
- Keep existing encrypted key storage. Raw keys stay server-side and are never returned to the browser.

## Files To Change

- `src/App.tsx`
- `convex/videoJobs.ts`
- `README.md`
- `files.md`
- `task.md`
- `changelog.md`

## Edge Cases

- Prompt-only video jobs still require HeyGen and one AI provider.
- URL and design URL video jobs require Firecrawl too.
- Logged-out users still see setup guidance but cannot save keys or create jobs.
- Existing stored `heygen` keys become visible in Account status because the service was already supported in storage.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-20 00:50 UTC - Created PRD and started implementation.
- 2026-06-20 00:56 UTC - Added HeyGen / HyperFrames to Account BYOK settings, updated Video UI requirements, added server-side video job key checks, synced docs, and verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
