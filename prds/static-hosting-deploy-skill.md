Created: 2026-06-12 17:04 UTC
Last Updated: 2026-06-12 17:04 UTC
Status: Done

# Static Hosting Deploy Skill

## Problem

The app has separate Convex development and production static-hosting deployments. Future deploy prompts need to reliably target the right environment, especially when the user asks for `/deploydev` or `/deployprod`.

## Root Cause

The static-hosting component supports both `--dev` and `--prod`, and `.env.local` points at the dev deployment for local development. Production deploys must use the component's `--build --prod` flow so Vite receives the production `VITE_CONVEX_URL`.

## Proposed Solution

- Add a project skill named `convex-static-hosting-deploy`.
- Document `/deploydev` as the dev static upload workflow.
- Document `/deployprod` as the production backend plus static upload workflow.
- Include the production and dev deployment URLs and expected Convex URL checks.
- Warn not to run `npm run build` separately before static upload.

## Files To Change

- `.codex/skills/convex-static-hosting-deploy/SKILL.md`
- `changelog.md`
- `files.md`
- `task.md`

## Verification Steps

- Confirm the skill file has valid frontmatter.
- Confirm public metadata continues to point at production.

## Task Completion Log

- 2026-06-12 17:04 UTC - Added the `convex-static-hosting-deploy` skill with `/deploydev` and `/deployprod` workflows, verified public metadata points at production, and updated Auth setup guidance to the production Convex site.
