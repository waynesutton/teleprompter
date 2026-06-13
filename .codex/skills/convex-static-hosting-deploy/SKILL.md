---
name: convex-static-hosting-deploy
description: Use when deploying this teleprompt app with get-convex/static-hosting, especially when the user says /deploydev, /deployprod, deploy dev, deploy prod, deploy production, upload static hosting, or asks which Convex static-hosting command to run. Keeps dev uploads on fearless-dolphin-422 and production uploads on befitting-dodo-95.
---

# Convex Static Hosting Deploy

Use this skill for this repo's `@convex-dev/static-hosting` deploys.

Source of truth:

- Component repo: `https://github.com/get-convex/static-hosting`
- Component docs: `https://www.convex.dev/components/static-hosting`
- Custom domains: `https://docs.convex.dev/production/custom-domains`

## Deployment Targets

| Intent | Public URL | Convex cloud URL | Command |
| --- | --- | --- | --- |
| `/deploydev` | `https://fearless-dolphin-422.convex.site/` | `https://fearless-dolphin-422.convex.cloud` | `npm run deploy:static:dev` |
| `/deployprod` | `https://befitting-dodo-95.convex.site/` | `https://befitting-dodo-95.convex.cloud` | `npm run deploy` |
| Static-only prod | `https://befitting-dodo-95.convex.site/` | `https://befitting-dodo-95.convex.cloud` | `npm run deploy:static:prod` |

Keep the dev URL private. Do not publish or put it in SEO, Open Graph, Twitter card, sitemap, robots, or public README copy except where explicitly documenting dev/prod behavior.

## Required Rules

- For production, prefer `npm run deploy`.
- Use `npm run deploy:static:prod` only when backend functions, schema, auth routes, and Convex components are already deployed.
- Use `npm run deploy:static:dev` only when the user explicitly asks for dev.
- Do not run `npm run build` separately before static upload. Static-hosting's `--build` flag injects the correct `VITE_CONVEX_URL`.
- If production static upload fails with `Could not find function for 'staticHosting:generateUploadUrls'`, run `npx convex deploy --yes`, then rerun `npm run deploy:static:prod`.
- If changing custom domain settings for `promptdeck.app`, keep production as the canonical target and update GitHub Auth callback URLs and `SITE_URL`/`CONVEX_SITE_URL` in Convex production env vars.

## `/deployprod` Workflow

1. Run quick checks unless the user explicitly says to skip them:

   ```bash
   npm run typecheck
   npm run lint
   ```

2. Deploy backend plus production static hosting:

   ```bash
   npm run deploy
   ```

3. Confirm deploy output includes:

   ```text
   VITE_CONVEX_URL=https://befitting-dodo-95.convex.cloud
   Deploying to production environment
   Your app is now available at: https://befitting-dodo-95.convex.site
   ```

4. Smoke check production:

   ```bash
   curl -L -s https://befitting-dodo-95.convex.site/ | rg 'fearless-dolphin-422|befitting-dodo-95|/assets/index-'
   ```

   The page should show `befitting-dodo-95` and no public `fearless-dolphin-422` metadata.

## `/deploydev` Workflow

1. Confirm the user asked for dev.
2. Run:

   ```bash
   npm run deploy:static:dev
   ```

3. Confirm deploy output includes:

   ```text
   VITE_CONVEX_URL=https://fearless-dolphin-422.convex.cloud
   Deploying to development environment
   Your app is now available at: https://fearless-dolphin-422.convex.site
   ```

4. Do not update public metadata to the dev URL.

## When To Update Project Docs

After changing deploy behavior, update:

- `README.md`
- `changelog.md`
- `task.md`
- `files.md`

If a deploy behavior change is non-trivial, create a PRD in `prds/`.
