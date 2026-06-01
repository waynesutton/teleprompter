Created: 2026-06-01 12:06 UTC
Last Updated: 2026-06-01 12:20 UTC
Status: Done

# Build Tab Video Workflow

## Problem

Script generation and provider setup currently live inside Tab 2, which makes the writing workspace too dense. The app also needs a clear path for logged-in users to move from links, docs, scripts, and prompts into generated video workflows without pretending video rendering is ready before the backend is designed.

## Root Cause

Tab 2 mixes editing, saving, AI generation, provider setup, and library management. Video generation also needs several provider layers: context capture, script generation, composition/rendering, asset storage, playback, and job tracking.

## Proposed Solution

- Add a new bottom tab named Build between Script and Help.
- Move Script generator and Script generator settings from Script into Build.
- Keep Build login-gated with a clear top note.
- Add a video builder planning section for link/doc/script/prompt-to-video workflows.
- Add video BYOK status for Mux and HeyGen while keeping HyperFrames and Remotion as renderer choices rather than simple API-key services.
- Create a setup guide covering Mux, HyperFrames, Remotion, Convex components, R2, auth, BYOK, and job architecture.
- Keep Tab 2 focused on editing, preview, formatting, saving, loading, and export.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `convex/schema.ts`
- `convex/userApiKeys.ts`
- `convex/apiKeyActions.ts`
- `docs/build-video-setup.md`
- `changelog.md`
- `files.md`
- `task.md`

## Edge Cases

- Logged-out users should still write and prompt scripts but see Build as a sign-in-required workspace.
- Existing AI script generation should keep working after moving tabs.
- BYOK storage should not expose raw keys.
- Video providers should be described honestly: Mux is for assets/playback, HyperFrames/Remotion render video, and R2 is for large artifacts.
- Keyboard shortcuts need to account for the fourth content tab.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`

## Task Completion Log

- 2026-06-01 12:20 UTC - Added the Build tab, moved AI generation and BYOK settings out of Script, added Mux and HeyGen BYOK services, added video workflow UI, and created `docs/build-video-setup.md`. Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run deploy:static:dev`.
