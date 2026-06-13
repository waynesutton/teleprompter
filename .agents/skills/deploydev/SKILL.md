---
name: deploydev
description: Use when the user says /deploydev, deploy dev, upload dev static hosting, or asks to deploy this teleprompt app to the development Convex static-hosting target.
---

# Deploy Dev

Use this skill only for the development `@convex-dev/static-hosting` target.

Source of truth:

- Component repo: `https://github.com/get-convex/static-hosting`
- Component docs: `https://www.convex.dev/components/static-hosting`

## Target

| Intent | Public URL | Convex cloud URL | Command |
| --- | --- | --- | --- |
| `/deploydev` | `https://fearless-dolphin-422.convex.site/` | `https://fearless-dolphin-422.convex.cloud` | `npm run deploy:static:dev` |

Keep the dev URL private. Do not publish it in SEO, Open Graph, Twitter card, sitemap, robots, or public README copy except where explicitly documenting dev/prod behavior.

## Required Rules

- Use this only when the user explicitly asks for dev.
- Do not update public metadata to the dev URL.
- Do not run `npm run build` separately before static upload. Static-hosting's `--build` flag injects the correct `VITE_CONVEX_URL`.
- Do not deploy backend production functions from this workflow.

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

4. Report the dev URL and remind that it is not the public/canonical app.

## When To Update Project Docs

Update docs only if deploy behavior changes:

- `README.md`
- `changelog.md`
- `task.md`
- `files.md`

If the deploy behavior change is non-trivial, create a PRD in `prds/`.
