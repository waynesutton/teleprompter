# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Added an explicit `deploy:static:prod` script for production Convex static hosting uploads.
- Added a `deploy:backend:prod` script and made `deploy` run backend production deploy before static upload.
- Added a `convex-static-hosting-deploy` skill with `/deploydev` and `/deployprod` workflows for this app.
- Added an About Stack section naming React, Vite, TypeScript, Codex, Convex, Convex Auth, and active Convex static hosting.
- Created a black and white Vite React teleprompter app with Convex-backed script and settings state.
- Added a two-tab workflow for prompting and script editing.
- Added prompter controls for playback, scroll position, font size, speed, mirrored text, and reading guide.
- Added a Fit control beside Scroll to auto-size script text to the current prompter window.
- Moved tab navigation to the bottom and removed header chrome from the prompter view.
- Added Convex static hosting component configuration and deploy scripts.
- Added a shared Convex-backed saved script library with Save Script and Load Script controls on Tab 2.
- Added a unified interaction system for app buttons, tabs, sliders, fields, focus, hover, active, selected, and disabled states.
- Added Tab 2 script formatting controls for whole-text colors, selected text colors, bold text, page breaks, and markdown export.
- Added 1x through 10x speed multiplier options, page navigation, and keyboard controls for playback, sizing, speed, and pages.
- Added Lexend and OpenDyslexic font options for accessible prompting.
- Added Tab 3 for default script settings and keyboard shortcut help.
- Added Convex-backed shared default script settings for newly loaded scripts.
- Added shared script delete with a custom in-app confirmation.
- Added tooltips for prompter, script, and help controls.
- Added Phosphor Icons as the app icon system.
- Added an npm override for `ws` to keep production dependency audit clean.
- Added a Tab 1 shortcut help button and modal with `Command + ?` / `Control + ?` open support and `Esc` close support.
- Added a guarded New Script flow on Tab 2 with save-first, discard, and cancel choices.
- Added PromptDeck as a bundled prompter font option.
- Added an optional Tab 2 AI script generator for OpenAI, Claude, OpenRouter, and Firecrawl-backed URL context.
- Added script character, word, read-time, and page counters below the script editor.
- Added custom folder support for saved scripts on Tab 2.
- Added a Tab 2 script preview toggle beside the Script text label.
- Added a darker grey whole-text and selected-text color option.
- Added `Command/Ctrl + 1`, `Command/Ctrl + 2`, and `Command/Ctrl + 3` shortcuts for switching tabs.
- Added `Command/Ctrl + Z` undo support for app-driven Tab 2 script tool changes.
- Added a Tab 1 voice control icon with an ElevenLabs setup status modal.
- Added a Convex voice status action that checks for `ELEVENLABS_API_KEY` without exposing it.
- Added a Tab 3 About section with brief open source copy and a feature table.
- Added a bottom-right Tab 1 dock toggle with a `SquareHalfBottom` icon and `B` keyboard shortcut.
- Added optional Tab 1 RSVP reading mode with ORP pivot highlighting, WPM control, progress scrubbing, and `V` keyboard toggle.
- Added an optional AI RSVP rewrite action that keeps basic RSVP playback independent from AI setup.
- Added Tab 3 instructions for using RSVP mode.
- Added a Tab 1 Gear menu for secondary prompter options.
- Added a Tab 1 Layout icon beside the Prompter tab for hiding and showing the main control bar.
- Added `C` as a keyboard shortcut for showing and hiding the countdown counter.
- Added built-in Script Voice Profiles for AI script generation, including Teleprompter Natural, Founder Update, YouTube Intro, Investor Pitch, Educator, and High-Energy Creator.
- Added Convex-backed custom Script Voice Profiles with save, edit, import-notes, and delete controls in the Tab 2 generator modal.
- Added a top-of-Tab-3 app docs section explaining the app workflow, Script Voice Profiles, RSVP, saving, shortcuts, and separate narration voice setup.
- Added a custom SVG favicon, 1200x630 social card, Open Graph metadata, Twitter large image card metadata, JSON-LD app/FAQ data, robots policy, and sitemap.
- Added Convex Auth GitHub login, per-user saved scripts/defaults/custom voices, and encrypted bring-your-own-key AI, Firecrawl, and ElevenLabs settings.
- Added a Tab 1 mini prompter popup using the Phosphor MonitorArrowUp icon, synced scroll/RSVP state, and forwarded keyboard shortcuts.
- Added a logged-in Build tab for script generation and reusable script Build items.
- Added a per-user Build item library for saving script work.
- Added Build tab controls for editing, archiving, restoring, deleting, seeding from the current script, and sending saved Build scripts back to the Script tab.
- Added a `promptdeck.app` custom domain setup PRD covering Convex production custom domains, Cloudflare DNS, Auth callback updates, metadata cutover, verification, and rollback.
- Added a signed-in account/profile modal with GitHub profile details, feature counts, sign out, and delete-account confirmation.
- Added a protected account deletion mutation that removes user-owned scripts, settings, Build items, custom voices, BYOK keys, auth sessions, auth accounts, refresh tokens, and the user profile.
- Added a visible Build BYOK setup checklist so logged-out users can see which provider keys are needed before signing in.
- Added a dedicated Account page for profile status, sign out, delete account, and BYOK provider setup.
- Added a source-first Creator Console layout to Build.
- Added a short PromptDeck default script for new/local sessions.
- Added app footers on Script, Build, Help, and Account with open source, Convex, Terms, and Privacy links.
- Added PromptDeck-styled Terms of Service and Privacy Policy modals adapted for PromptDeck.
- Added curated BYOK model selectors for OpenAI, Claude, and OpenRouter with custom model entry support.
- Added Tab 1 prompter background options for solid black, spotlight, and white with black text.
- Added PromptDeck-branded style tokens and the `#33E7A2` accent color across controls, focus states, metadata, and SVG social assets.
- Added PNG versions of the PromptDeck favicon and social card assets.
- Added AI prompt architecture documentation for script generation, RSVP rewrite, Script Voice Profiles, Firecrawl context, and provider calls.
- Added synced `.agents` project skills, including development, workflow, design, Convex, deployment, docs sync, and supporting agent/editor skills.
- Added per-user Account prompt settings so logged-in users can view, edit, copy, reset, and save the default AI script generator rules.
- Added Firecrawl-backed skill URL import for logged-in users so generated scripts can follow pasted or imported `SKILL.md` guidance.
- Added generated-script review actions for Copy, Save Markdown, and Send to Script before replacing the editor draft.
- Added a fixed-width terminal-style spinner to the Generate Script action while AI generation is running (2026-06-15 02:20 UTC).
- Added DevRel and Viral Video built-in Script Voice Profiles (2026-06-15 05:16 UTC).
- Added a screenshot-ready About Stack snapshot with BYOK chips for OpenAI, Claude, OpenRouter, Firecrawl, and ElevenLabs (2026-06-15 05:45 UTC).
- Added an Account saved voice library so users can load and delete their custom Script Voice Profiles (2026-06-15 05:16 UTC).
- Added browser-local draft, title, folder, and prompter settings persistence for signed-out users (2026-06-15 06:18 UTC).
- Added authenticated current prompt persistence for signed-in users (2026-06-15 06:18 UTC).
- Added an explicit Script library `Save As` action for intentional copies and variants, with create-only title/folder conflict handling (2026-06-15 18:18 UTC).
- Added a logged-in Video tab that queues private HyperFrames video jobs from prompts, URLs, scripts, and design markdown with Script Voice Profile tone selection (2026-06-19 22:16 UTC).
- Added a Convex `videoJobs` table and authenticated create/list functions for per-user video job tracking (2026-06-19 22:16 UTC).
- Added HeyGen / HyperFrames to Account BYOK settings so every user can bring their own video rendering key (2026-06-20 00:50 UTC).

### Changed

- Changed `deploy` and `deploy:static` to route through the production static upload script.
- Changed production deploy documentation to separate full backend+static deploys from static-only uploads.
- Updated GitHub Auth setup guidance to use the production Convex site instead of the dev site.
- Renamed the Tab 2 header save action to `Save to Library` and connected it to the shared script library save flow.
- Improved responsive prompter controls for mobile and compact 1024x600 displays.
- Moved the Tab 1 counter into the bottom control area and added hide/show controls.
- Replaced the redundant selected-text bold tool with focused selection color controls.
- Added a Tab 1 center-text control beside Fit.
- Reworked the Tab 1 control bar into grouped transport, scroll, view, typography, speed, and display clusters so labels and controls no longer collide.
- Shrunk the Tab 1 dock and bottom tab bar, made Start/Pause icon-only, and tuned desktop controls to fit on one row.
- Restyled app controls, tabs, panels, fields, and modals with the PromptDeck UI palette and typography while preserving the main prompter reading surface.
- Kept AI generation non-blocking for unconfigured installs by showing a setup warning modal instead of changing the editor flow.
- Made saved script title matching folder-aware so the same title can exist in different folders.
- Put Tab 2 Whole text and Selection formatting controls into one compact row when space allows.
- Replaced native browser dropdowns with PromptDeck styled selectors across prompter, script library, settings, and AI generation controls.
- Updated all keyboard shortcut helper locations with tab switching and script undo shortcuts.
- Kept voice control off by default, even when ElevenLabs is configured.
- Made the Tab 1 speed multiplier menu open upward so it stays visible near the bottom edge.
- Changed Tab 2 shared library controls to wrap inside the panel so long saved script controls do not overflow.
- Updated voice setup copy so configured voice controls stay available while RSVP continues to use Start and WPM pace.
- Moved Fit, Center, Mirror, Guide, Shortcuts, and AI RSVP rewrite behind the Tab 1 Gear menu to shorten the main control bar.
- Moved RSVP help copy into the Tab 3 About feature table instead of showing a separate settings panel.
- Raised the SquareHalfBottom dock toggle above the bottom tabs while the Tab 1 bar is visible.
- Kept the Tab 1 tab bar visible when the main control bar is hidden so keyboard-first prompting remains usable.
- Updated the hide/show shortcut to `H` or `B`.
- Increased Tab 1 vertical spacing between the countdown counter, main control bar, and tab row.
- Increased Tab 1 scroll exit space so final script text can pass the reading guide and leave the visible area.
- Adjusted Fit-to-window sizing to measure with the fit layout instead of the teleprompter exit padding.
- Updated AI script generation prompts to apply the selected Script Voice Profile while keeping ElevenLabs narration voice separate.
- Refreshed the README with current features, app workflow, optional AI/voice setup, and public metadata details.
- Changed Video job creation to require the signed-in user’s own HeyGen / HyperFrames key, plus one AI provider key and Firecrawl for URL context (2026-06-20 00:50 UTC).
- Updated the default first-run PromptDeck script to mention the agent AI script workflow and Video job flow without changing saved user scripts (2026-06-20 03:45 UTC).
- Changed the default Prompter reading guide setting to off and labeled Video job creation as Beta (2026-06-20 04:35 UTC).
- Changed AI, Firecrawl, and ElevenLabs setup from deployment-wide environment keys to per-user keys saved after GitHub login.
- Updated README and Tab 3 docs with the mini view, auth, and BYOK workflow details.
- Updated tab switching so `Command/Ctrl + 4` opens Video and `Command/Ctrl + 5` opens About (2026-06-19 22:16 UTC).
- Updated account deletion to remove user-owned video jobs along with the rest of the signed-in user's PromptDeck data (2026-06-19 22:16 UTC).
- Moved the mini view launcher beside the Tab 1 hide-bar control, shrank the mini popup controls, and removed the mini footer strip.
- Converted Mini View from a browser popup to a true in-app modal so it has no browser address/download chrome or fake window dots.
- Moved GitHub auth into the bottom tab rail as a neutral tab-sized account control with green hover/focus treatment.
- Made Mini View open as a smaller movable desktop panel with drag positioning, bottom-right resizing, and viewport clamping.
- Shortened the bottom rail labels to Prompter, Script, Help, and Sign in.
- Moved Script generator and BYOK settings out of Script and into Build.
- Updated tab switching shortcuts so `Command/Ctrl + 3` opens Build, `Command/Ctrl + 4` opens Video, and `Command/Ctrl + 5` opens About.
- Expanded the Build tab from setup-only planning into a content workspace for script drafts.
- Clarified that saving scripts and Build items requires GitHub login.
- Updated PromptDeck metadata, sitemap, robots policy, Auth setup docs, and custom domain docs to use `https://www.promptdeck.app/`.
- Clarified Convex Auth production setup for `JWT_PRIVATE_KEY` and `JWKS` after GitHub OAuth callback failures.
- Updated Convex Auth custom-domain setup to use `CUSTOM_AUTH_SITE_URL` instead of trying to override built-in `CONVEX_SITE_URL`.
- Moved BYOK provider settings from Build to Account.
- Changed the logged-in bottom rail account control to a compact profile icon.
- Changed Script library controls so save, load, delete, and folder management are visible only after GitHub login.
- Changed OpenAI, Claude, and OpenRouter generation so saved provider keys can use safe default models when no model is provided.
- Updated Script library copy from shared/everyone language to private per-user library language.
- Linked the footer `waynesutton.ai` credit to `https://waynesutton.ai`.
- Changed the default prompter background from the grey spotlight to solid black.
- Renamed the bundled app font option and UI style references from the old style-system name to PromptDeck.
- Updated Help/About copy with current features and a direct GitHub repository link.
- Moved signed-in default script settings from About/Help to Account, moved the prompter counter toggle into the Tab 1 gear menu, and renamed the bottom rail Help label to About.
- Polished the About tab shortcuts section into a full-width boxed panel with consistent section spacing.
- Updated README workflow copy so About owns docs/shortcuts and Account owns default settings and BYOK setup.
- Refocused Build around script generation first (2026-06-15).
- Changed AI script generation to use the logged-in user's saved prompt and imported skill guidance when present.
- Updated About copy to mention skill-supported script generation.
- Changed the Build Script creator to show Script as the fixed build type (2026-06-15 01:58 UTC).
- Simplified the Generate Script modal by removing model override, moving Script Voice Profile creation into Account, keeping the modal as a voice dropdown loader, and making it resizable on desktop and mobile-friendly (2026-06-15 02:20 UTC).
- Changed generated-script Send to Script so it closes the modal, switches to Script, and imports the generated draft (2026-06-15 05:16 UTC).
- Changed the Account Service selector to open upward (2026-06-15 05:16 UTC).
- Moved Account sign out, delete account, and ownership copy to a bottom Account access panel (2026-06-15 05:40 UTC).
- Filtered Account BYOK status chips and counts to the active script and narration services (2026-06-15 05:40 UTC).
- Changed app links to use PromptDeck control styling instead of browser-default link styling (2026-06-15 05:56 UTC).
- Removed the decorative gradient from the About Stack snapshot panel (2026-06-15 05:56 UTC).
- Changed the signed-out Build generator button to read `Log in to use` while keeping the existing login-required modal on click (2026-06-15 06:33 UTC).
- Changed the Generate Script modal footer so successful results use `Close` and `Regenerate`, failed generation uses `Try Again`, and closing an unused result asks for confirmation (2026-06-15 17:03 UTC).
- Moved Script tab save/export actions into Your library, kept New Script as the only header action, and added title/folder overwrite guardrails for saved scripts (2026-06-15 18:01 UTC).

### Fixed

- Fixed saved generated scripts appearing missing when the saved-script dropdown was filtered to a different folder (2026-06-15 06:18 UTC).

### Removed

- Removed `lucide-react` after migrating icons to Phosphor.
- Removed inactive planning panels, provider setup copy, setup docs, and BYOK options outside the script generation workflow (2026-06-15 05:16 UTC).
