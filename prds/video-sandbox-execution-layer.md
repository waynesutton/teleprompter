Created: 2026-06-20 05:56 UTC
Last Updated: 2026-06-20 06:18 UTC
Status: Done

# Video Sandbox Execution Layer

## Problem

The Video tab can create user-owned video jobs and previously had a direct HeyGen / HyperFrames render action. The current direction is to use the Convex sandbox component as the execution layer, with user-owned BYOK credentials, so long-running video work does not run directly inside app Convex actions.

## Root Cause

- Video jobs need a remote execution boundary for rendering, logs, and artifacts.
- Direct provider calls from Convex actions are not the desired architecture.
- The downloaded `@convex-dev/sandbox` component is private/local and must be installed from the provided source.

## Proposed Solution

- Install and mount `@convex-dev/sandbox` as a Convex component.
- Add a `daytona` BYOK service for the user's Daytona Sandbox API key.
- Keep raw keys encrypted and server-side.
- Extend `videoJobs` with sandbox execution metadata.
- Add Convex actions:
  - `startSandboxVideoExecution`
  - `refreshSandboxVideoExecution`
  - `cancelSandboxVideoExecution`
- Add an owner-checked Convex query:
  - `getSandboxExecutionOutput`
- Use the sandbox component to run a fixed PromptDeck video execution command.
- Store logs, sandbox job ids, artifact metadata, progress, and status on the user's video job.
- Update Video UI to use Start render, Refresh, Cancel, logs, and artifact output from the sandbox component.

## Files To Change

- `package.json`
- `package-lock.json`
- `convex/convex.config.ts`
- `convex/schema.ts`
- `convex/userApiKeys.ts`
- `convex/apiKeyActions.ts`
- `convex/videoJobs.ts`
- `convex/videoRender.ts`
- `src/App.tsx`
- `src/styles.css`
- `task.md`
- `changelog.md`
- `files.md`

## Edge Cases

- Logged-out users cannot execute Video jobs.
- Users without Daytona BYOK get a setup message.
- URL jobs still require Firecrawl BYOK.
- Sandbox job status may lag; refresh should be idempotent.
- Cancel should patch app job state even if remote cancel fails.
- Logs should be bounded to avoid large UI payloads.
- The v1 command must be fixed by the app, not provided by users.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Task Completion Log

- 2026-06-20 05:56 UTC: PRD created.
- 2026-06-20 06:18 UTC: Installed and mounted the local `@convex-dev/sandbox` component, added Daytona Sandbox as an encrypted BYOK service, extended video job schema with sandbox metadata, replaced direct render actions with sandbox start/refresh/cancel actions, added bounded sandbox logs in the Video tab, and updated project docs.
