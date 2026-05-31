# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

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
- Added Graphite as a bundled prompter font option.
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

### Changed

- Renamed the Tab 2 header save action to `Save to Library` and connected it to the shared script library save flow.
- Improved responsive prompter controls for mobile and compact 1024x600 displays.
- Moved the Tab 1 counter into the bottom control area and added hide/show controls.
- Replaced the redundant selected-text bold tool with focused selection color controls.
- Added a Tab 1 center-text control beside Fit.
- Reworked the Tab 1 control bar into grouped transport, scroll, view, typography, speed, and display clusters so labels and controls no longer collide.
- Shrunk the Tab 1 dock and bottom tab bar, made Start/Pause icon-only, and tuned desktop controls to fit on one row.
- Restyled app controls, tabs, panels, fields, and modals with the Graphite UI palette and typography while preserving the main prompter reading surface.
- Kept AI generation non-blocking for unconfigured installs by showing a setup warning modal instead of changing the editor flow.
- Made saved script title matching folder-aware so the same title can exist in different folders.
- Put Tab 2 Whole text and Selection formatting controls into one compact row when space allows.
- Replaced native browser dropdowns with Graphite styled selectors across prompter, script library, settings, and AI generation controls.
- Updated all keyboard shortcut helper locations with tab switching and script undo shortcuts.
- Kept voice control off by default, even when ElevenLabs is configured.
- Made the Tab 1 speed multiplier menu open upward so it stays visible near the bottom edge.
- Changed Tab 2 shared library controls to wrap inside the panel so long saved script controls do not overflow.
- Updated voice setup copy so configured voice controls stay available while RSVP continues to use Start and WPM pace.

### Removed

- Removed `lucide-react` after migrating icons to Phosphor.
