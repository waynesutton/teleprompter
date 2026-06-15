# Build Script-First Video Setup Cleanup

Created: 2026-06-15 00:55 UTC
Last Updated: 2026-06-15 00:55 UTC
Status: Done

## Problem

Build currently mixes script generation and video planning in one Creator Console, and some copy can imply video rendering is closer than it is. R2 is documented in the video setup guide, but it is not visible in the BYOK settings list, so users do not see the storage setup required for future video workflows.

## Root Cause

The app grew from script generation into video planning before the video infrastructure exists. The UI now has planning fields and docs, but no render workers, R2 component wiring, Mux job flow, or dedicated video job tables. The wording needs to make that boundary explicit.

## Proposed Solution

- Make Build script-first:
  - headline and Creator Console copy focus on generating scripts
  - keep video setup below as a separate planning/setup section
  - keep AI script generation gated behind login and BYOK provider keys
- Keep the Build library about saved script drafts, video planning notes, or both.
- Keep Advanced Video Project Builder collapsed and clearly logged-in/planning-only.
- Remove language that implies real video output, preview rendering, final rendering, or job tracking exists today.
- Add R2 as a visible BYOK setup service so users can see storage requirements for future video artifacts.
- Update About/video docs copy and `docs/build-video-setup.md` to clarify:
  - no fake render buttons
  - R2/Mux/render workers/job tables are prerequisites for real video production
  - current video features produce planning artifacts only

## Files To Change

- `src/App.tsx`
- `convex/schema.ts`
- `convex/userApiKeys.ts`
- `convex/apiKeyActions.ts`
- `convex/aiScripts.ts`
- `convex/voice.ts`
- `docs/build-video-setup.md`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Logged-out users should still understand Build is a logged-in feature.
- Logged-in users without AI keys should still see that script generation needs OpenAI, Claude, or OpenRouter.
- Users should not see any button that implies an MP4 will be rendered.
- R2 setup should be status/configuration only until the R2 component and video job tables exist.
- Existing saved BYOK records should remain valid because the schema is widened, not narrowed.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual review of Build and About copy for false render promises.

## Task Completion Log

- 2026-06-15 00:55 UTC - PRD created.
- 2026-06-15 00:55 UTC - Made Build script-first, added a separate video planning setup panel, renamed advanced video action copy to planning language, added R2 to BYOK setup/status, updated video setup docs, and verified with `npm run typecheck`, `npm run lint`, and `npm run build`.
