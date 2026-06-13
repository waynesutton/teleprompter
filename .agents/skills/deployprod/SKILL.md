---
name: deployprod
description: Use when the user says /deployprod, deploy prod, deploy production, upload production static hosting, or asks to deploy this teleprompt app to the production Convex static-hosting target.
---

# Deploy Prod

Use this skill only for the production `@convex-dev/static-hosting` target.

Source of truth:

- Component repo: `https://github.com/get-convex/static-hosting`
- Component docs: `https://www.convex.dev/components/static-hosting`
- Custom domains: `https://docs.convex.dev/production/custom-domains`

## Target

| Intent | Public URL | Convex cloud URL | Command |
| --- | --- | --- | --- |
| `/deployprod` | `https://befitting-dodo-95.convex.site/` | `https://befitting-dodo-95.convex.cloud` | `npm run deploy` |
| Static-only prod | `https://befitting-dodo-95.convex.site/` | `https://befitting-dodo-95.convex.cloud` | `npm run deploy:static:prod` |

Production is the public/canonical target for `promptdeck.app`.

## Required Rules

- Prefer `npm run deploy` for production.
- Use `npm run deploy:static:prod` only when backend functions, schema, auth routes, and Convex components are already deployed.
- Do not run `npm run build` separately before static upload. Static-hosting's `--build` flag injects the correct `VITE_CONVEX_URL`.
- If production static upload fails with `Could not find function for 'staticHosting:generateUploadUrls'`, run `npx convex deploy --yes`, then rerun `npm run deploy:static:prod`.
- Keep production as the canonical target in SEO, Open Graph, Twitter card, sitemap, robots, GitHub Auth callback URLs, `SITE_URL`, and `CONVEX_SITE_URL`.

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

## When To Update Project Docs

Update docs only if deploy behavior changes:

- `README.md`
- `changelog.md`
- `task.md`
- `files.md`

If the deploy behavior change is non-trivial, create a PRD in `prds/`.
