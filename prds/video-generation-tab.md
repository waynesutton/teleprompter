Created: 2026-06-19 21:52 UTC
Last Updated: 2026-06-19 22:16 UTC
Status: Done

# Video Generation Tab

## Problem

PromptDeck previously removed the in-app video planning features to keep Build focused on scripts. The new HyperFrames PRD brings video creation back as a separate workflow: users should be able to start a video from a prompt, URL, script, or markdown design instructions without confusing it with script generation.

## Root Cause

Video generation has different requirements than script generation. Convex can own auth, BYOK checks, job state, URL/design context, and orchestration, but browser UI and Convex functions cannot render MP4 files directly. HyperFrames rendering needs an external Node/FFmpeg/headless Chrome worker.

## Proposed Solution

- Add a dedicated Video tab next to Build.
- Gate video creation behind GitHub login.
- Let logged-out users read a collapsed setup/how-it-works guide.
- Let logged-in users create per-user video jobs from:
  - prompt or brief
  - URL context
  - current Script text or pasted script
  - pasted/uploaded `design.md`
  - design or markdown URL
- Reuse existing Script Voice Profiles as the video tone selector.
- Add a Convex `videoJobs` table with per-user job records and status.
- Keep the v1 UI honest: jobs queue in Convex, but MP4 rendering requires the external HyperFrames worker described in the downloaded PRD.

## Files To Change

- `convex/schema.ts`
- `convex/videoJobs.ts`
- `src/App.tsx`
- `src/styles.css`
- `files.md`
- `task.md`
- `changelog.md`

## Edge Cases

- Logged-out users can view setup guidance but cannot create jobs.
- URL-based jobs explain that Firecrawl is required.
- Jobs with no prompt, URL, or script are rejected.
- Design markdown can be pasted or uploaded locally without storing raw files separately.
- Existing Script and Build workflows stay unchanged.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-19 21:52 UTC - Created PRD and started implementation.
- 2026-06-19 22:16 UTC - Added the Video tab, per-user `videoJobs` schema/functions, setup guidance, Script Voice Profile tone selection, account deletion cleanup, docs updates, and verification.
