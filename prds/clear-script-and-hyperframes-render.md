Created: 2026-06-20 05:01 UTC
Last Updated: 2026-06-20 05:18 UTC
Status: Done

# Clear Script And HyperFrames Render

## Problem

The Script tab has a New Script flow, but users also need a direct Clear Script action that only empties the editor after a custom confirmation.

The Video tab currently creates private Convex video job rows and checks BYOK setup, but it does not start a HeyGen / HyperFrames render. Saving a HeyGen key is not enough; the app needs a server-side action that creates the render payload, calls HyperFrames, stores the provider render id, checks status, and exposes the final output URL.

## Root Cause

- Script clearing is bundled into the broader New Script workflow.
- `convex/videoJobs.ts` stores jobs but has no render action, no provider render id field, and no status refresh path.
- The Video UI cannot start or refresh a provider render, so jobs stay as planning records.

## Proposed Solution

- Add a Clear Script button near New Script with a Graphite confirmation modal.
- Clear editor text without deleting library data. Detach the current saved-script link to avoid accidental overwrites.
- Extend `videoJobs` with provider render metadata.
- Add authenticated internal owner-checked video job helpers.
- Add public Convex actions:
  - `startHyperframesRender` to build a self-contained HyperFrames HTML payload, call HeyGen, and patch render metadata.
  - `refreshHyperframesRender` to poll HeyGen and update status, progress, message, and output URL.
- Update Video tab:
  - Generate Video queues and starts the render.
  - Job cards show Render, Refresh, and Open output controls where applicable.
  - Copy makes clear that rendering is beta and requires the signed-in user's BYOK keys.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/schema.ts`
- `convex/videoJobs.ts`
- `convex/videoRender.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Logged-out users cannot clear saved library state, but can clear local editor text.
- Clear Script should not delete saved library rows.
- Missing HeyGen key returns a clear BYOK message.
- Provider failures leave the job visible with `failed` status and a plain error.
- Status refresh must verify the job belongs to the authenticated user.
- HyperFrames response shapes may vary, so status and output URL extraction should be defensive.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-20 05:01 UTC: PRD created.
- 2026-06-20 05:18 UTC: Added Clear Script confirmation, HyperFrames render actions, video job render/refresh controls, schema render metadata, and verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
