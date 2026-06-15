Created: 2026-05-31 22:03 UTC
Last Updated: 2026-06-14 01:55 UTC
Status: Done

# Convex Auth GitHub Setup

## Problem

Saved scripts, custom Script Voice Profiles, AI generation, Firecrawl scraping, and voice setup need user ownership. The app also needs to keep the no-login teleprompter workflow for users who only paste or type a script and read it on Tab 1.

## Root Cause

The app started with shared Convex records and deployment-level API keys. That makes every saved script and voice global, and it makes AI features depend on app owner environment variables instead of each logged-in user's keys.

## Proposed Solution

- Use Convex Auth with GitHub OAuth only.
- Keep anonymous use local-only for script typing, preview, export, Tab 1 scroll, and RSVP.
- Require GitHub login for saved library, saved defaults, custom Script Voice Profiles, AI generation, Firecrawl URL scraping, and ElevenLabs voice setup.
- Store user AI, Firecrawl, and ElevenLabs keys per user in Convex, encrypted with `USER_KEYS_SECRET`.
- Remove WayneSutton.ai as a built-in default and let users create their own personalities.

## Setup Steps

1. Install auth packages:

   ```bash
   npm install @convex-dev/auth @auth/core
   ```

2. Add `convex/auth.ts`:

   ```ts
   import GitHub from "@auth/core/providers/github";
   import { convexAuth } from "@convex-dev/auth/server";

   export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
     providers: [GitHub],
   });
   ```

3. Add auth HTTP routes before static hosting routes in `convex/http.ts`:

   ```ts
   auth.addHttpRoutes(http);
   ```

4. Add Convex Auth tables to `convex/schema.ts`:

   ```ts
   import { authTables } from "@convex-dev/auth/server";

   export default defineSchema({
     ...authTables,
   });
   ```

5. Wrap the React app in `ConvexAuthProvider` from `@convex-dev/auth/react`.

6. Create a GitHub OAuth app:

   - Homepage URL: `https://www.promptdeck.app`
   - Authorization callback URL: `https://www.promptdeck.app/api/auth/callback/github`
   - Local callback during dev: use the Convex dev site URL shown by `npx convex dev`, with `/api/auth/callback/github`.

7. Set Convex environment variables:

   ```bash
   npx convex env set --prod AUTH_GITHUB_ID "..."
   npx convex env set --prod AUTH_GITHUB_SECRET "..."
   npx convex env set --prod SITE_URL "https://www.promptdeck.app"
   npx convex env set --prod CUSTOM_AUTH_SITE_URL "https://www.promptdeck.app"
   npx convex env set --prod USER_KEYS_SECRET "generate-a-long-random-secret"
   ```

8. Generate and set Convex Auth JWT/JWKS secrets using the current Convex Auth setup flow:

   ```bash
   npx @convex-dev/auth
   ```

   Keep the generated `JWT_PRIVATE_KEY` and `JWKS` values in Convex environment variables:

   ```bash
   npx convex env set --prod JWT_PRIVATE_KEY "paste-generated-private-key"
   npx convex env set --prod JWKS "paste-generated-jwks-json"
   ```

   If production login fails with `Missing environment variable JWT_PRIVATE_KEY`, this step has not been completed on the production Convex deployment.

   Do not set `CONVEX_SITE_URL`; Convex provides it as a built-in deployment variable. Use `CUSTOM_AUTH_SITE_URL` when the OAuth callback should use the custom domain.

9. Optional legacy data claim:

   ```bash
   npx convex env set --prod LEGACY_OWNER_EMAIL "your-github-email@example.com"
   npx convex env set --prod LEGACY_OWNER_GITHUB_LOGIN "your-github-name"
   ```

   After signing in as that account, run `legacyMigration.claimLegacySharedData` once from the Convex dashboard to attach old shared records to that user.

## Files To Change

- `package.json`
- `convex/auth.ts`
- `convex/http.ts`
- `convex/schema.ts`
- `convex/teleprompter.ts`
- `convex/scriptVoices.ts`
- `convex/aiScripts.ts`
- `convex/voice.ts`
- `convex/userApiKeys.ts`
- `convex/apiKeyActions.ts`
- `convex/users.ts`
- `convex/legacyMigration.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`

## Edge Cases

- Logged-out users can still paste/type scripts and use Tab 1.
- Logged-out users see PromptDeck login modals for saved library, AI, Firecrawl, voice, defaults, and custom voices.
- Provider keys are write-only from the browser's perspective.
- Existing unowned data is hidden until claimed by the configured legacy owner.
- Firecrawl URL generation requires both a configured AI provider key and Firecrawl key.

## Verification Steps

- `npx convex dev --once`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run deploy:static:dev`
- Manual login with GitHub.
- Manual logged-out prompt-only workflow.
- Manual per-user saved script and custom voice isolation.
- Manual BYOK provider status and AI generation.

## Task Completion Log

- 2026-05-31 22:03 UTC - Added Convex Auth GitHub provider wiring, auth HTTP routes, auth tables, per-user saved data, login UI, login-required modals, encrypted BYOK API key storage, per-user AI/Firecrawl/ElevenLabs status, and legacy shared data claim mutation.
- 2026-05-31 22:03 UTC - Verified with `npx convex dev --once`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- 2026-05-31 22:15 UTC - Uploaded the latest verified build to Convex static hosting with `npm run deploy:static:dev`.
- 2026-06-14 01:55 UTC - Updated production OAuth and Convex Auth environment setup for `https://www.promptdeck.app/`, including explicit production `JWT_PRIVATE_KEY`, `JWKS`, and `CUSTOM_AUTH_SITE_URL` guidance.
