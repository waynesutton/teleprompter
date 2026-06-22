Created: 2026-06-20 07:31 UTC
Last Updated: 2026-06-20 07:46 UTC
Status: Done

# Video Sandbox MP4 Output

## Problem

Completed Video jobs currently show a downloadable sandbox artifact package, but users expect an actual `.mp4` they can preview or download.

## Root Cause

- The sandbox command only writes `index.html` and `video-plan.json`.
- The Convex sandbox component captures paths as `.tar.gz` archives, so the downloaded output is a package.
- No render step writes `output.mp4`.
- No MP4 storage id or URL is saved on the `videoJobs` row.

## Proposed Solution

- Generate a simple real MP4 inside the sandbox using `ffmpeg`.
- Upload `artifacts/output.mp4` directly to a Convex storage upload URL with `content-type: video/mp4`.
- Print the returned Convex storage id in sandbox logs.
- During refresh, parse the storage id from sandbox logs, resolve it to a storage URL, and save it to the Video job.
- Keep the existing `.tar.gz` preview package as a secondary debug/download artifact.
- Update the UI to show:
  - Preview Video
  - Download MP4
  - Download preview package

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

- Existing completed jobs may only have a preview package and should still show Rebuild output.
- If `ffmpeg` installation or rendering fails, keep the job failed with a plain error.
- If the MP4 upload succeeds but preview package capture fails, prefer preserving the MP4 link.
- MP4 upload URLs must never be returned to the browser.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy`

## Task Completion Log

- 2026-06-20 07:31 UTC: PRD created.
- 2026-06-20 07:46 UTC: Added sandbox ffmpeg MP4 rendering, direct Convex MP4 upload, MP4 storage/url persistence, Preview Video and Download MP4 UI, and kept preview packages as secondary artifacts. Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
