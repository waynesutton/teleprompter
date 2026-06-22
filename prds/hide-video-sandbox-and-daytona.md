# Hide Video, Sandbox, and Daytona

Created: 2026-06-21 04:42 UTC

## Summary

PromptDeck is returning to a script-focused app for the active UI. The Video tab, Convex sandbox execution layer, and Daytona BYOK setup should be hidden or disabled without deleting historical video job data that may already exist in production.

## Goals

- Remove the active `@convex-dev/sandbox` component registration.
- Remove the local sandbox package dependency.
- Remove the sandbox render action file from active Convex functions.
- Hide the Video tab from the bottom navigation.
- Remove Daytona from Account BYOK setup and visible key status.
- Keep historical `videoJobs` rows and schema fields intact so production deploys do not fail against existing data.
- Keep account deletion cleanup for old video job rows.
- Update README, About copy, changelog, task log, and file map to reflect the current script-first app.

## Non-Goals

- Do not delete existing production video job rows.
- Do not remove historical changelog entries that explain prior video work.
- Do not remove the `videoJobs` table from the Convex schema until there is a dedicated data migration and deletion plan.

## Implementation Notes

- `convex/convex.config.ts` now registers only static hosting.
- `convex/videoRender.ts` is removed from active functions.
- `convex/videoJobs.ts` remains as a historical data query and returns `null` from create while video creation is disabled.
- Account BYOK exposes OpenAI, Claude, OpenRouter, Firecrawl, and ElevenLabs only.
- The bottom rail omits Video and `Command/Ctrl + 4` now opens About.

## Rollback

To restore video later, create a new PRD first. Reintroduce the execution provider deliberately, then decide whether to use Convex sandbox, another worker, or a hosted video API. The previous implementation references remain in git history and historical PRDs:

- `prds/video-generation-tab.md`
- `prds/video-sandbox-execution-layer.md`
- `prds/video-sandbox-artifact-downloads.md`
- `prds/video-sandbox-mp4-output.md`

## Verification

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`
- `npm run deploy`

## Completion Log

- 2026-06-21 04:42 UTC - Removed sandbox registration and dependency, deleted the sandbox render action, disabled new video job creation, hid the Video tab, removed Daytona from Account BYOK, and updated current app copy/docs.
