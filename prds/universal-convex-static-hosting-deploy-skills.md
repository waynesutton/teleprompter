# Universal Convex Static Hosting Deploy Skills

Created: 2026-06-22 00:24 UTC

## Summary

Make the `.agents` Convex static-hosting deploy skills portable so they can be copied into another Convex app without PromptDeck-specific URLs, app names, or deployment slugs.

## Goals

- Remove hard-coded development and production Convex URLs from deploy skills.
- Remove PromptDeck and teleprompt-specific wording from deploy skill descriptions.
- Prefer `package.json` scripts when the current app already defines deploy commands.
- Provide direct fallback commands for apps without deploy scripts.
- Tell agents to discover the static hosting component name from `convex/convex.config.ts`.
- Keep dev and production deploy workflows separate.

## Non-Goals

- Do not change runtime app deploy scripts.
- Do not deploy as part of the skill update.
- Do not change the project-level dev skill.

## Updated Skills

- `.agents/skills/deploydev/SKILL.md`
- `.agents/skills/deployprod/SKILL.md`
- `.agents/skills/convex-static-hosting-deploy/SKILL.md`

## Completion Log

- 2026-06-22 00:24 UTC - Rewrote the three static-hosting deploy skills to be app-agnostic, script-first, component-name-aware, and safe to copy into other Convex static-hosting apps.
