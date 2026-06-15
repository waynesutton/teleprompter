---
name: convex-auth-expert
description: Expert Convex Auth setup, production, OAuth, security, and debugging guidance. Use when adding or auditing Convex Auth, configuring GitHub/Google/Apple OAuth, setting auth env vars, protecting Convex functions with getAuthUserId, debugging callback URLs, preparing production auth, rotating keys, or reviewing auth security.
---

# Convex Auth Expert

Use this skill for Convex Auth work in React/Vite, React Native, and supported Next.js apps.

## Source Check

Before giving setup advice or changing auth code, verify current docs when network is available:

- `https://docs.convex.dev/auth/convex-auth`
- `https://labs.convex.dev/auth/setup`
- `https://labs.convex.dev/auth/production`
- `https://labs.convex.dev/auth/security`
- `https://labs.convex.dev/auth/advanced`
- `https://labs.convex.dev/auth/config`
- `https://docs.convex.dev/llms.txt`

Latest retrieval used to create this skill: `2026-06-14 01:30 UTC`.

## Core Rules

- Use Convex Auth only when the user asks for Convex Auth or the project already uses `@convex-dev/auth`.
- Do not mix Convex Auth with Clerk, WorkOS, Robel Auth, Auth0, or Better Auth unless the user explicitly asks for migration or comparison.
- Treat Convex Auth as beta. Be conservative with production and security claims.
- Use separate OAuth apps and secrets for dev/local and production.
- Never expose provider secrets, JWT private keys, JWKS private material, or refresh tokens to the client.
- Protect user-owned data with `getAuthUserId(ctx)` and indexed owner checks.
- Keep logged-out flows useful when the product requires anonymous usage, but never allow anonymous access to private saved data.
- Use custom in-app auth/login-required UI. Do not use browser alerts.

## Setup Checklist

For an existing React/Vite app:

1. Install packages:

```bash
npm install @convex-dev/auth @auth/core
```

2. Initialize Convex Auth:

```bash
npx @convex-dev/auth
```

3. Add auth tables:

```ts
import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // app tables
});
```

4. Configure server auth:

```ts
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],
});
```

5. Add HTTP routes:

```ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);
export default http;
```

6. Wrap React:

```tsx
import { ConvexAuthProvider } from "@convex-dev/auth/react";

<ConvexAuthProvider client={convex}>
  <App />
</ConvexAuthProvider>
```

## OAuth Configuration

For GitHub OAuth, create separate apps:

| Environment | OAuth app | Homepage URL | Callback URL |
| --- | --- | --- | --- |
| Local + dev | `App Dev` | `http://localhost:5173` | `https://<dev>.convex.site/api/auth/callback/github` |
| Production | `App` | production site URL | `https://<prod-domain>/api/auth/callback/github` |

GitHub OAuth apps have one primary callback URL, so separate dev/prod apps avoid credential and redirect confusion.

Set env vars per deployment:

```bash
npx convex env set AUTH_GITHUB_ID <dev-client-id>
npx convex env set AUTH_GITHUB_SECRET <dev-client-secret>

npx convex env set --prod AUTH_GITHUB_ID <prod-client-id>
npx convex env set --prod AUTH_GITHUB_SECRET <prod-client-secret>
```

For custom production domains also set:

```bash
npx convex env set --prod SITE_URL https://your-domain.example
npx convex env set --prod CONVEX_SITE_URL https://your-domain.example
```

Use the Convex `.site` callback temporarily until the custom domain verifies, then switch production OAuth to the custom domain callback.

## Production Checklist

1. Test auth on the dev deployment.
2. Deploy backend to prod:

```bash
npx convex deploy --yes
```

3. Configure production auth variables:

```bash
npx @convex-dev/auth --prod
```

4. Configure OAuth provider env vars with `--prod`.
5. Confirm production callback URLs match the active production domain.
6. Smoke test sign in, sign out, page reload, and protected queries.
7. Verify dev OAuth credentials are not installed in prod.

## Protect Convex Functions

Use `getAuthUserId(ctx)` from `@convex-dev/auth/server`.

For protected reads:

```ts
const ownerId = await getAuthUserId(ctx);
if (!ownerId) return [];

return await ctx.db
  .query("items")
  .withIndex("by_ownerId_and_updatedAt", (q) => q.eq("ownerId", ownerId))
  .order("desc")
  .take(50);
```

For protected mutations:

```ts
const ownerId = await getAuthUserId(ctx);
if (!ownerId) return null;

await ctx.db.insert("items", {
  ownerId,
  createdAt: Date.now(),
});
```

Rules:

- Add `ownerId: v.id("users")` or optional migration-safe owner fields for private data.
- Add indexes that start with `ownerId`.
- Use indexed queries for ownership checks.
- Do not read all rows and filter by owner in JavaScript.
- Avoid `ctx.db.get()` as the only ownership check when an indexed owner query is available.

## Security Guidance

Convex Auth web clients store client-accessible auth material so WebSocket auth can work in browser apps. Treat XSS prevention as critical.

Do:

- Keep React escaping intact.
- Avoid `dangerouslySetInnerHTML`; sanitize any user HTML if unavoidable.
- Keep dependencies patched.
- Require recent sign-in for sensitive actions when appropriate.
- Use HTTP-only/server-cookie patterns only in supported server-rendered integrations.
- Rotate keys after suspected compromise.

If an XSS incident could expose auth material:

1. Fix the vulnerability.
2. Clear `authSessions` in the Convex dashboard to force sign-in.
3. Rotate private/public auth keys:

```bash
npx @convex-dev/auth --prod
```

## Common Debugging

- Callback mismatch: check GitHub OAuth callback exactly equals `https://<site>/api/auth/callback/github`.
- Wrong deployment: verify dev uses dev `.site` and prod uses prod/custom domain.
- Missing env vars: check `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `SITE_URL`, `JWT_PRIVATE_KEY`, and `JWKS`.
- Custom domain auth failure: update provider callback, `SITE_URL`, `CONVEX_SITE_URL`, redeploy, then clear stale browser state.
- Users see each other's data: audit tables for missing `ownerId`, missing owner indexes, or unprotected public queries.
- Login works then reload fails: inspect storage/session handling and production env/domain mismatch.

## Review Checklist

Before calling auth work done:

- Auth tables are in schema.
- `convex/auth.ts` exports Convex Auth helpers.
- HTTP routes include `auth.addHttpRoutes(http)`.
- React is wrapped in `ConvexAuthProvider`.
- Provider env vars exist for the correct deployment.
- OAuth callback URLs match environment.
- Protected data tables have owner fields and owner indexes.
- Queries/mutations/actions enforce auth where required.
- Anonymous UX still works only where intentionally allowed.
- Production docs mention callback and env var updates for custom domains.

## Sources

- Convex Auth overview: `https://docs.convex.dev/auth/convex-auth`
- Setup: `https://labs.convex.dev/auth/setup`
- Production: `https://labs.convex.dev/auth/production`
- Security: `https://labs.convex.dev/auth/security`
- Advanced: `https://labs.convex.dev/auth/advanced`
- Configuration: `https://labs.convex.dev/auth/config`
- Convex docs index for agents: `https://docs.convex.dev/llms.txt`
