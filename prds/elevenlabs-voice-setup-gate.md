# ElevenLabs Voice Setup Gate

Created: 2026-05-31 05:25 UTC
Last Updated: 2026-05-31 05:35 UTC
Status: Done

## Problem

Tab 1 does not show that voice following is a planned feature. If the site owner has not configured `ELEVENLABS_API_KEY`, users have no clear explanation for why voice controls are missing or unavailable.

## Root Cause

The app currently has no Convex function that reports voice setup status and no Tab 1 control for voice mode discovery.

## Proposed Solution

- Add a Tab 1 voice icon that is always visible in the control dock.
- Add a Convex action that checks whether `ELEVENLABS_API_KEY` is configured and returns only a boolean status, never the key.
- Open a Graphite modal when the voice icon is clicked.
- If the key is missing, show: `Voice control is not set up yet. Ask the site owner to configure ELEVENLABS_API_KEY.`
- If the key is present, show that voice control is ready but off by default until the user starts it.
- Keep the copy direct and short.

## Files To Change

- `src/App.tsx`
- `convex/voice.ts`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- The voice icon should stay visible whether the key is configured or not.
- The modal should close with Escape and by clicking the backdrop.
- The app should never expose `ELEVENLABS_API_KEY` to the client.
- Voice mode should not auto-start.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-05-31 05:35 UTC - Added the Tab 1 voice icon, ElevenLabs setup status action, and setup modal. Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, `npm run build`, and static hosting deploy.
