Created: 2026-06-11 21:26 UTC
Last Updated: 2026-06-11 21:26 UTC
Status: Done

# Production Static Hosting Deploy

## Problem

Static hosting deploys have been uploaded to the Convex development deployment at `https://fearless-dolphin-422.convex.site/` instead of the production deployment at `https://befitting-dodo-95.convex.site/`.

## Root Cause

The project has both dev and production static upload scripts. Recent uploads used `npm run deploy:static:dev`, and `.env.local` is intentionally pinned to the dev deployment for local work. If a production deploy is built outside the static-hosting `--build --prod` flow, Vite can compile the browser bundle with the dev Convex URL.

## Proposed Solution

- Add an explicit production deploy script named `deploy:static:prod`.
- Add a full production deploy script that pushes Convex backend/component functions before uploading static files.
- Keep `deploy:static` as the production static upload script.
- Document that production deploys must use `--build --prod` and must not run `npm run build` separately first.
- Document that `.env.local` can stay pointed at dev for local development.
- Update project docs and tracking so future deploy requests use the production script by default.

## Files To Change

- `package.json`
- `README.md`
- `changelog.md`
- `files.md`
- `task.md`

## Verification Steps

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx convex deploy --yes`
- `npm run deploy:static:prod`

## Task Completion Log

- 2026-06-11 21:26 UTC - Added `deploy:static:prod`, routed `deploy:static` through production static upload, made `deploy` run the production backend deploy before static upload, and documented the dev/prod deploy split. Verified with `npm run typecheck`, `npm run lint`, `npm run build`, `npx convex deploy --yes`, and `npm run deploy:static:prod`.
