# Teleprompter Demo Skill Pack

Created: 2026-06-22 19:16 UTC

## Summary

Create a portable teleprompter demo skill pack that turns PromptDeck's current Script Voice Profiles into reusable agent instructions for scripts, demos, and narration workflows. The pack should be easy to copy into another project and useful for AI writing agents or voice narration agents.

## Goals

- Capture the existing PromptDeck voice profiles in portable skill references.
- Include guidance for teleprompter-ready scripts, demo structures, and ElevenLabs-style narration preparation.
- Reference the project's writing principles and Stop Slop-style anti-AI-writing checks.
- Keep the skill pack independent from the app runtime so it can be copied to any project.

## Scope

- Add `portable-skills/demo-voice/SKILL.md`.
- Add references for personas, demo structures, and narration-agent output.
- Update `files.md`, `task.md`, and `changelog.md`.

## Notes

- The repository `.agents/skills` folder was read-protected in this sandbox. The portable pack lives in `portable-skills/` so it can be reviewed and copied into `.agents/skills/` manually when desired.
- The pack covers Teleprompter Natural, Founder Update, YouTube Intro, Investor Pitch, Educator, High-Energy Creator, DevRel, Viral Video, and Narration Agent workflows.

## Completion Log

- 2026-06-22 19:16 UTC - Added the portable demo skill pack with persona, structure, and narration references.
- 2026-06-22 20:17 UTC - Expanded the pack from script-only guidance into a broader human demo writing pack for posts, docs, launch copy, README sections, DevRel explainers, and narration.
- 2026-06-22 20:31 UTC - Renamed the portable skill pack to `demo-voice` and updated slash command examples.
- 2026-06-22 23:41 UTC - Wired the new Convex voice persona into `demo-voice`, added the `/demo-voice convex persona ...` example, and adjusted the persona to avoid imitating named people.
