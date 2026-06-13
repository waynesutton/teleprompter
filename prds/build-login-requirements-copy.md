Created: 2026-06-12 23:46 UTC
Last Updated: 2026-06-12 23:46 UTC
Status: Done

# Build Login Requirements Copy

## Problem

The Build tab says it can draft video projects, but it does not clearly explain which parts work from pasted script text, which parts require login, and which parts require external API keys or render services.

## Root Cause

The first Video Project Builder pass added fields and local draft generation, but the surrounding copy still reads like everything in Build is equally available. The Draft Video Project button also allows local drafting even though Build library work is intended to be authenticated.

## Proposed Solution

- Gate Draft Video Project behind GitHub login.
- Add Build copy that explains:
  - Login is required for saving scripts, videos, Build items, and Video Project Builder drafts.
  - Pasted script text can be used as local source material.
  - URL context requires Firecrawl.
  - AI strategy/script/EDL assistance requires OpenAI, Claude, or OpenRouter.
  - Word-level transcription requires a transcription provider such as ElevenLabs Scribe or another worker-backed service.
  - Final rendering requires an external worker/provider such as HyperFrames, Remotion, ffmpeg, R2, and Mux.
- Update Help app docs and About features so users understand the logged-in Build workflow.

## Files To Change

- `src/App.tsx`
- `src/styles.css`
- `docs/build-video-setup.md`
- `README.md`
- `changelog.md`
- `task.md`
- `files.md`

## Edge Cases

- Logged-out users can still paste/type a script and use Prompter.
- Logged-out users who click Draft Video Project should see the existing login-required modal.
- Logged-in users without provider keys should understand that manual planning fields can be saved, but URL scraping, AI generation, transcription, and rendering need extra setup.

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-12 23:46 UTC - Gated Draft Video Project behind GitHub login, added Build requirement cards, clarified saved Build item requirements, updated Help/About/README/setup docs, and verified the app.
