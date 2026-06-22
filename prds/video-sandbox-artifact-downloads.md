Created: 2026-06-20 06:49 UTC
Last Updated: 2026-06-20 06:59 UTC
Status: Done

# Video Sandbox Artifact Downloads

## Problem

Video jobs can show `PromptDeck sandbox execution complete` in logs without showing a way to open, download, or inspect the generated output.

## Root Cause

The sandbox command writes files into `artifacts/`, but the `startCommand` capture configuration does not include a Convex storage upload URL. The sandbox component can archive the folder, but without an upload URL it does not persist a downloadable artifact URL for the app to show.

The current sandbox command creates a preview artifact package, not an MP4 render. The UI should make that clear until a real video renderer is added to the sandbox command.

## Proposed Solution

- Generate a Convex storage upload URL before starting the sandbox command.
- Pass that upload URL to the sandbox component `capture` config.
- On refresh, convert the returned storage id into a downloadable Convex storage URL.
- Store artifact storage id, artifact path, artifact URL, and output URL on the video job.
- Update Video job cards to show:
  - `Download package` when an artifact URL exists.
  - `Rebuild output` when a completed job has no artifact URL.
  - Clear copy explaining the current output is a preview package, not an MP4 file.
- Allow a completed job without output to start a new sandbox execution.

## Files To Change

- `convex/schema.ts`
- `convex/videoJobs.ts`
- `convex/videoRender.ts`
- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Existing completed jobs without artifacts should show a rebuild action.
- Jobs with artifacts should show a download action even if `outputUrl` is missing but `sandboxArtifactUrl` is present.
- Failed or canceled jobs should keep their existing retry behavior.
- Artifact URLs should be storage-backed download URLs, not one-time upload URLs.
- The UI should not claim an MP4 exists until the sandbox command actually creates one.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-20 06:49 UTC: PRD created.
- 2026-06-20 06:59 UTC: Added Convex storage upload URLs to sandbox capture, stored artifact storage ids/download URLs on video jobs, showed `Download package` for completed jobs with artifacts, added `Rebuild output` for older completed jobs without artifacts, clarified that the current sandbox output is a preview package rather than an MP4, and verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
