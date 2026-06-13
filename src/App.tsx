import { type PointerEvent as ReactPointerEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import {
  Archive,
  ArrowCounterClockwise,
  Article,
  CaretDown,
  CaretLeft,
  CaretRight,
  CornersOut,
  DownloadSimple,
  Eye,
  FlipHorizontal,
  FloppyDisk,
  FolderOpen,
  Gauge,
  GearSix,
  GithubLogo,
  Layout,
  List,
  Microphone,
  MonitorArrowUp,
  Pause,
  PencilSimple,
  Play,
  Plus,
  Question,
  SlidersHorizontal,
  Sparkle,
  TextAlignCenter,
  Trash,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

type PromptTab = "prompter" | "script" | "build" | "help";
type TextColor = "white" | "red" | "yellow" | "grey" | "darkgrey";
type PromptFont = "system" | "graphite" | "lexend" | "opendyslexic";
type LayoutMode = "left" | "centered";
type AiProvider = "auto" | "openai" | "claude" | "openrouter";
type AiLength = "short" | "long" | "open";
type ReadingMode = "scroll" | "rsvp";
type SelectOption<Value extends string> = { value: Value; label: string };
type ScriptVoiceProfile = {
  id: string;
  name: string;
  audience: string;
  tone: string;
  pacing: string;
  bannedWords: string;
  preferredPhrases: string;
  examples: string;
  structure: string;
  defaultLength: AiLength;
  source: "builtin" | "custom";
};

type AiProviderStatus = {
  isAuthenticated: boolean;
  providers: Array<{ provider: Exclude<AiProvider, "auto">; label: string; model: string }>;
  hasFirecrawl: boolean;
};

type VoiceStatus = {
  isAuthenticated: boolean;
  isConfigured: boolean;
  provider: string;
};

type UserApiKeyService = "openai" | "claude" | "openrouter" | "firecrawl" | "elevenlabs" | "mux" | "heygen";

type UserApiKeyStatus = {
  isAuthenticated: boolean;
  keys: Array<{
    service: UserApiKeyService;
    isConfigured: boolean;
    model: string | null;
    siteUrl: string | null;
    appName: string | null;
  }>;
};

type BuildItemKind = "script" | "video" | "both";
type BuildItemStatus = "active" | "archived";
type BuildSourceType = "prompt" | "link" | "doc" | "script" | "mixed";
type BuildItem = {
  _id: Id<"buildItems">;
  kind: BuildItemKind;
  status: BuildItemStatus;
  sourceType: BuildSourceType;
  title: string;
  sourceText?: string;
  scriptSnapshot?: string;
  videoBrief?: string;
  transcriptText?: string;
  editPlan?: string;
  edlJson?: string;
  subtitleStyle?: string;
  renderChecklist?: string;
  projectMemory?: string;
  outputFormat?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
};

type PromptSettings = {
  fontSize: number;
  speed: number;
  speedMultiplier: number;
  scroll: number;
  mirrored: boolean;
  guide: boolean;
  fitToWindow: boolean;
  textColor: TextColor;
  fontFamily: PromptFont;
  layoutMode: LayoutMode;
};
type ShortcutEventLike = {
  key: string;
  code?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  target?: EventTarget | null;
  targetTag?: string;
  preventDefault: () => void;
};
type MiniViewFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type MiniViewInteraction = {
  mode: "move" | "resize";
  startClientX: number;
  startClientY: number;
  startFrame: MiniViewFrame;
};

const DEFAULT_SCRIPT = `Hello everyone, and welcome to our channel!

[short pause]

Today, we have an exciting announcement to share with you.
Start with your strongest line, keep your eyes near the lens, and let the words move at your pace.

Thank you for watching.`;

const DEFAULT_SETTINGS: PromptSettings = {
  fontSize: 56,
  speed: 36,
  speedMultiplier: 1,
  scroll: 0,
  mirrored: false,
  guide: true,
  fitToWindow: false,
  textColor: "white",
  fontFamily: "system",
  layoutMode: "left",
};
const MINI_VIEW_MIN_WIDTH = 360;
const MINI_VIEW_MIN_HEIGHT = 240;
const MINI_VIEW_MARGIN = 12;

const getDefaultMiniViewFrame = (): MiniViewFrame => {
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
  const width = Math.min(620, Math.max(MINI_VIEW_MIN_WIDTH, viewportWidth - MINI_VIEW_MARGIN * 2));
  const height = Math.min(380, Math.max(MINI_VIEW_MIN_HEIGHT, viewportHeight - MINI_VIEW_MARGIN * 2));

  return {
    width,
    height,
    x: Math.max(MINI_VIEW_MARGIN, viewportWidth - width - 88),
    y: Math.max(MINI_VIEW_MARGIN, 88),
  };
};

const clampMiniViewFrame = (frame: MiniViewFrame): MiniViewFrame => {
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight;
  const maxWidth = Math.max(MINI_VIEW_MIN_WIDTH, viewportWidth - MINI_VIEW_MARGIN * 2);
  const maxHeight = Math.max(MINI_VIEW_MIN_HEIGHT, viewportHeight - MINI_VIEW_MARGIN * 2);
  const width = clamp(frame.width, Math.min(MINI_VIEW_MIN_WIDTH, maxWidth), maxWidth);
  const height = clamp(frame.height, Math.min(MINI_VIEW_MIN_HEIGHT, maxHeight), maxHeight);

  return {
    width,
    height,
    x: clamp(frame.x, MINI_VIEW_MARGIN, Math.max(MINI_VIEW_MARGIN, viewportWidth - width - MINI_VIEW_MARGIN)),
    y: clamp(frame.y, MINI_VIEW_MARGIN, Math.max(MINI_VIEW_MARGIN, viewportHeight - height - MINI_VIEW_MARGIN)),
  };
};

const SPEED_MULTIPLIERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const SPEED_MULTIPLIER_OPTIONS: Array<SelectOption<string>> = SPEED_MULTIPLIERS.map((multiplier) => ({
  value: String(multiplier),
  label: `${multiplier}x`,
}));
const TEXT_COLORS: Array<{ value: TextColor; label: string }> = [
  { value: "white", label: "White" },
  { value: "red", label: "Red" },
  { value: "yellow", label: "Yellow" },
  { value: "grey", label: "Grey" },
  { value: "darkgrey", label: "Dark grey" },
];
const FONT_OPTIONS: Array<SelectOption<PromptFont>> = [
  { value: "system", label: "System" },
  { value: "graphite", label: "Graphite" },
  { value: "lexend", label: "Lexend" },
  { value: "opendyslexic", label: "OpenDyslexic" },
];
const LAYOUT_OPTIONS: Array<SelectOption<LayoutMode>> = [
  { value: "left", label: "Left aligned" },
  { value: "centered", label: "Left aligned, centered page" },
];
const AI_PROVIDER_OPTIONS: Array<SelectOption<AiProvider>> = [
  { value: "auto", label: "Auto" },
  { value: "openai", label: "OpenAI" },
  { value: "claude", label: "Claude" },
  { value: "openrouter", label: "OpenRouter" },
];
const AI_LENGTH_OPTIONS: Array<SelectOption<AiLength>> = [
  { value: "short", label: "1-3 min" },
  { value: "long", label: "5+ min" },
  { value: "open", label: "Open" },
];
const API_KEY_SERVICE_OPTIONS: Array<SelectOption<UserApiKeyService>> = [
  { value: "openai", label: "OpenAI" },
  { value: "claude", label: "Claude" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "firecrawl", label: "Firecrawl" },
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "mux", label: "Mux" },
  { value: "heygen", label: "HeyGen" },
];
const BUILD_KIND_OPTIONS: Array<SelectOption<BuildItemKind>> = [
  { value: "script", label: "Script" },
  { value: "video", label: "Video" },
  { value: "both", label: "Script + Video" },
];
const BUILD_SOURCE_OPTIONS: Array<SelectOption<BuildSourceType>> = [
  { value: "script", label: "Current script" },
  { value: "prompt", label: "Prompt" },
  { value: "link", label: "Link" },
  { value: "doc", label: "Doc" },
  { value: "mixed", label: "Mixed" },
];
const BUILD_STATUS_OPTIONS: Array<SelectOption<BuildItemStatus | "all">> = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];
const EMPTY_BUILD_FORM = {
  kind: "both" as BuildItemKind,
  sourceType: "script" as BuildSourceType,
  title: "",
  sourceText: "",
  scriptSnapshot: "",
  videoBrief: "",
  transcriptText: "",
  editPlan: "",
  edlJson: "",
  subtitleStyle: "",
  renderChecklist: "",
  projectMemory: "",
  outputFormat: "1920x1080 landscape, 30fps",
  notes: "",
};
const VIDEO_OUTPUT_OPTIONS: Array<SelectOption<string>> = [
  { value: "1920x1080 landscape, 30fps", label: "Landscape 1080p" },
  { value: "1080x1920 vertical, 30fps", label: "Vertical 1080p" },
  { value: "1080x1080 square, 30fps", label: "Square 1080p" },
  { value: "3840x2160 landscape, 24fps", label: "4K landscape" },
];
const DEFAULT_RENDER_CHECKLIST = [
  "[ ] Source clips or links added",
  "[ ] Word-level transcript generated or imported",
  "[ ] Strategy approved before editing",
  "[ ] EDL JSON reviewed",
  "[ ] Cut edges stay on word boundaries",
  "[ ] 30ms audio fades planned at every cut",
  "[ ] Subtitles applied last",
  "[ ] Preview render reviewed",
  "[ ] Final render ready for Mux or download",
].join("\n");
const DEFAULT_SUBTITLE_STYLE = "Natural sentence case, 4-7 words per line, bottom center, high contrast, subtitles applied last.";
const MODEL_KEY_SERVICES = new Set<UserApiKeyService>(["openai", "claude", "openrouter", "mux"]);
const SITE_APP_KEY_SERVICES = new Set<UserApiKeyService>(["openrouter", "mux"]);
const API_KEY_HELP: Record<UserApiKeyService, { keyLabel: string; modelLabel: string; modelPlaceholder: string; siteLabel: string; appLabel: string; help: string }> = {
  openai: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "gpt-4.1-mini",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Used for script generation and RSVP rewrites.",
  },
  claude: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "claude-3-5-sonnet-latest",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Used for script generation and RSVP rewrites.",
  },
  openrouter: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "openai/gpt-4.1-mini",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Used for model routing when you prefer OpenRouter.",
  },
  firecrawl: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Used to scrape the first URL or markdown link before generation.",
  },
  elevenlabs: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Used for narration voice features when voice mode is enabled.",
  },
  mux: {
    keyLabel: "Token secret",
    modelLabel: "Token ID",
    modelPlaceholder: "Mux token ID",
    siteLabel: "Webhook signing secret",
    appLabel: "Playback domain",
    help: "Use Mux for video uploads, playback IDs, webhook sync, and delivery.",
  },
  heygen: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Optional narration/avatar provider. HyperFrames itself renders locally or on workers.",
  },
};
const BUILT_IN_SCRIPT_VOICES: ScriptVoiceProfile[] = [
  {
    id: "builtin-natural",
    name: "Teleprompter Natural",
    audience: "Viewers who need a clear, low-friction spoken explanation.",
    tone: "Plain, calm, human, and easy to read out loud.",
    pacing: "Medium pace with short paragraphs and simple transitions.",
    bannedWords: "Avoid hype, jargon, and filler.",
    preferredPhrases: "Use everyday language and concrete examples.",
    examples: "Sounds like a prepared speaker talking directly to one viewer.",
    structure: "Hook, context, useful body, clean ending.",
    defaultLength: "short",
    source: "builtin",
  },
  {
    id: "builtin-founder-update",
    name: "Founder Update",
    audience: "Customers, community members, teammates, or stakeholders.",
    tone: "Clear, confident, transparent, and product-minded.",
    pacing: "Concise sections with direct transitions.",
    bannedWords: "Avoid vague launch language and inflated claims.",
    preferredPhrases: "Say what changed, why it matters, and what happens next.",
    examples: "A founder update that respects the viewer's time.",
    structure: "Problem, update, proof, impact, next step.",
    defaultLength: "short",
    source: "builtin",
  },
  {
    id: "builtin-youtube-intro",
    name: "YouTube Intro",
    audience: "Viewers deciding whether to keep watching.",
    tone: "Fast hook, conversational, clear, and energetic without shouting.",
    pacing: "Quick opening, short lines, frequent resets.",
    bannedWords: "No clickbait, fake urgency, or generic creator filler.",
    preferredPhrases: "Use curiosity, payoff, and a clear reason to watch.",
    examples: "Feels like a creator opening a focused tutorial or update.",
    structure: "Hook, promise, quick credibility, first useful point.",
    defaultLength: "short",
    source: "builtin",
  },
  {
    id: "builtin-investor-pitch",
    name: "Investor Pitch",
    audience: "Investors or business partners evaluating a clear opportunity.",
    tone: "Concise, proof-driven, business-focused, and grounded.",
    pacing: "Tight sections with numbers or evidence when available.",
    bannedWords: "Avoid hype, vague market claims, and unsupported certainty.",
    preferredPhrases: "Connect problem, traction, market, product, and ask.",
    examples: "A crisp pitch that can be spoken naturally.",
    structure: "Problem, customer, solution, traction, business model, ask.",
    defaultLength: "short",
    source: "builtin",
  },
  {
    id: "builtin-educator",
    name: "Educator",
    audience: "Learners who need a clear explanation without feeling talked down to.",
    tone: "Calm, structured, practical, and patient.",
    pacing: "Step-by-step with short recaps.",
    bannedWords: "Avoid jargon unless it is explained simply.",
    preferredPhrases: "Use examples, contrasts, and plain definitions.",
    examples: "Sounds like a good teacher explaining one useful idea.",
    structure: "Set the problem, explain the idea, show an example, recap.",
    defaultLength: "long",
    source: "builtin",
  },
  {
    id: "builtin-high-energy-creator",
    name: "High-Energy Creator",
    audience: "Social video viewers who need momentum and clear payoff.",
    tone: "Energetic, punchy, direct, and viewer-focused.",
    pacing: "Short lines, strong hooks, quick turns, no long setup.",
    bannedWords: "No imitation of a specific real person, no empty hype.",
    preferredPhrases: "Use contrast, stakes, and direct viewer benefit.",
    examples: "Feels like a focused creator script, not a copied influencer voice.",
    structure: "Pattern interrupt, promise, key beats, strong close.",
    defaultLength: "short",
    source: "builtin",
  },
];
const EMPTY_SCRIPT_VOICE_FORM = {
  name: "",
  audience: "",
  tone: "",
  pacing: "",
  bannedWords: "",
  preferredPhrases: "",
  examples: "",
  structure: "",
  defaultLength: "short" as AiLength,
};
const ABOUT_FEATURES = [
  ["Live prompting", "Run a clean browser teleprompter with paging, scroll speed, and fit controls."],
  ["RSVP reading", "Choose RSVP on Tab 1 to read one word at a time. The red ORP letter marks where your eyes should anchor, and WPM sets the pace."],
  ["Script editor", "Write, preview, format, save, load, export, and organize scripts."],
  ["Presentation defaults", "Save preferred font, color, layout, guide, and speed settings."],
  ["Keyboard control", "Use shortcuts for playback, tabs, pages, sizing, speed, help, and undo."],
  ["Mini view", "Open a synced popup prompter for a compact recording view while keeping keyboard controls active."],
  ["Build workspace", "Sign in to save scripts, videos, Build items, and Video Project Builder drafts. External keys are only needed for AI, URL scraping, transcription, narration, and rendering."],
  ["Optional tools", "AI script generation, Firecrawl URL context, voice, transcription, and rendering depend on your saved provider keys or worker setup."],
  ["Open source", "The project is open source at github.com/waynesutton/teleprompter."],
] as const;

const APP_DOCS = [
  ["Prompter", "Read the current script live. Use Start, speed, page controls, fit, guide, mirror, RSVP, and the hide-bar control for recording."],
  ["Mini View", "Use the monitor icon on Tab 1 to open a compact movable prompter. It follows the active page, scroll/RSVP mode, playback state, and keyboard shortcuts."],
  ["Script", "Write or paste the source script, preview formatting, add page breaks, save scripts into folders, and export markdown."],
  ["Build", "Sign in to save scripts, videos, and Video Project Builder drafts. Manual planning uses your pasted script text; URL scraping needs Firecrawl, AI assistance needs OpenAI, Claude, or OpenRouter, transcription needs a speech-to-text provider, and final video rendering needs an external worker/provider."],
  ["Help", "Set defaults, review shortcuts, read app docs, and check the open source feature list."],
  ["Script Voice Profiles", "Choose a writing tone for AI-generated scripts. Built-in profiles work immediately, and custom profiles can be saved, edited, deleted, or imported from notes."],
  ["Narration Voice", "Audio narration is separate from script writing tone. It only becomes usable when your ElevenLabs key is saved."],
  ["RSVP Mode", "Switch Tab 1 to RSVP to show one word at a time with a red ORP pivot letter. AI is optional and only helps rewrite scripts for easier RSVP reading."],
  ["Saving", "Generated text replaces the editor draft, but it is not saved to your library until you click a save control."],
] as const;

const VIDEO_WORKFLOW_STEPS = [
  ["1. Gather", "Start from a link, markdown doc, pasted notes, saved script, or prompt. Firecrawl handles URL context when your key is saved."],
  ["2. Shape", "Use Script Voice Profiles to turn source material into a spoken script, outline, shot list, and caption-ready beats."],
  ["3. Plan", "Draft a transcript-first video project with an edit strategy, EDL JSON, subtitle style, render checklist, and persistent project memory."],
  ["4. Compose", "Use HyperFrames for deterministic HTML-to-video compositions, or Remotion when you need React-based rendering and cloud workers."],
  ["5. Store", "Use R2 for large render artifacts and Mux for upload, playback IDs, webhooks, thumbnails, and delivery."],
  ["6. Review", "Track jobs in Convex, show status in real time, then send the finished script back to Prompter or save the video result."],
] as const;

const VIDEO_PROVIDER_GUIDE = [
  ["Mux", "Video asset management, playback, direct uploads, webhooks, and streaming delivery. Use the Convex Mux component."],
  ["HyperFrames", "Agent-authored HTML videos from links, docs, scripts, and prompts. Render with CLI/workers, not inside Convex actions."],
  ["Remotion", "React-based video templates and cloud rendering on Lambda or Cloud Run."],
  ["Cloudflare R2", "Large render outputs, frame bundles, source captures, and downloads before sending final assets to Mux."],
  ["HeyGen", "Optional avatar or narration workflows. Keep it separate from the script-writing voice."],
] as const;

const BUILD_REQUIREMENT_GUIDE = [
  ["Save scripts, videos, or both", "Requires GitHub login. Saved Build items are private to your account."],
  ["Transcript to strategy to EDL", "Requires GitHub login to save. Drafting from pasted script text works without an AI key after login."],
  ["URL or markdown-link context", "Requires GitHub login plus a saved Firecrawl API key."],
  ["AI-assisted script, strategy, or EDL", "Requires GitHub login plus a saved OpenAI, Claude, or OpenRouter API key."],
  ["Word-level transcription", "Requires GitHub login plus a transcription provider such as ElevenLabs Scribe or a worker-backed speech-to-text service."],
  ["Final video rendering", "Requires an external worker/provider such as HyperFrames, Remotion, ffmpeg, R2, and Mux. The browser does not render final MP4 files."],
] as const;

const SHORTCUTS = [
  ["Space", "Start or pause"],
  ["S or Escape", "Stop and return to the top"],
  ["Command/Ctrl + ?", "Open keyboard shortcuts"],
  ["Command/Ctrl + 1", "Open Prompter"],
  ["Command/Ctrl + 2", "Open Script"],
  ["Command/Ctrl + 3", "Open Build"],
  ["Command/Ctrl + 4", "Open Help"],
  ["Command/Ctrl + Z", "Undo the last script tool change on Tab 2"],
  ["M", "Open or focus the mini prompter view"],
  ["H or B", "Show or hide the Tab 1 control bar"],
  ["C", "Show or hide the countdown counter"],
  ["V", "Switch between scroll and RSVP reading"],
  ["R", "Reset scroll"],
  ["+ / =", "Increase text size"],
  ["-", "Decrease text size"],
  ["]", "Increase speed"],
  ["[", "Decrease speed"],
  ["PageDown or Right Arrow", "Next page"],
  ["PageUp or Left Arrow", "Previous page"],
];

const READING_MODE_OPTIONS: Array<SelectOption<ReadingMode>> = [
  { value: "scroll", label: "Scroll" },
  { value: "rsvp", label: "RSVP" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getDefaultScriptTitle = (script: string) => {
  const firstLine = script
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return (firstLine || "Untitled Script").slice(0, 72);
};

const getSafeMarkdownFileName = (title: string) => {
  const safeTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${safeTitle || "teleprompter-script"}.md`;
};

const getVideoProjectTitle = (title: string, script: string) => title.trim() || getDefaultScriptTitle(script);

const getVideoProjectTranscript = (title: string, script: string) => {
  const lines = script
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== "---");

  if (!lines.length) {
    return `# ${title}\n\nAdd source clips, links, or a transcript. Use word-level timestamps when transcription is connected.`;
  }

  return [
    `# ${title}`,
    "",
    "## Source script reading view",
    ...lines.slice(0, 12).map((line, index) => `[${String(index + 1).padStart(2, "0")}] ${line}`),
    lines.length > 12 ? `\n${lines.length - 12} more lines remain in the full script.` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const getVideoProjectPlan = (title: string, outputFormat: string, sourceText: string, videoBrief: string) =>
  [
    `Strategy for ${title}`,
    "",
    `Output: ${outputFormat}`,
    sourceText ? `Source: ${sourceText}` : "Source: current script or uploaded clips.",
    videoBrief ? `Brief: ${videoBrief}` : "Brief: choose the strongest spoken beats, keep cuts on word boundaries, and build a concise reviewable edit.",
    "",
    "Workflow:",
    "1. Inventory source clips, links, docs, or scripts.",
    "2. Generate or import word-level transcript data.",
    "3. Pack transcript into a reading view for take selection.",
    "4. Confirm the edit strategy before rendering.",
    "5. Produce EDL JSON, subtitle plan, and render checklist.",
    "6. Render through a future worker using ffmpeg, Remotion, HyperFrames, R2, and Mux.",
  ].join("\n");

const getVideoProjectEdl = (title: string, outputFormat: string, script: string) => {
  const firstQuote = cleanRsvpText(script).split(/\s+/).slice(0, 18).join(" ") || "Add source transcript text before selecting ranges.";

  return JSON.stringify(
    {
      version: 1,
      title,
      output: outputFormat,
      status: "strategy_draft",
      sources: [],
      ranges: [
        {
          source: "source-01",
          start: 0,
          end: 0,
          beat: "HOOK",
          quote: firstQuote,
          reason: "Starter beat. Replace start/end after word-level transcript import.",
        },
      ],
      subtitles: "planned",
      overlays: [],
      render: {
        engine: "future-worker",
        notes: "Use per-segment extract, 30ms audio fades, subtitles last, then publish final asset to Mux.",
      },
    },
    null,
    2,
  );
};

const getVideoProjectMemory = (title: string) =>
  [
    `## Session 1 - ${new Date().toISOString().slice(0, 10)}`,
    `**Project:** ${title}`,
    "**Strategy:** Drafted a transcript-first video project workspace.",
    "**Decisions:** Confirm strategy before rendering. Use transcript and EDL as the source of truth.",
    "**Outstanding:** Add source clips, import word-level transcript data, review the EDL, then render with a worker.",
  ].join("\n");

const getFontClass = (fontFamily: PromptFont) => `font-${fontFamily}`;

const getFirstUrl = (input: string) => {
  const markdownUrl = input.match(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/i)?.[1];
  const plainUrl = input.match(/https?:\/\/[^\s)]+/i)?.[0];
  return (markdownUrl ?? plainUrl ?? "").replace(/[.,;!?]+$/, "");
};

const cleanRsvpText = (script: string) =>
  script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("[") && !line.match(/^---+$/))
    .join(" ")
    .replace(/<span data-color="(?:red|yellow|grey|darkgrey)">([^<]*)<\/span>/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const splitRsvpWords = (script: string) => cleanRsvpText(script).split(/\s+/).filter(Boolean);

const getOrpIndex = (word: string) => {
  const coreWord = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  const length = coreWord.length || word.length;

  if (length <= 1) {
    return 0;
  }

  if (length <= 5) {
    return 1;
  }

  if (length <= 9) {
    return 2;
  }

  if (length <= 13) {
    return 3;
  }

  return 4;
};

const renderRsvpWord = (word: string) => {
  const leading = word.match(/^[^\p{L}\p{N}]+/u)?.[0] ?? "";
  const trailing = word.match(/[^\p{L}\p{N}]+$/u)?.[0] ?? "";
  const core = word.slice(leading.length, word.length - trailing.length);
  const pivotIndex = clamp(getOrpIndex(word), 0, Math.max(0, core.length - 1));

  if (!core) {
    return <span>{word}</span>;
  }

  return (
    <>
      <span className="rsvp-word-before">{leading}{core.slice(0, pivotIndex)}</span>
      <span className="rsvp-pivot">{core[pivotIndex]}</span>
      <span className="rsvp-word-after">{core.slice(pivotIndex + 1)}{trailing}</span>
    </>
  );
};

const renderInlineFormatting = (line: string) => {
  const parts: ReactNode[] = [];
  const pattern = /(<span data-color="(red|yellow|grey|darkgrey)">([^<]*)<\/span>|\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      parts.push(
        <span key={`${match.index}-${match[2]}`} className={`inline-color-${match[2]}`}>
          {match[3]}
        </span>,
      );
    } else if (match[4]) {
      parts.push(<strong key={`${match.index}-bold`}>{match[4]}</strong>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderMiniRsvpWordHtml = (word: string) => {
  const leading = word.match(/^[^\p{L}\p{N}]+/u)?.[0] ?? "";
  const trailing = word.match(/[^\p{L}\p{N}]+$/u)?.[0] ?? "";
  const core = word.slice(leading.length, word.length - trailing.length);
  const pivotIndex = clamp(getOrpIndex(word), 0, Math.max(0, core.length - 1));

  if (!core) {
    return escapeHtml(word);
  }

  return [
    `<span class="mini-rsvp-before">${escapeHtml(leading + core.slice(0, pivotIndex))}</span>`,
    `<span class="mini-rsvp-pivot">${escapeHtml(core[pivotIndex] ?? "")}</span>`,
    `<span class="mini-rsvp-after">${escapeHtml(core.slice(pivotIndex + 1) + trailing)}</span>`,
  ].join("");
};

const renderMiniLineHtml = (line: string) => {
  const parts: string[] = [];
  const pattern = /(<span data-color="(red|yellow|grey|darkgrey)">([^<]*)<\/span>|\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(line.slice(lastIndex, match.index)));
    }

    if (match[2] && match[3]) {
      parts.push(`<span class="mini-inline-${match[2]}">${escapeHtml(match[3])}</span>`);
    } else if (match[4]) {
      parts.push(`<strong>${escapeHtml(match[4])}</strong>`);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(escapeHtml(line.slice(lastIndex)));
  }

  return parts.join("") || "&nbsp;";
};

const renderMiniScriptHtml = (script: string) =>
  script
    .split("\n")
    .map((line) => {
      const className = line.trim().startsWith("[") ? "mini-line is-direction" : "mini-line";
      return `<p class="${className}">${renderMiniLineHtml(line)}</p>`;
    })
    .join("");

function CustomSelect<Value extends string>({
  ariaLabel,
  buttonClassName = "",
  className = "",
  disabled = false,
  icon,
  onChange,
  options,
  placement = "down",
  tooltip,
  value,
}: {
  ariaLabel: string;
  buttonClassName?: string;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  onChange: (value: Value) => void;
  options: Array<SelectOption<Value>>;
  placement?: "down" | "up";
  tooltip?: string;
  value: Value;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className={["custom-select", className].filter(Boolean).join(" ")}
      data-placement={placement}
      data-tooltip={tooltip}
      title={tooltip}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        className={["custom-select-trigger", buttonClassName].filter(Boolean).join(" ")}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        {icon ? <span className="custom-select-icon">{icon}</span> : null}
        <span className="custom-select-value">{selectedOption?.label ?? "Choose"}</span>
        <CaretDown className="custom-select-caret" size={14} weight="bold" />
      </button>
      {isOpen ? (
        <div className="custom-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              className={option.value === value ? "custom-select-option is-selected" : "custom-select-option"}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const authState = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const isAuthenticated = authState.isAuthenticated;
  const savedPrompt = useQuery(api.teleprompter.getCurrent);
  const savedDefaultSettings = useQuery(api.teleprompter.getDefaultSettings);
  const savedScriptsQuery = useQuery(api.teleprompter.listSavedScripts);
  const savedScriptVoiceProfilesQuery = useQuery(api.scriptVoices.list);
  const [buildStatusFilter, setBuildStatusFilter] = useState<BuildItemStatus | "all">("active");
  const buildItemsQuery = useQuery(api.buildItems.list, { status: "all" }) as BuildItem[] | undefined;
  const viewer = useQuery(api.users.getViewer);
  const apiKeyStatus = useQuery(api.userApiKeys.getStatus) as UserApiKeyStatus | undefined;
  const getAiProviderStatus = useAction(api.aiScripts.getAiProviderStatus);
  const generateAiScript = useAction(api.aiScripts.generateScript);
  const rewriteScriptForRsvp = useAction(api.aiScripts.rewriteForRsvp);
  const getVoiceStatus = useAction(api.voice.getVoiceStatus);
  const saveUserApiKey = useAction(api.apiKeyActions.save);
  const saveSharedScript = useMutation(api.teleprompter.saveSharedScript);
  const saveDefaultSettings = useMutation(api.teleprompter.saveDefaultSettings);
  const deleteSharedScript = useMutation(api.teleprompter.deleteSharedScript);
  const saveBuildItem = useMutation(api.buildItems.save);
  const setBuildItemStatus = useMutation(api.buildItems.setStatus);
  const deleteBuildItem = useMutation(api.buildItems.remove);
  const removeUserApiKey = useMutation(api.userApiKeys.remove);
  const saveScriptVoiceProfile = useMutation(api.scriptVoices.save);
  const deleteScriptVoiceProfile = useMutation(api.scriptVoices.remove);
  const [activeTab, setActiveTab] = useState<PromptTab>("prompter");
  const [draft, setDraft] = useState(DEFAULT_SCRIPT);
  const [draftUndoStack, setDraftUndoStack] = useState<string[]>([]);
  const [settings, setSettings] = useState<PromptSettings>(DEFAULT_SETTINGS);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isStageMeterVisible, setIsStageMeterVisible] = useState(true);
  const [isPrompterDockVisible, setIsPrompterDockVisible] = useState(true);
  const [isPrompterOptionsOpen, setIsPrompterOptionsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [readingMode, setReadingMode] = useState<ReadingMode>("scroll");
  const [rsvpWordIndex, setRsvpWordIndex] = useState(0);
  const [rsvpWpm, setRsvpWpm] = useState(320);
  const [isRewritingForRsvp, setIsRewritingForRsvp] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [scriptTitle, setScriptTitle] = useState(getDefaultScriptTitle(DEFAULT_SCRIPT));
  const [scriptFolder, setScriptFolder] = useState("");
  const [savedFolderFilter, setSavedFolderFilter] = useState("all");
  const [selectedSavedScriptId, setSelectedSavedScriptId] = useState("");
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [scriptPendingDeleteId, setScriptPendingDeleteId] = useState("");
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [isDeletingScript, setIsDeletingScript] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [loginRequiredMessage, setLoginRequiredMessage] = useState("Sign in with GitHub to use this feature.");
  const [isNewScriptDialogOpen, setIsNewScriptDialogOpen] = useState(false);
  const [isScriptPreviewOpen, setIsScriptPreviewOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isAiSetupModalOpen, setIsAiSetupModalOpen] = useState(false);
  const [isCheckingAiSetup, setIsCheckingAiSetup] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [aiProviderStatus, setAiProviderStatus] = useState<AiProviderStatus | null>(null);
  const [aiProvider, setAiProvider] = useState<AiProvider>("auto");
  const [aiLength, setAiLength] = useState<AiLength>("short");
  const [selectedScriptVoiceId, setSelectedScriptVoiceId] = useState("builtin-natural");
  const [scriptVoiceForm, setScriptVoiceForm] = useState(EMPTY_SCRIPT_VOICE_FORM);
  const [scriptVoiceMessage, setScriptVoiceMessage] = useState<string | null>(null);
  const [isSavingScriptVoice, setIsSavingScriptVoice] = useState(false);
  const [isDeletingScriptVoice, setIsDeletingScriptVoice] = useState(false);
  const [apiKeyService, setApiKeyService] = useState<UserApiKeyService>("openai");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeyModel, setApiKeyModel] = useState("");
  const [apiKeySiteUrl, setApiKeySiteUrl] = useState("");
  const [apiKeyAppName, setApiKeyAppName] = useState("");
  const [apiKeyMessage, setApiKeyMessage] = useState<string | null>(null);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isRemovingApiKey, setIsRemovingApiKey] = useState(false);
  const [buildForm, setBuildForm] = useState(EMPTY_BUILD_FORM);
  const [editingBuildItemId, setEditingBuildItemId] = useState<Id<"buildItems"> | null>(null);
  const [buildMessage, setBuildMessage] = useState<string | null>(null);
  const [isSavingBuildItem, setIsSavingBuildItem] = useState(false);
  const [isUpdatingBuildItem, setIsUpdatingBuildItem] = useState(false);
  const [buildPendingDeleteId, setBuildPendingDeleteId] = useState<Id<"buildItems"> | null>(null);
  const [aiModelOverride, setAiModelOverride] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiSetupMessage, setAiSetupMessage] = useState("These options are not setup. Contact the app creator to config.");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCheckingVoiceStatus, setIsCheckingVoiceStatus] = useState(false);
  const [isVoiceModeRequested, setIsVoiceModeRequested] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);
  const [isMiniViewOpen, setIsMiniViewOpen] = useState(false);
  const [miniViewFrame, setMiniViewFrame] = useState<MiniViewFrame>(() => getDefaultMiniViewFrame());
  const scriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const miniStageRef = useRef<HTMLElement>(null);
  const miniViewInteractionRef = useRef<MiniViewInteraction | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameAtRef = useRef<number | null>(null);
  const rsvpFrameRef = useRef<number | null>(null);
  const rsvpLastFrameAtRef = useRef<number | null>(null);
  const rsvpCarryMsRef = useRef(0);
  const savedScripts = useMemo(() => savedScriptsQuery ?? [], [savedScriptsQuery]);
  const savedScriptVoiceProfiles = useMemo(() => savedScriptVoiceProfilesQuery ?? [], [savedScriptVoiceProfilesQuery]);
  const buildItems = useMemo(() => buildItemsQuery ?? [], [buildItemsQuery]);
  const visibleBuildItems = useMemo(() => {
    if (buildStatusFilter === "all") {
      return buildItems;
    }

    return buildItems.filter((item) => item.status === buildStatusFilter);
  }, [buildItems, buildStatusFilter]);
  const buildPendingDeleteItem = useMemo(
    () => visibleBuildItems.find((item) => item._id === buildPendingDeleteId) ?? buildItems.find((item) => item._id === buildPendingDeleteId),
    [buildItems, buildPendingDeleteId, visibleBuildItems],
  );
  const activeBuildCount = useMemo(() => buildItems.filter((item) => item.status === "active").length, [buildItems]);
  const archivedBuildCount = useMemo(() => buildItems.filter((item) => item.status === "archived").length, [buildItems]);
  const scriptVoiceProfiles = useMemo<ScriptVoiceProfile[]>(() => {
    const customProfiles = savedScriptVoiceProfiles.map((profile) => ({
      id: `custom:${profile._id}`,
      name: profile.name,
      audience: profile.audience,
      tone: profile.tone,
      pacing: profile.pacing,
      bannedWords: profile.bannedWords,
      preferredPhrases: profile.preferredPhrases,
      examples: profile.examples,
      structure: profile.structure,
      defaultLength: profile.defaultLength,
      source: "custom" as const,
    }));

    return [...BUILT_IN_SCRIPT_VOICES, ...customProfiles];
  }, [savedScriptVoiceProfiles]);
  const selectedScriptVoice = useMemo(() => {
    return scriptVoiceProfiles.find((profile) => profile.id === selectedScriptVoiceId) ?? BUILT_IN_SCRIPT_VOICES[0];
  }, [scriptVoiceProfiles, selectedScriptVoiceId]);
  const scriptVoiceOptions = useMemo<Array<SelectOption<string>>>(() => {
    return scriptVoiceProfiles.map((profile) => ({
      value: profile.id,
      label: profile.source === "custom" ? `${profile.name} - Custom` : profile.name,
    }));
  }, [scriptVoiceProfiles]);
  const savedFolders = useMemo(() => {
    const folders = Array.from(
      new Set(
        savedScripts.flatMap((script) => {
          const folder = script.folder?.trim();
          return folder ? [folder] : [];
        }),
      ),
    );
    return folders.sort((first, second) => first.localeCompare(second));
  }, [savedScripts]);
  const filteredSavedScripts = useMemo(() => {
    if (savedFolderFilter === "all") {
      return savedScripts;
    }

    if (savedFolderFilter === "none") {
      return savedScripts.filter((script) => !script.folder?.trim());
    }

    return savedScripts.filter((script) => script.folder === savedFolderFilter);
  }, [savedFolderFilter, savedScripts]);
  const savedFolderOptions = useMemo<Array<SelectOption<string>>>(() => {
    return [
      { value: "all", label: "All folders" },
      { value: "none", label: "No folder" },
      ...savedFolders.map((folder) => ({ value: folder, label: folder })),
    ];
  }, [savedFolders]);
  const savedScriptOptions = useMemo<Array<SelectOption<string>>>(() => {
    return [
      { value: "", label: "Choose saved script" },
      ...filteredSavedScripts.map((script) => ({
        value: script._id,
        label: script.folder ? `${script.folder} / ${script.title}` : script.title,
      })),
    ];
  }, [filteredSavedScripts]);
  const pages = useMemo(() => draft.split(/\n\s*---+\s*\n/g), [draft]);
  const currentScript = pages[currentPageIndex] ?? pages[0] ?? "";
  const rsvpWords = useMemo(() => splitRsvpWords(currentScript), [currentScript]);
  const currentRsvpWord = rsvpWords[rsvpWordIndex] ?? "";
  const rsvpProgress = rsvpWords.length > 0 ? ((rsvpWordIndex + 1) / rsvpWords.length) * 100 : 0;
  const effectiveSpeed = settings.speed * settings.speedMultiplier;
  const estimatedReadTime = useMemo(() => {
    const wordCount = currentScript.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 130));
    return `${minutes} min`;
  }, [currentScript]);

  const setDraftFromTool = useCallback((nextDraft: string) => {
    if (draft === nextDraft) {
      return;
    }

    setDraftUndoStack((currentStack) => [...currentStack.slice(-39), draft]);
    setDraft(nextDraft);
  }, [draft]);

  const handleDraftInputChange = (nextDraft: string) => {
    setDraftUndoStack([]);
    setDraft(nextDraft);
  };

  const resetScroll = useCallback(() => {
    setIsRunning(false);
    setRsvpWordIndex(0);
    rsvpCarryMsRef.current = 0;
    setSettings((current) => ({ ...current, scroll: 0 }));
  }, []);

  const goToPage = useCallback((pageIndex: number) => {
    setIsRunning(false);
    setRsvpWordIndex(0);
    rsvpCarryMsRef.current = 0;
    setCurrentPageIndex(clamp(pageIndex, 0, Math.max(0, pages.length - 1)));
    setSettings((current) => ({ ...current, scroll: 0 }));
  }, [pages.length]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPageIndex - 1);
  }, [currentPageIndex, goToPage]);

  const goToNextPage = useCallback(() => {
    goToPage(currentPageIndex + 1);
  }, [currentPageIndex, goToPage]);

  const undoScriptDraftChange = useCallback(() => {
    const previousDraft = draftUndoStack.at(-1);

    if (!previousDraft) {
      return;
    }

    setDraftUndoStack((currentStack) => currentStack.slice(0, -1));
    setDraft(previousDraft);
    setCurrentPageIndex(0);
    resetScroll();
    setLibraryMessage("Undid the last script change.");

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [draftUndoStack, resetScroll]);

  const updateSetting = <Key extends keyof PromptSettings>(key: Key, value: PromptSettings[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const changeFontSize = useCallback((delta: number) => {
    setSettings((current) => ({
      ...current,
      fontSize: clamp(current.fontSize + delta, 16, 120),
      fitToWindow: false,
    }));
  }, []);

  const changeSpeed = useCallback((delta: number) => {
    if (readingMode === "rsvp") {
      setRsvpWpm((current) => clamp(current + delta * 5, 120, 800));
      return;
    }

    setSettings((current) => ({
      ...current,
      speed: clamp(current.speed + delta, 8, 160),
    }));
  }, [readingMode]);

  const applyDefaultPresentationSettings = useCallback(() => {
    if (!savedDefaultSettings) {
      return;
    }

    setSettings((current) => ({
      ...current,
      fontSize: savedDefaultSettings.fontSize,
      speed: savedDefaultSettings.speed,
      speedMultiplier: savedDefaultSettings.speedMultiplier,
      textColor: savedDefaultSettings.textColor,
      fontFamily: savedDefaultSettings.fontFamily,
      layoutMode: savedDefaultSettings.layoutMode,
      guide: savedDefaultSettings.guide,
      fitToWindow: savedDefaultSettings.fitToWindow,
      scroll: 0,
    }));
  }, [savedDefaultSettings]);

  const fitTextToWindow = useCallback(() => {
    const element = scriptRef.current;
    if (!element) {
      return;
    }

    element.classList.add("is-fit-window");

    let low = 16;
    let high = 120;
    let best = low;

    while (low <= high) {
      const candidate = Math.floor((low + high) / 2);
      element.style.fontSize = `${candidate}px`;

      const fitsHeight = element.scrollHeight <= element.clientHeight + 2;
      const fitsWidth = element.scrollWidth <= element.clientWidth + 2;

      if (fitsHeight && fitsWidth) {
        best = candidate;
        low = candidate + 1;
      } else {
        high = candidate - 1;
      }
    }

    setSettings((current) => ({
      ...current,
      fontSize: best,
      scroll: current.scroll,
      fitToWindow: true,
    }));
  }, []);

  useEffect(() => {
    if (!savedPrompt) {
      return;
    }

    setDraft(savedPrompt.script);
    setDraftUndoStack([]);
    setSettings({
      fontSize: savedPrompt.fontSize,
      speed: savedPrompt.speed,
      speedMultiplier: savedPrompt.speedMultiplier,
      scroll: savedPrompt.scroll,
      mirrored: savedPrompt.mirrored,
      guide: savedPrompt.guide,
      fitToWindow: savedPrompt.fitToWindow,
      textColor: savedPrompt.textColor,
      fontFamily: savedPrompt.fontFamily,
      layoutMode: savedPrompt.layoutMode,
    });
    setLastSavedAt(savedPrompt.updatedAt);
  }, [savedPrompt]);

  useEffect(() => {
    if (currentPageIndex > pages.length - 1) {
      setCurrentPageIndex(Math.max(0, pages.length - 1));
    }
  }, [currentPageIndex, pages.length]);

  useEffect(() => {
    setRsvpWordIndex(0);
    rsvpCarryMsRef.current = 0;
  }, [currentScript, readingMode]);

  useEffect(() => {
    const element = scriptRef.current;
    if (!element) {
      return;
    }

    const maxScroll = element.scrollHeight - element.clientHeight;
    element.scrollTop = (Math.max(0, maxScroll) * settings.scroll) / 100;
  }, [settings.scroll, currentScript, settings.fontSize, settings.fitToWindow, settings.fontFamily]);

  useEffect(() => {
    if (!settings.fitToWindow) {
      return;
    }

    fitTextToWindow();

    window.addEventListener("resize", fitTextToWindow);
    return () => window.removeEventListener("resize", fitTextToWindow);
  }, [settings.fitToWindow, currentScript, fitTextToWindow]);

  useEffect(() => {
    if (!isRunning || readingMode !== "scroll") {
      lastFrameAtRef.current = null;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }

    const tick = (timestamp: number) => {
      const element = scriptRef.current;
      const lastFrameAt = lastFrameAtRef.current ?? timestamp;
      const elapsedSeconds = (timestamp - lastFrameAt) / 1000;
      lastFrameAtRef.current = timestamp;

      if (element) {
        const maxScroll = element.scrollHeight - element.clientHeight;
        const nextTop = Math.min(maxScroll, element.scrollTop + effectiveSpeed * elapsedSeconds);
        element.scrollTop = nextTop;
        const nextScroll = maxScroll <= 0 ? 0 : (nextTop / maxScroll) * 100;
        setSettings((current) => ({ ...current, scroll: Number(nextScroll.toFixed(2)) }));

        if (nextTop >= maxScroll) {
          setIsRunning(false);
          return;
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, effectiveSpeed, readingMode]);

  useEffect(() => {
    if (!isRunning || readingMode !== "rsvp" || rsvpWords.length === 0) {
      rsvpLastFrameAtRef.current = null;
      if (rsvpFrameRef.current) {
        cancelAnimationFrame(rsvpFrameRef.current);
      }
      return;
    }

    const wordDurationMs = 60000 / rsvpWpm;

    const tick = (timestamp: number) => {
      const lastFrameAt = rsvpLastFrameAtRef.current ?? timestamp;
      const elapsedMs = timestamp - lastFrameAt;
      rsvpLastFrameAtRef.current = timestamp;
      rsvpCarryMsRef.current += elapsedMs;

      if (rsvpCarryMsRef.current >= wordDurationMs) {
        const stepCount = Math.floor(rsvpCarryMsRef.current / wordDurationMs);
        rsvpCarryMsRef.current %= wordDurationMs;

        setRsvpWordIndex((current) => {
          const nextIndex = Math.min(rsvpWords.length - 1, current + stepCount);
          if (nextIndex >= rsvpWords.length - 1) {
            setIsRunning(false);
          }

          return nextIndex;
        });
      }

      rsvpFrameRef.current = requestAnimationFrame(tick);
    };

    rsvpFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (rsvpFrameRef.current) {
        cancelAnimationFrame(rsvpFrameRef.current);
      }
    };
  }, [isRunning, readingMode, rsvpWpm, rsvpWords.length]);

  const openMiniPrompterWindow = useCallback(() => {
    setMiniViewFrame((current) => clampMiniViewFrame(current));
    setIsMiniViewOpen(true);
  }, []);

  const beginMiniViewInteraction = useCallback((mode: MiniViewInteraction["mode"], event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault();
    miniViewInteractionRef.current = {
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startFrame: miniViewFrame,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [miniViewFrame]);

  useEffect(() => {
    if (!isMiniViewOpen) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const interaction = miniViewInteractionRef.current;
      if (!interaction) {
        return;
      }

      const deltaX = event.clientX - interaction.startClientX;
      const deltaY = event.clientY - interaction.startClientY;

      setMiniViewFrame(
        clampMiniViewFrame(
          interaction.mode === "move"
            ? {
                ...interaction.startFrame,
                x: interaction.startFrame.x + deltaX,
                y: interaction.startFrame.y + deltaY,
              }
            : {
                ...interaction.startFrame,
                width: interaction.startFrame.width + deltaX,
                height: interaction.startFrame.height + deltaY,
              },
        ),
      );
    };

    const endInteraction = () => {
      miniViewInteractionRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endInteraction);
    window.addEventListener("pointercancel", endInteraction);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endInteraction);
      window.removeEventListener("pointercancel", endInteraction);
    };
  }, [isMiniViewOpen]);

  useEffect(() => {
    if (!isMiniViewOpen) {
      return;
    }

    const keepMiniViewInViewport = () => {
      setMiniViewFrame((current) => clampMiniViewFrame(current));
    };

    window.addEventListener("resize", keepMiniViewInViewport);
    return () => window.removeEventListener("resize", keepMiniViewInViewport);
  }, [isMiniViewOpen]);

  useEffect(() => {
    if (!isMiniViewOpen || readingMode !== "scroll") {
      return;
    }

    const element = miniStageRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = (Math.max(0, element.scrollHeight - element.clientHeight) * settings.scroll) / 100;
  }, [currentScript, isMiniViewOpen, miniViewFrame.height, miniViewFrame.width, readingMode, settings.fontSize, settings.scroll]);

  const handlePrompterShortcut = useCallback((event: ShortcutEventLike) => {
    const key = event.key;
    const keyLower = key.toLowerCase();
    const isShortcutHelpCombo = (event.metaKey || event.ctrlKey) && (key === "?" || (key === "/" && event.shiftKey));

      if (isShortcutHelpCombo) {
        event.preventDefault();
        setIsShortcutsModalOpen(true);
        return;
      }

      if (event.key === "Escape" && isMiniViewOpen) {
        event.preventDefault();
        setIsMiniViewOpen(false);
        return;
      }

      if (event.key === "Escape" && isShortcutsModalOpen) {
        event.preventDefault();
        setIsShortcutsModalOpen(false);
        return;
      }

      if (event.key === "Escape" && isNewScriptDialogOpen) {
        event.preventDefault();
        setIsNewScriptDialogOpen(false);
        return;
      }

      if (event.key === "Escape" && isLoginRequiredModalOpen) {
        event.preventDefault();
        setIsLoginRequiredModalOpen(false);
        return;
      }

      if (event.key === "Escape" && isAiSetupModalOpen) {
        event.preventDefault();
        setIsAiSetupModalOpen(false);
        return;
      }

      if (event.key === "Escape" && isAiGeneratorOpen) {
        event.preventDefault();
        setIsAiGeneratorOpen(false);
        return;
      }

      if (event.key === "Escape" && isVoiceModalOpen) {
        event.preventDefault();
        setIsVoiceModalOpen(false);
        return;
      }

      const isMetaShortcut = event.metaKey || event.ctrlKey;
      if (isMetaShortcut && !event.shiftKey && !event.altKey) {
        const tabShortcuts: Record<string, PromptTab> = {
          "1": "prompter",
          "2": "script",
          "3": "build",
          "4": "help",
        };
        const nextTab = tabShortcuts[event.key];

        if (nextTab) {
          event.preventDefault();
          setActiveTab(nextTab);
          return;
        }

        if (keyLower === "z" && activeTab === "script" && draftUndoStack.length > 0) {
          event.preventDefault();
          undoScriptDraftChange();
          return;
        }
      }

      const targetTag = event.targetTag ?? (event.target instanceof HTMLElement ? event.target.tagName : "");
      if (["TEXTAREA", "INPUT", "SELECT"].includes(targetTag)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (readingMode !== "rsvp" || rsvpWords.length > 0) {
          setIsRunning((current) => !current);
        }
      }

      if (key === "Escape" || keyLower === "s") {
        event.preventDefault();
        resetScroll();
      }

      if (keyLower === "r") {
        resetScroll();
      }

      if (keyLower === "m") {
        event.preventDefault();
        openMiniPrompterWindow();
      }

      if (keyLower === "b" || keyLower === "h") {
        setIsPrompterDockVisible((current) => !current);
      }

      if (keyLower === "c") {
        setIsStageMeterVisible((current) => !current);
      }

      if (keyLower === "v") {
        event.preventDefault();
        setIsRunning(false);
        setReadingMode((current) => (current === "scroll" ? "rsvp" : "scroll"));
      }

      if (key === "+" || key === "=") {
        event.preventDefault();
        changeFontSize(4);
      }

      if (key === "-") {
        event.preventDefault();
        changeFontSize(-4);
      }

      if (key === "]") {
        event.preventDefault();
        changeSpeed(6);
      }

      if (key === "[") {
        event.preventDefault();
        changeSpeed(-6);
      }

      if (key === "PageDown" || key === "ArrowRight") {
        event.preventDefault();
        goToNextPage();
      }

      if (key === "PageUp" || key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousPage();
      }
  }, [
    activeTab,
    changeFontSize,
    changeSpeed,
    draftUndoStack.length,
    goToNextPage,
    goToPreviousPage,
    isAiGeneratorOpen,
    isAiSetupModalOpen,
    isLoginRequiredModalOpen,
    isMiniViewOpen,
    isNewScriptDialogOpen,
    isShortcutsModalOpen,
    isVoiceModalOpen,
    openMiniPrompterWindow,
    readingMode,
    resetScroll,
    rsvpWords.length,
    undoScriptDraftChange,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => handlePrompterShortcut(event);

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrompterShortcut]);

  const selectedSavedScript = useMemo(
    () => savedScripts.find((script) => script._id === selectedSavedScriptId),
    [savedScripts, selectedSavedScriptId],
  );
  const draftStats = useMemo(() => {
    const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 130));

    return {
      characters: draft.length,
      words: wordCount,
      readTime: `${minutes} min`,
      pages: pages.length,
    };
  }, [draft, pages.length]);

  const clearForNewScript = useCallback(() => {
    setDraftFromTool("");
    setScriptTitle("");
    setScriptFolder("");
    setSelectedSavedScriptId("");
    setCurrentPageIndex(0);
    resetScroll();
    setLibraryMessage("Ready for a new script.");
    setDeleteMessage(null);
    setScriptPendingDeleteId("");

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [resetScroll, setDraftFromTool]);

  const saveScriptToLibrary = async () => {
    if (!requireLogin("Sign in with GitHub to save scripts to your library.")) {
      return false;
    }

    const script = draft.trim();
    const title = scriptTitle.trim() || getDefaultScriptTitle(draft);
    const folder = scriptFolder.trim();

    if (!script) {
      setLibraryMessage("Add script text before saving.");
      return false;
    }

    const savedAt = Date.now();
    setIsSavingScript(true);

    try {
      const savedId = await saveSharedScript({
        title,
        folder,
        script,
        updatedAt: savedAt,
      });

      if (!savedId) {
        setLibraryMessage("Add a title and script before saving.");
        return false;
      }

      setScriptTitle(title);
      setScriptFolder(folder);
      if (folder) {
        setSavedFolderFilter(folder);
      }
      setSelectedSavedScriptId(savedId);
      setLastSavedAt(savedAt);
      setLibraryMessage(`Saved "${title}" for everyone.`);
      return true;
    } finally {
      setIsSavingScript(false);
    }
  };

  const requestNewScript = () => {
    setDeleteMessage(null);

    if (!draft.trim()) {
      clearForNewScript();
      return;
    }

    setIsNewScriptDialogOpen(true);
  };

  const saveThenStartNewScript = async () => {
    const didSave = await saveScriptToLibrary();

    if (!didSave) {
      return;
    }

    setIsNewScriptDialogOpen(false);
    clearForNewScript();
  };

  const startNewScriptWithoutSaving = () => {
    setIsNewScriptDialogOpen(false);
    clearForNewScript();
  };

  const openAiGenerator = async () => {
    const source = draft.trim();
    setAiMessage(null);

    if (!requireLogin("Sign in with GitHub and add your API keys to generate scripts.")) {
      return;
    }

    if (!source) {
      setAiMessage("Add a topic, notes, URL, or markdown link before generating.");
      return;
    }

    setIsCheckingAiSetup(true);

    try {
      const status = await getAiProviderStatus();
      const nextStatus = status as AiProviderStatus;
      const hasUrl = Boolean(getFirstUrl(source));
      setAiProviderStatus(nextStatus);

      if (nextStatus.providers.length === 0 || (hasUrl && !nextStatus.hasFirecrawl)) {
        setAiSetupMessage(
          hasUrl && !nextStatus.hasFirecrawl
            ? "Add your Firecrawl API key in Build settings before generating from a URL."
            : "Add an OpenAI, Claude, or OpenRouter API key in Build settings.",
        );
        setIsAiSetupModalOpen(true);
        return;
      }

      setIsAiGeneratorOpen(true);
    } finally {
      setIsCheckingAiSetup(false);
    }
  };

  const openVoiceModal = async () => {
    if (!isAuthenticated) {
      setLoginRequiredMessage("Sign in with GitHub to configure and use voice controls.");
      setIsLoginRequiredModalOpen(true);
      return;
    }

    setIsCheckingVoiceStatus(true);

    try {
      const status = await getVoiceStatus();
      setVoiceStatus(status as VoiceStatus);
      setIsVoiceModalOpen(true);
    } finally {
      setIsCheckingVoiceStatus(false);
    }
  };

  const requireLogin = (message: string) => {
    if (isAuthenticated) {
      return true;
    }

    setLoginRequiredMessage(message);
    setIsLoginRequiredModalOpen(true);
    return false;
  };

  const signInWithGitHub = () => {
    void signIn("github", { redirectTo: window.location.pathname || "/" });
  };

  const saveSelectedApiKey = async () => {
    if (!requireLogin("Sign in with GitHub to save your API keys.")) {
      return;
    }

    setApiKeyMessage(null);
    setIsSavingApiKey(true);

    try {
      const result = await saveUserApiKey({
        service: apiKeyService,
        apiKey: apiKeyValue,
        model: apiKeyModel.trim() || undefined,
        siteUrl: apiKeySiteUrl.trim() || undefined,
        appName: apiKeyAppName.trim() || undefined,
      });
      setApiKeyMessage(result.message);

      if (result.ok) {
        setApiKeyValue("");
      }
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const removeSelectedApiKey = async () => {
    if (!requireLogin("Sign in with GitHub to remove your API keys.")) {
      return;
    }

    setApiKeyMessage(null);
    setIsRemovingApiKey(true);

    try {
      const didRemove = await removeUserApiKey({ service: apiKeyService });
      setApiKeyMessage(didRemove ? "API key removed." : "No saved API key found for that service.");
    } finally {
      setIsRemovingApiKey(false);
    }
  };

  const clearBuildForm = () => {
    setBuildForm(EMPTY_BUILD_FORM);
    setEditingBuildItemId(null);
    setBuildMessage("Build form cleared.");
  };

  const seedBuildFromCurrentScript = () => {
    const nextTitle = scriptTitle.trim() || getDefaultScriptTitle(draft);
    setBuildForm((current) => ({
      ...current,
      kind: current.kind === "video" ? "both" : current.kind,
      sourceType: "script",
      title: nextTitle,
      scriptSnapshot: draft,
      sourceText: current.sourceText || nextTitle,
      transcriptText: current.transcriptText || getVideoProjectTranscript(nextTitle, draft),
    }));
    setBuildMessage("Current script added to the Build form.");
  };

  const draftVideoProject = () => {
    if (!requireLogin("Sign in with GitHub to draft and save Video Project Builder work.")) {
      return;
    }

    const title = getVideoProjectTitle(buildForm.title || scriptTitle, buildForm.scriptSnapshot || draft);
    const scriptSnapshot = buildForm.scriptSnapshot || draft;
    const outputFormat = buildForm.outputFormat || EMPTY_BUILD_FORM.outputFormat;

    setBuildForm((current) => ({
      ...current,
      kind: current.kind === "script" ? "both" : current.kind,
      sourceType: current.sourceType || "script",
      title,
      scriptSnapshot,
      outputFormat,
      transcriptText: current.transcriptText || getVideoProjectTranscript(title, scriptSnapshot),
      editPlan: getVideoProjectPlan(title, outputFormat, current.sourceText, current.videoBrief),
      edlJson: current.edlJson || getVideoProjectEdl(title, outputFormat, scriptSnapshot),
      subtitleStyle: current.subtitleStyle || DEFAULT_SUBTITLE_STYLE,
      renderChecklist: current.renderChecklist || DEFAULT_RENDER_CHECKLIST,
      projectMemory: current.projectMemory || getVideoProjectMemory(title),
      notes: current.notes || "Video Project draft created. Confirm the strategy before any future render job.",
    }));
    setBuildMessage("Video Project draft created. Review the strategy and EDL before saving.");
  };

  const editBuildItem = (item: BuildItem) => {
    setBuildForm({
      kind: item.kind,
      sourceType: item.sourceType,
      title: item.title,
      sourceText: item.sourceText ?? "",
      scriptSnapshot: item.scriptSnapshot ?? "",
      videoBrief: item.videoBrief ?? "",
      transcriptText: item.transcriptText ?? "",
      editPlan: item.editPlan ?? "",
      edlJson: item.edlJson ?? "",
      subtitleStyle: item.subtitleStyle ?? "",
      renderChecklist: item.renderChecklist ?? "",
      projectMemory: item.projectMemory ?? "",
      outputFormat: item.outputFormat ?? EMPTY_BUILD_FORM.outputFormat,
      notes: item.notes ?? "",
    });
    setEditingBuildItemId(item._id);
    setBuildMessage(`Editing "${item.title}".`);
  };

  const saveCurrentBuildItem = async () => {
    if (!requireLogin("Sign in with GitHub to save Build items.")) {
      return;
    }

    const title = buildForm.title.trim() || scriptTitle.trim() || getDefaultScriptTitle(draft);
    const scriptSnapshot = buildForm.kind === "video" ? buildForm.scriptSnapshot : buildForm.scriptSnapshot || draft;

    if (!title) {
      setBuildMessage("Add a title before saving.");
      return;
    }

    setBuildMessage(null);
    setIsSavingBuildItem(true);

    try {
      const savedId = await saveBuildItem({
        itemId: editingBuildItemId ?? undefined,
        kind: buildForm.kind,
        sourceType: buildForm.sourceType,
        title,
        sourceText: buildForm.sourceText,
        scriptSnapshot,
        videoBrief: buildForm.videoBrief,
        transcriptText: buildForm.transcriptText,
        editPlan: buildForm.editPlan,
        edlJson: buildForm.edlJson,
        subtitleStyle: buildForm.subtitleStyle,
        renderChecklist: buildForm.renderChecklist,
        projectMemory: buildForm.projectMemory,
        outputFormat: buildForm.outputFormat,
        notes: buildForm.notes,
        updatedAt: Date.now(),
      });

      if (!savedId) {
        setBuildMessage("Could not save that Build item.");
        return;
      }

      setEditingBuildItemId(savedId);
      setBuildForm((current) => ({ ...current, title, scriptSnapshot }));
      setBuildMessage(`Saved "${title}".`);
    } finally {
      setIsSavingBuildItem(false);
    }
  };

  const updateBuildItemStatus = async (item: BuildItem, status: BuildItemStatus) => {
    if (!requireLogin("Sign in with GitHub to update Build items.")) {
      return;
    }

    setIsUpdatingBuildItem(true);

    try {
      const didUpdate = await setBuildItemStatus({ itemId: item._id, status, updatedAt: Date.now() });
      setBuildMessage(didUpdate ? `${status === "archived" ? "Archived" : "Restored"} "${item.title}".` : "Could not update that Build item.");
    } finally {
      setIsUpdatingBuildItem(false);
    }
  };

  const confirmDeleteBuildItem = async () => {
    if (!buildPendingDeleteId) {
      return;
    }

    setIsUpdatingBuildItem(true);

    try {
      const didDelete = await deleteBuildItem({ itemId: buildPendingDeleteId });
      const deletedTitle = buildPendingDeleteItem?.title ?? "Build item";
      setBuildPendingDeleteId(null);

      if (editingBuildItemId === buildPendingDeleteId) {
        setEditingBuildItemId(null);
        setBuildForm(EMPTY_BUILD_FORM);
      }

      setBuildMessage(didDelete ? `Deleted "${deletedTitle}".` : "Could not delete that Build item.");
    } finally {
      setIsUpdatingBuildItem(false);
    }
  };

  const sendBuildItemToScript = (item: BuildItem) => {
    const nextDraft = item.scriptSnapshot?.trim() || item.sourceText?.trim() || "";

    if (!nextDraft) {
      setBuildMessage("That Build item does not have script text yet.");
      return;
    }

    setDraftFromTool(nextDraft);
    setCurrentPageIndex(0);
    setActiveTab("script");
    setBuildMessage(`Loaded "${item.title}" into Script.`);
  };

  const loadSelectedVoiceIntoForm = () => {
    setScriptVoiceForm({
      name: selectedScriptVoice.name,
      audience: selectedScriptVoice.audience,
      tone: selectedScriptVoice.tone,
      pacing: selectedScriptVoice.pacing,
      bannedWords: selectedScriptVoice.bannedWords,
      preferredPhrases: selectedScriptVoice.preferredPhrases,
      examples: selectedScriptVoice.examples,
      structure: selectedScriptVoice.structure,
      defaultLength: selectedScriptVoice.defaultLength,
    });
    setScriptVoiceMessage(`Loaded "${selectedScriptVoice.name}" into the custom profile editor.`);
  };

  const clearScriptVoiceForm = () => {
    setScriptVoiceForm(EMPTY_SCRIPT_VOICE_FORM);
    setScriptVoiceMessage("Custom profile editor cleared.");
  };

  const saveCustomScriptVoice = async () => {
    if (!requireLogin("Sign in with GitHub to save custom Script Voice Profiles.")) {
      return;
    }

    const name = scriptVoiceForm.name.trim();
    const tone = scriptVoiceForm.tone.trim();

    if (!name || !tone) {
      setScriptVoiceMessage("Add a profile name and tone before saving.");
      return;
    }

    setIsSavingScriptVoice(true);

    try {
      const savedId = await saveScriptVoiceProfile({
        ...scriptVoiceForm,
        name,
        tone,
        updatedAt: Date.now(),
      });

      if (!savedId) {
        setScriptVoiceMessage("Add a profile name and tone before saving.");
        return;
      }

      setSelectedScriptVoiceId(`custom:${savedId}`);
      setScriptVoiceMessage(`Saved "${name}" as a custom script voice.`);
    } finally {
      setIsSavingScriptVoice(false);
    }
  };

  const deleteSelectedScriptVoice = async () => {
    if (!requireLogin("Sign in with GitHub to delete custom Script Voice Profiles.")) {
      return;
    }

    if (!selectedScriptVoiceId.startsWith("custom:")) {
      setScriptVoiceMessage("Built-in script voices cannot be deleted.");
      return;
    }

    setIsDeletingScriptVoice(true);

    try {
      const profileId = selectedScriptVoiceId.replace("custom:", "") as Id<"scriptVoiceProfiles">;
      const didDelete = await deleteScriptVoiceProfile({ profileId });

      if (!didDelete) {
        setScriptVoiceMessage("That custom script voice was already deleted.");
        return;
      }

      setSelectedScriptVoiceId("builtin-natural");
      setScriptVoiceMessage("Custom script voice deleted.");
    } finally {
      setIsDeletingScriptVoice(false);
    }
  };

  const generateScriptFromAi = async () => {
    const source = draft.trim();
    if (!source) {
      setAiMessage("Add a topic, notes, URL, or markdown link before generating.");
      return;
    }

    setAiMessage(null);
    setIsGeneratingScript(true);

    try {
      const result = await generateAiScript({
        input: source,
        provider: aiProvider,
        modelOverride: aiModelOverride.trim() || undefined,
        length: aiLength === "open" && selectedScriptVoice.defaultLength !== "open" ? selectedScriptVoice.defaultLength : aiLength,
        scriptVoiceProfile: {
          name: selectedScriptVoice.name,
          audience: selectedScriptVoice.audience,
          tone: selectedScriptVoice.tone,
          pacing: selectedScriptVoice.pacing,
          bannedWords: selectedScriptVoice.bannedWords,
          preferredPhrases: selectedScriptVoice.preferredPhrases,
          examples: selectedScriptVoice.examples,
          structure: selectedScriptVoice.structure,
          defaultLength: selectedScriptVoice.defaultLength,
        },
        instructions: aiInstructions.trim() || undefined,
      });

      if (!result.ok) {
        if (result.code === "missing_setup") {
          setAiSetupMessage(result.message);
          setIsAiGeneratorOpen(false);
          setIsAiSetupModalOpen(true);
        } else {
          setAiMessage(result.message);
        }
        return;
      }

      setDraftFromTool(result.script);
      setCurrentPageIndex(0);
      resetScroll();

      if (!scriptTitle.trim()) {
        setScriptTitle(getDefaultScriptTitle(result.script));
      }

      setIsAiGeneratorOpen(false);
      setAiMessage(`Generated with ${result.model}.`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const rewriteCurrentScriptForRsvp = async () => {
    const source = draft.trim();
    setRsvpMessage(null);

    if (!requireLogin("Sign in with GitHub and add your API keys to use AI RSVP rewrite.")) {
      return;
    }

    if (!source) {
      setRsvpMessage("Add script text before using the RSVP rewrite.");
      return;
    }

    setIsRewritingForRsvp(true);

    try {
      const status = await getAiProviderStatus();
      const nextStatus = status as AiProviderStatus;
      setAiProviderStatus(nextStatus);

      if (nextStatus.providers.length === 0) {
        setAiSetupMessage("These options are not setup. Contact the app creator to config.");
        setIsAiSetupModalOpen(true);
        return;
      }

      const result = await rewriteScriptForRsvp({
        input: source,
        provider: aiProvider,
        modelOverride: aiModelOverride.trim() || undefined,
      });

      if (!result.ok) {
        if (result.code === "missing_setup") {
          setAiSetupMessage(result.message);
          setIsAiSetupModalOpen(true);
        } else {
          setRsvpMessage(result.message);
        }
        return;
      }

      setDraftFromTool(result.script);
      setCurrentPageIndex(0);
      resetScroll();
      setReadingMode("rsvp");
      setRsvpMessage(`RSVP rewrite ready with ${result.model}.`);
    } finally {
      setIsRewritingForRsvp(false);
    }
  };

  const loadSelectedScript = () => {
    if (!requireLogin("Sign in with GitHub to load scripts from your library.")) {
      return;
    }

    if (!selectedSavedScript) {
      setLibraryMessage("Choose a saved script to load.");
      return;
    }

    setDraftFromTool(selectedSavedScript.script);
    setScriptTitle(selectedSavedScript.title);
    setScriptFolder(selectedSavedScript.folder ?? "");
    setCurrentPageIndex(0);
    resetScroll();
    applyDefaultPresentationSettings();
    setLibraryMessage(`Loaded "${selectedSavedScript.title}".`);
  };

  const wrapSelection = (prefix: string, suffix: string, fallback: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = draft.slice(start, end) || fallback;
    const nextText = `${prefix}${selectedText}${suffix}`;
    const nextDraft = `${draft.slice(0, start)}${nextText}${draft.slice(end)}`;

    setDraftFromTool(nextDraft);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    });
  };

  const insertPageBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDraftFromTool(`${draft.trimEnd()}\n\n---\n\n`);
      return;
    }

    const cursor = textarea.selectionStart;
    const pageBreak = "\n\n---\n\n";
    const nextDraft = `${draft.slice(0, cursor)}${pageBreak}${draft.slice(textarea.selectionEnd)}`;
    setDraftFromTool(nextDraft);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor + pageBreak.length, cursor + pageBreak.length);
    });
  };

  const exportMarkdown = () => {
    const blob = new Blob([draft], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getSafeMarkdownFileName(scriptTitle || getDefaultScriptTitle(draft));
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveCurrentDefaults = async () => {
    if (!requireLogin("Sign in with GitHub to save your default settings.")) {
      return;
    }

    const savedAt = Date.now();
    setIsSavingDefaults(true);

    try {
      await saveDefaultSettings({
        fontSize: settings.fontSize,
        speed: settings.speed,
        speedMultiplier: settings.speedMultiplier,
        textColor: settings.textColor,
        fontFamily: settings.fontFamily,
        layoutMode: settings.layoutMode,
        guide: settings.guide,
        fitToWindow: settings.fitToWindow,
        updatedAt: savedAt,
      });
      setSettingsMessage("Default script settings saved.");
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const requestDeleteSelectedScript = () => {
    if (!requireLogin("Sign in with GitHub to delete scripts from your library.")) {
      return;
    }

    if (!selectedSavedScript) {
      setDeleteMessage("Choose a saved script before deleting.");
      return;
    }

    setScriptPendingDeleteId(selectedSavedScript._id);
    setDeleteMessage(null);
  };

  const cancelDeleteScript = () => {
    setScriptPendingDeleteId("");
  };

  const confirmDeleteScript = async () => {
    const scriptToDelete = savedScripts.find((script) => script._id === scriptPendingDeleteId);

    if (!scriptToDelete) {
      setScriptPendingDeleteId("");
      setDeleteMessage("That script is no longer in the library.");
      return;
    }

    setIsDeletingScript(true);

    try {
      const didDelete = await deleteSharedScript({ scriptId: scriptToDelete._id });
      setScriptPendingDeleteId("");

      if (!didDelete) {
        setDeleteMessage("That script was already deleted.");
        return;
      }

      if (selectedSavedScriptId === scriptToDelete._id) {
        setSelectedSavedScriptId("");
      }

      setDeleteMessage(`Deleted "${scriptToDelete.title}".`);
      setLibraryMessage(null);
    } finally {
      setIsDeletingScript(false);
    }
  };

  const tabs = (
    <nav
      className={activeTab === "prompter" ? "bottom-tabs is-prompter" : "bottom-tabs"}
      aria-label="Teleprompter tabs"
    >
      {activeTab === "prompter" ? (
        <div className="tab-side-actions" aria-label="Prompter view controls">
          <button
            className={isPrompterDockVisible ? "tab-dock-toggle has-tooltip" : "tab-dock-toggle has-tooltip is-active"}
            type="button"
            onClick={() => setIsPrompterDockVisible((current) => !current)}
            aria-pressed={!isPrompterDockVisible}
            aria-label={isPrompterDockVisible ? "Hide Tab 1 control bar" : "Show Tab 1 control bar"}
            title={isPrompterDockVisible ? "Hide Tab 1 control bar" : "Show Tab 1 control bar"}
            data-tooltip={isPrompterDockVisible ? "Hide bar" : "Show bar"}
          >
            <Layout size={17} weight="bold" />
          </button>
          <button
            className={isMiniViewOpen ? "tab-dock-toggle has-tooltip is-active" : "tab-dock-toggle has-tooltip"}
            type="button"
            onClick={openMiniPrompterWindow}
            aria-pressed={isMiniViewOpen}
            aria-label="Open mini prompter view"
            title="Open mini prompter view"
            data-tooltip="Mini view"
          >
            <MonitorArrowUp size={17} weight="bold" />
          </button>
        </div>
      ) : null}
      <div className="tab-list">
        <button
          className={activeTab === "prompter" ? "tab has-tooltip is-active" : "tab has-tooltip"}
          onClick={() => setActiveTab("prompter")}
          aria-current={activeTab === "prompter" ? "page" : undefined}
          title="Open the live teleprompter"
          data-tooltip="Prompter view"
          type="button"
        >
          <List size={16} weight="bold" />
          <span>Prompter</span>
        </button>
        <button
          className={activeTab === "script" ? "tab has-tooltip is-active" : "tab has-tooltip"}
          onClick={() => setActiveTab("script")}
          aria-current={activeTab === "script" ? "page" : undefined}
          title="Open the script editor"
          data-tooltip="Script editor"
          type="button"
        >
          <Article size={16} weight="bold" />
          <span>Script</span>
        </button>
        <button
          className={activeTab === "build" ? "tab has-tooltip is-active" : "tab has-tooltip"}
          onClick={() => setActiveTab("build")}
          aria-current={activeTab === "build" ? "page" : undefined}
          title="Open the script and video builder"
          data-tooltip="Build workspace"
          type="button"
        >
          <Sparkle size={16} weight="bold" />
          <span>Build</span>
        </button>
        <button
          className={activeTab === "help" ? "tab has-tooltip is-active" : "tab has-tooltip"}
          onClick={() => setActiveTab("help")}
          aria-current={activeTab === "help" ? "page" : undefined}
          title="Open help and default settings"
          data-tooltip="Help and settings"
          type="button"
        >
          <Question size={16} weight="bold" />
          <span>Help</span>
        </button>
        {isAuthenticated ? (
          <button
            className="tab account-tab has-tooltip"
            type="button"
            onClick={() => void signOut()}
            title={`Signed in as ${viewer?.name ?? viewer?.email ?? "GitHub user"}. Click to sign out.`}
            data-tooltip="Sign out"
            aria-label={`Signed in as ${viewer?.name ?? viewer?.email ?? "GitHub user"}. Sign out.`}
          >
            <GithubLogo size={16} weight="bold" />
            <span>{viewer?.name ?? viewer?.email ?? "Account"}</span>
          </button>
        ) : (
          <button
            className="tab account-tab has-tooltip"
            type="button"
            onClick={signInWithGitHub}
            title="Sign in with GitHub"
            data-tooltip="Sign in"
            aria-label="Sign in with GitHub"
          >
            <GithubLogo size={16} weight="bold" />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <main className="app-shell">
      {activeTab === "prompter" ? (
        <section className={isPrompterDockVisible ? "prompter-stage" : "prompter-stage is-dock-hidden"} aria-label="Teleprompter">
          {settings.guide ? <div className="read-guide" aria-hidden="true" /> : null}
          <div
            ref={scriptRef}
            className={[
              "script-reader",
              `text-${settings.textColor}`,
              getFontClass(settings.fontFamily),
              settings.layoutMode === "centered" ? "is-page-centered" : "",
              settings.mirrored ? "is-mirrored" : "",
              settings.fitToWindow ? "is-fit-window" : "",
              readingMode === "rsvp" ? "is-rsvp" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {readingMode === "rsvp" ? (
              <div className="rsvp-reader" aria-label="RSVP reader">
                {currentRsvpWord ? (
                  <>
                    <div className="rsvp-word" aria-live="polite">
                      {renderRsvpWord(currentRsvpWord)}
                    </div>
                    <div className="rsvp-progress" aria-label="RSVP progress">
                      Word {Math.min(rsvpWordIndex + 1, rsvpWords.length).toLocaleString()} of {rsvpWords.length.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <p className="rsvp-empty">Add script text on Tab 2 to use RSVP mode.</p>
                )}
              </div>
            ) : (
              currentScript.split("\n").map((line, index) => (
                <p key={`${currentPageIndex}-${index}`} className={line.trim().startsWith("[") ? "direction-line" : undefined}>
                  {line ? renderInlineFormatting(line) : "\u00a0"}
                </p>
              ))
            )}
          </div>

          {rsvpMessage ? <p className="rsvp-stage-message">{rsvpMessage}</p> : null}

          {isPrompterDockVisible ? (
            <div className="prompter-bottom-stack">
              {isStageMeterVisible ? (
              <div className="stage-meter" aria-label="Prompter progress">
                <span>{estimatedReadTime}</span>
                <span>
                  Page {currentPageIndex + 1}/{pages.length}
                </span>
                <span>{Math.round(readingMode === "rsvp" ? rsvpProgress : settings.scroll)}%</span>
                <button
                  className="meter-close"
                  type="button"
                  onClick={() => setIsStageMeterVisible(false)}
                  aria-label="Hide prompter counter"
                  title="Hide prompter counter"
                  data-tooltip="Hide counter"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
              ) : null}
              <div className="control-deck" aria-label="Prompter controls">
              <div className="control-cluster transport-cluster" aria-label="Playback and page controls">
                <button
                  className="icon-button has-tooltip"
                  type="button"
                  onClick={resetScroll}
                  aria-label="Reset scroll"
                  title="Reset scroll"
                  data-tooltip="Reset"
                >
                  <ArrowCounterClockwise size={17} weight="bold" />
                </button>
                <button
                  className="page-button has-tooltip"
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPageIndex === 0}
                  aria-label="Previous page"
                  title="Previous page"
                  data-tooltip="Previous"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  className="primary-button has-tooltip"
                  type="button"
                  onClick={() => {
                    if (readingMode !== "rsvp" || rsvpWords.length > 0) {
                      setIsRunning((current) => !current);
                    }
                  }}
                  title={isRunning ? "Pause scrolling" : "Start scrolling"}
                  data-tooltip={isRunning ? "Pause" : "Start"}
                >
                  {isRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                </button>
                <button
                  className="page-button has-tooltip"
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPageIndex >= pages.length - 1}
                  aria-label="Next page"
                  title="Next page"
                  data-tooltip="Next"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
              <label className="range-control scroll-range has-tooltip" title="Adjust current scroll position" data-tooltip="Scroll position">
                <span>{readingMode === "rsvp" ? "RSVP" : "Scroll"}</span>
                <input
                  type="range"
                  min="0"
                  max={readingMode === "rsvp" ? Math.max(0, rsvpWords.length - 1) : 100}
                  value={readingMode === "rsvp" ? rsvpWordIndex : settings.scroll}
                  aria-label={readingMode === "rsvp" ? "RSVP word position" : "Scroll position"}
                  onChange={(event) => {
                    if (readingMode === "rsvp") {
                      setIsRunning(false);
                      setRsvpWordIndex(Number(event.target.value));
                      return;
                    }

                    updateSetting("scroll", Number(event.target.value));
                  }}
                />
              </label>
              <div className="control-cluster view-cluster" aria-label="View controls">
                <CustomSelect
                  ariaLabel="Reading mode"
                  className="reading-mode-select has-tooltip"
                  buttonClassName="reading-mode-trigger"
                  icon={<Article size={16} weight="bold" />}
                  options={READING_MODE_OPTIONS}
                  placement="up"
                  tooltip="Reading mode"
                  value={readingMode}
                  onChange={(value) => {
                    setIsRunning(false);
                    setReadingMode(value);
                  }}
                />
              </div>
              <label className="range-control compact has-tooltip" title="Change prompter text size" data-tooltip="Text size">
                <span>Size</span>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={settings.fontSize}
                  aria-label="Text size"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      fontSize: Number(event.target.value),
                      fitToWindow: false,
                    }))
                  }
                />
              </label>
              <label className="range-control compact has-tooltip" title={readingMode === "rsvp" ? "Change RSVP words per minute" : "Change base scroll speed"} data-tooltip={readingMode === "rsvp" ? "RSVP WPM" : "Base speed"}>
                <span>{readingMode === "rsvp" ? "WPM" : "Speed"}</span>
                <input
                  type="range"
                  min={readingMode === "rsvp" ? "120" : "8"}
                  max={readingMode === "rsvp" ? "800" : "160"}
                  step={readingMode === "rsvp" ? "10" : "1"}
                  value={readingMode === "rsvp" ? rsvpWpm : settings.speed}
                  aria-label={readingMode === "rsvp" ? "RSVP words per minute" : "Base speed"}
                  onChange={(event) => {
                    if (readingMode === "rsvp") {
                      setRsvpWpm(Number(event.target.value));
                      return;
                    }

                    updateSetting("speed", Number(event.target.value));
                  }}
                />
              </label>
              <div className="control-cluster display-cluster" aria-label="Speed multiplier and display controls">
                <CustomSelect
                  ariaLabel="Speed multiplier"
                  className="multiplier-select has-tooltip"
                  buttonClassName="multiplier-select-trigger"
                  icon={<Gauge size={16} weight="bold" />}
                  options={SPEED_MULTIPLIER_OPTIONS}
                  placement="up"
                  tooltip="Multiplier"
                  value={String(settings.speedMultiplier)}
                  onChange={(value) => updateSetting("speedMultiplier", Number(value))}
                />
                <button
                  className={isVoiceModeRequested ? "icon-button has-tooltip is-active" : "icon-button has-tooltip"}
                  type="button"
                  onClick={openVoiceModal}
                  disabled={isCheckingVoiceStatus}
                  aria-pressed={isVoiceModeRequested}
                  aria-label="Voice controls"
                  title="Open voice controls"
                  data-tooltip={isCheckingVoiceStatus ? "Checking voice" : "Voice"}
                >
                  <Microphone size={17} weight="bold" />
                </button>
                <div
                  className="gear-menu-wrap"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setIsPrompterOptionsOpen(false);
                    }
                  }}
                >
                  <button
                    className={isPrompterOptionsOpen ? "icon-button has-tooltip is-active" : "icon-button has-tooltip"}
                    type="button"
                    onClick={() => setIsPrompterOptionsOpen((current) => !current)}
                    aria-expanded={isPrompterOptionsOpen}
                    aria-haspopup="menu"
                    aria-label="Open prompter options"
                    title="Open prompter options"
                    data-tooltip="Options"
                  >
                    <GearSix size={17} weight="bold" />
                  </button>
                  {isPrompterOptionsOpen ? (
                    <div className="gear-menu" role="menu" aria-label="Prompter options">
                      <button
                        className={settings.fitToWindow ? "gear-menu-item is-active" : "gear-menu-item"}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          if (settings.fitToWindow) {
                            updateSetting("fitToWindow", false);
                          } else {
                            fitTextToWindow();
                          }
                          setIsPrompterOptionsOpen(false);
                        }}
                      >
                        <CornersOut size={16} weight="bold" />
                        <span>Fit text</span>
                      </button>
                      <button
                        className={settings.layoutMode === "centered" ? "gear-menu-item is-active" : "gear-menu-item"}
                        type="button"
                        role="menuitem"
                        onClick={() => updateSetting("layoutMode", settings.layoutMode === "centered" ? "left" : "centered")}
                      >
                        <TextAlignCenter size={16} weight="bold" />
                        <span>Center text</span>
                      </button>
                      <button
                        className={settings.mirrored ? "gear-menu-item is-active" : "gear-menu-item"}
                        type="button"
                        role="menuitem"
                        onClick={() => updateSetting("mirrored", !settings.mirrored)}
                      >
                        <FlipHorizontal size={16} weight="bold" />
                        <span>Mirror text</span>
                      </button>
                      <button
                        className={settings.guide ? "gear-menu-item is-active" : "gear-menu-item"}
                        type="button"
                        role="menuitem"
                        onClick={() => updateSetting("guide", !settings.guide)}
                      >
                        <SlidersHorizontal size={16} weight="bold" />
                        <span>Reading guide</span>
                      </button>
                      <button
                        className="gear-menu-item"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsShortcutsModalOpen(true);
                          setIsPrompterOptionsOpen(false);
                        }}
                      >
                        <Question size={16} weight="bold" />
                        <span>Shortcuts</span>
                      </button>
                      <button
                        className="gear-menu-item"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          rewriteCurrentScriptForRsvp();
                          setIsPrompterOptionsOpen(false);
                        }}
                        disabled={isRewritingForRsvp}
                      >
                        <Sparkle size={16} weight="bold" />
                        <span>{isRewritingForRsvp ? "Rewriting" : "AI RSVP rewrite"}</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              </div>
            </div>
          ) : null}
          {tabs}
        </section>
      ) : activeTab === "script" ? (
        <>
          <section className="editor-view" aria-label="Script editor">
            <div className="editor-header">
              <div>
                <p className="eyebrow">Script source</p>
                <h1>Write once. Prompt live.</h1>
              </div>
              <div className="header-actions">
                <button
                  className="save-button has-tooltip is-primary-action"
                  type="button"
                  onClick={requestNewScript}
                  title="Start a blank script"
                  data-tooltip="New script"
                >
                  <Plus size={17} weight="bold" />
                  New Script
                </button>
                <button
                  className="save-button has-tooltip"
                  type="button"
                  onClick={exportMarkdown}
                  title="Download the current script as Markdown"
                  data-tooltip="Save as Markdown"
                >
                  <DownloadSimple size={17} weight="bold" />
                  Markdown
                </button>
                <button
                  className="save-button has-tooltip"
                  type="button"
                  onClick={saveScriptToLibrary}
                  disabled={isSavingScript}
                  title="Save this script to the shared library"
                  data-tooltip="Save to Library"
                >
                  <FloppyDisk size={17} weight="bold" />
                  {isSavingScript ? "Saving" : "Save to Library"}
                </button>
              </div>
            </div>

            <div className="script-toolbar" aria-label="Script formatting">
              <div className="toolbar-group">
                <span>Whole text</span>
                <div className="segmented-control">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      className={settings.textColor === color.value ? "segment has-tooltip is-active" : "segment has-tooltip"}
                      type="button"
                      title={`Set all prompter text to ${color.label.toLowerCase()}`}
                      data-tooltip={`All text ${color.label}`}
                      onClick={() => updateSetting("textColor", color.value)}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="toolbar-group">
                <span>Selection</span>
                <div className="inline-tools">
                  {TEXT_COLORS.filter((color) => color.value !== "white").map((color) => (
                    <button
                      key={color.value}
                      className="tool-button has-tooltip"
                      type="button"
                      title={`Color selected text ${color.label.toLowerCase()}`}
                      data-tooltip={`Selection ${color.label}`}
                      onClick={() => wrapSelection(`<span data-color="${color.value}">`, "</span>", color.label.toLowerCase())}
                    >
                      {color.label}
                    </button>
                  ))}
                  <button
                    className="tool-button has-tooltip"
                    type="button"
                    onClick={insertPageBreak}
                    title="Insert a page break at the cursor"
                    data-tooltip="Insert page break"
                  >
                    Page Break
                  </button>
                </div>
              </div>
            </div>

            <div className="script-label-row">
              <label className="script-label" htmlFor="script">
                Script text
              </label>
              <button
                className={isScriptPreviewOpen ? "tool-button has-tooltip is-active" : "tool-button has-tooltip"}
                type="button"
                onClick={() => setIsScriptPreviewOpen((current) => !current)}
                title={isScriptPreviewOpen ? "Return to editing" : "Preview formatted script"}
                data-tooltip={isScriptPreviewOpen ? "Edit script" : "Preview script"}
                aria-pressed={isScriptPreviewOpen}
              >
                {isScriptPreviewOpen ? <PencilSimple size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                {isScriptPreviewOpen ? "Edit" : "Preview"}
              </button>
            </div>
            {isScriptPreviewOpen ? (
              <div className="script-preview" aria-label="Script preview">
                {draft.trim() ? (
                  pages.map((page, pageIndex) => (
                    <section className="script-preview-page" key={`preview-${pageIndex}`}>
                      <p className="preview-page-label">Page {pageIndex + 1}</p>
                      {page.split("\n").map((line, lineIndex) => (
                        <p key={`${pageIndex}-${lineIndex}`} className={line.trim().startsWith("[") ? "direction-line" : undefined}>
                          {line ? renderInlineFormatting(line) : "\u00a0"}
                        </p>
                      ))}
                    </section>
                  ))
                ) : (
                  <p className="preview-empty">Nothing to preview yet.</p>
                )}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                id="script"
                value={draft}
                onChange={(event) => handleDraftInputChange(event.target.value)}
                spellCheck="true"
              />
            )}
            <div className="script-stats" aria-label="Script statistics">
              <span>{draftStats.characters.toLocaleString()} characters</span>
              <span>{draftStats.words.toLocaleString()} words</span>
              <span>{draftStats.readTime} read</span>
              <span>{draftStats.pages} pages</span>
            </div>
            <p className="editor-note">Use `---` on its own line to create pages. Selected color uses safe markdown-compatible span tags.</p>
            <div className="script-library" aria-label="Shared script library">
              <div>
                <p className="eyebrow">Your library</p>
                <h2>Save and load your scripts.</h2>
              </div>
              <div className="library-grid">
                <label className="field-control" htmlFor="script-title">
                  <span>Script title</span>
                  <input
                    id="script-title"
                    type="text"
                    value={scriptTitle}
                    onChange={(event) => setScriptTitle(event.target.value)}
                  />
                </label>
                <label className="field-control" htmlFor="script-folder">
                  <span>Folder</span>
                  <input
                    id="script-folder"
                    type="text"
                    value={scriptFolder}
                    onChange={(event) => setScriptFolder(event.target.value)}
                    placeholder="No folder"
                  />
                </label>
                <button
                  className="save-button has-tooltip"
                  type="button"
                  onClick={saveScriptToLibrary}
                  disabled={isSavingScript}
                  title="Save this script to the shared library"
                  data-tooltip="Save script"
                >
                  <FloppyDisk size={17} weight="bold" />
                  {isSavingScript ? "Saving" : "Save Script"}
                </button>
                <div className="field-control">
                  <span>Saved folder</span>
                  <CustomSelect
                    ariaLabel="Saved folder"
                    value={savedFolderFilter}
                    options={savedFolderOptions}
                    onChange={(value) => {
                      setSavedFolderFilter(value);
                      setSelectedSavedScriptId("");
                    }}
                  />
                </div>
                <div className="field-control is-wide">
                  <span>Saved scripts</span>
                  <CustomSelect
                    ariaLabel="Saved scripts"
                    value={selectedSavedScriptId}
                    options={savedScriptOptions}
                    onChange={setSelectedSavedScriptId}
                  />
                </div>
                <button
                  className="save-button has-tooltip"
                  type="button"
                  onClick={loadSelectedScript}
                  disabled={!selectedSavedScript}
                  title="Load the selected shared script"
                  data-tooltip="Load script"
                >
                  <FolderOpen size={17} weight="bold" />
                  Load Script
                </button>
                <button
                  className="danger-button has-tooltip"
                  type="button"
                  onClick={requestDeleteSelectedScript}
                  disabled={!selectedSavedScript || isDeletingScript}
                  title="Delete the selected shared script"
                  data-tooltip="Delete script"
                >
                  <Trash size={17} weight="bold" />
                  Delete Script
                </button>
              </div>
              {libraryMessage ? <p className="library-message">{libraryMessage}</p> : null}
              {deleteMessage ? <p className="library-message">{deleteMessage}</p> : null}
            </div>
            {scriptPendingDeleteId ? (
              <div className="delete-popover" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-copy">
                <div>
                  <p className="eyebrow">Delete script</p>
                  <h2 id="delete-title">Remove from library?</h2>
                  <p id="delete-copy">
                    This deletes "{savedScripts.find((script) => script._id === scriptPendingDeleteId)?.title}" for everyone.
                  </p>
                </div>
                <div className="popover-actions">
                  <button className="save-button" type="button" onClick={cancelDeleteScript} disabled={isDeletingScript}>
                    Cancel
                  </button>
                  <button className="danger-button" type="button" onClick={confirmDeleteScript} disabled={isDeletingScript}>
                    <Trash size={17} weight="bold" />
                    {isDeletingScript ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="editor-footer">
              <span>{draft.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>{pages.length} pages</span>
              <span>{lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : "Not saved yet"}</span>
            </div>
          </section>
          {tabs}
        </>
      ) : activeTab === "build" ? (
        <>
          <section className="build-view" aria-label="Build workspace">
            <div className="editor-header">
              <div>
                <p className="eyebrow">Build</p>
                <h1>Generate scripts. Plan videos.</h1>
                <p className="panel-copy">Build is for signed-in users. Save your own keys to generate scripts, scrape links, prepare narration, and plan video builds from links, docs, scripts, or prompts.</p>
              </div>
              {!isAuthenticated ? (
                <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                  <GithubLogo size={17} weight="bold" />
                  Sign in
                </button>
              ) : null}
            </div>

            <div className="ai-generate-panel" aria-label="AI script generator">
              <div>
                <p className="eyebrow">Script generator</p>
                <h2>Turn a topic, notes, URL, or markdown link into a prompt-ready script.</h2>
                <p className="panel-copy">Uses the current Script text as source material. Firecrawl adds URL context when your key is saved.</p>
              </div>
              <button
                className="save-button has-tooltip is-primary-action"
                type="button"
                onClick={openAiGenerator}
                disabled={isCheckingAiSetup || isGeneratingScript}
                title="Generate a script from the current text"
                data-tooltip="Generate script"
              >
                <Sparkle size={17} weight="bold" />
                {isCheckingAiSetup ? "Checking" : "Generate Script"}
              </button>
            </div>

            <div className="api-settings-panel" aria-label="Script generator settings">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">BYOK settings</p>
                  <h2>Bring your own keys.</h2>
                  <p className="panel-copy">{API_KEY_HELP[apiKeyService].help}</p>
                </div>
                {!isAuthenticated ? (
                  <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                    <GithubLogo size={17} weight="bold" />
                    Sign in
                  </button>
                ) : null}
              </div>
              <div className="api-key-status-list" aria-label="API key status">
                {(apiKeyStatus?.keys ?? []).map((key) => (
                  <span className={key.isConfigured ? "api-key-chip is-configured" : "api-key-chip"} key={key.service}>
                    {API_KEY_SERVICE_OPTIONS.find((option) => option.value === key.service)?.label ?? key.service}
                    {key.isConfigured ? " saved" : " missing"}
                  </span>
                ))}
              </div>
              {isAuthenticated ? (
                <div className="api-key-grid">
                  <div className="field-control">
                    <span>Service</span>
                    <CustomSelect
                      ariaLabel="API key service"
                      value={apiKeyService}
                      options={API_KEY_SERVICE_OPTIONS}
                      onChange={(value) => {
                        setApiKeyService(value);
                        const saved = apiKeyStatus?.keys.find((key) => key.service === value);
                        setApiKeyModel(saved?.model ?? "");
                        setApiKeySiteUrl(saved?.siteUrl ?? "");
                        setApiKeyAppName(saved?.appName ?? "");
                        setApiKeyMessage(null);
                      }}
                    />
                  </div>
                  <label className="field-control" htmlFor="api-key-value">
                    <span>{API_KEY_HELP[apiKeyService].keyLabel}</span>
                    <input
                      id="api-key-value"
                      type="password"
                      value={apiKeyValue}
                      onChange={(event) => setApiKeyValue(event.target.value)}
                      placeholder="Paste key to save or replace"
                    />
                  </label>
                  {MODEL_KEY_SERVICES.has(apiKeyService) ? (
                    <label className="field-control" htmlFor="api-key-model">
                      <span>{API_KEY_HELP[apiKeyService].modelLabel}</span>
                      <input
                        id="api-key-model"
                        type="text"
                        value={apiKeyModel}
                        onChange={(event) => setApiKeyModel(event.target.value)}
                        placeholder={API_KEY_HELP[apiKeyService].modelPlaceholder}
                      />
                    </label>
                  ) : null}
                  {SITE_APP_KEY_SERVICES.has(apiKeyService) ? (
                    <>
                      <label className="field-control" htmlFor="api-key-site-url">
                        <span>{API_KEY_HELP[apiKeyService].siteLabel}</span>
                        <input
                          id="api-key-site-url"
                          type="text"
                          value={apiKeySiteUrl}
                          onChange={(event) => setApiKeySiteUrl(event.target.value)}
                          placeholder={apiKeyService === "mux" ? "Mux webhook signing secret" : "https://befitting-dodo-95.convex.site"}
                        />
                      </label>
                      <label className="field-control" htmlFor="api-key-app-name">
                        <span>{API_KEY_HELP[apiKeyService].appLabel}</span>
                        <input
                          id="api-key-app-name"
                          type="text"
                          value={apiKeyAppName}
                          onChange={(event) => setApiKeyAppName(event.target.value)}
                          placeholder={apiKeyService === "mux" ? "stream.mux.com" : "Teleprompt"}
                        />
                      </label>
                    </>
                  ) : null}
                  <button className="save-button" type="button" onClick={saveSelectedApiKey} disabled={isSavingApiKey}>
                    <FloppyDisk size={17} weight="bold" />
                    {isSavingApiKey ? "Saving" : "Save Key"}
                  </button>
                  <button className="danger-button" type="button" onClick={removeSelectedApiKey} disabled={isRemovingApiKey}>
                    <Trash size={17} weight="bold" />
                    {isRemovingApiKey ? "Removing" : "Remove Key"}
                  </button>
                </div>
              ) : (
                <p className="editor-note">Sign in to save provider keys. Raw keys are encrypted in Convex and never shown again.</p>
              )}
              {apiKeyMessage ? <p className="library-message">{apiKeyMessage}</p> : null}
            </div>
            {aiMessage ? <p className="library-message">{aiMessage}</p> : null}

            <section className="settings-panel build-library-panel" aria-label="Build library">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">Build library</p>
                  <h2>Save scripts, videos, or both.</h2>
                  <p className="panel-copy">Sign in with GitHub to save private Build items, video project plans, and rendering notes. Active items stay in the workspace; archived items stay out of the way until restored.</p>
                </div>
                <div className="build-summary">
                  <span>{activeBuildCount} active</span>
                  <span>{archivedBuildCount} archived</span>
                </div>
              </div>

              <div className="build-form-grid">
                <label className="field-control" htmlFor="build-title">
                  <span>Title</span>
                  <input
                    id="build-title"
                    type="text"
                    value={buildForm.title}
                    onChange={(event) => setBuildForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Product update video"
                  />
                </label>
                <div className="field-control">
                  <span>Build type</span>
                  <CustomSelect
                    ariaLabel="Build type"
                    value={buildForm.kind}
                    options={BUILD_KIND_OPTIONS}
                    onChange={(value) => setBuildForm((current) => ({ ...current, kind: value }))}
                  />
                </div>
                <div className="field-control">
                  <span>Source</span>
                  <CustomSelect
                    ariaLabel="Build source"
                    value={buildForm.sourceType}
                    options={BUILD_SOURCE_OPTIONS}
                    onChange={(value) => setBuildForm((current) => ({ ...current, sourceType: value }))}
                  />
                </div>
                <label className="field-control is-wide" htmlFor="build-source">
                  <span>Prompt, link, or doc reference</span>
                  <input
                    id="build-source"
                    type="text"
                    value={buildForm.sourceText}
                    onChange={(event) => setBuildForm((current) => ({ ...current, sourceText: event.target.value }))}
                    placeholder="Paste a URL, doc title, prompt, or content brief"
                  />
                </label>
                <label className="field-control build-textarea-field" htmlFor="build-script">
                  <span>Script snapshot</span>
                  <textarea
                    id="build-script"
                    value={buildForm.scriptSnapshot}
                    onChange={(event) => setBuildForm((current) => ({ ...current, scriptSnapshot: event.target.value }))}
                    placeholder="Use current Script text, paste a script, or leave blank for video-only planning"
                  />
                </label>
                <label className="field-control build-textarea-field" htmlFor="build-video-brief">
                  <span>Video brief</span>
                  <textarea
                    id="build-video-brief"
                    value={buildForm.videoBrief}
                    onChange={(event) => setBuildForm((current) => ({ ...current, videoBrief: event.target.value }))}
                    placeholder="Describe format, visuals, aspect ratio, captions, narration, and expected output"
                  />
                </label>
                <label className="field-control build-textarea-field" htmlFor="build-notes">
                  <span>Notes</span>
                  <textarea
                    id="build-notes"
                    value={buildForm.notes}
                    onChange={(event) => setBuildForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Status, next step, render notes, or approval comments"
                  />
                </label>
              </div>

              <section className="video-project-panel" aria-label="Video Project Builder">
                <div className="api-settings-header">
                  <div>
                    <p className="eyebrow">Video Project Builder</p>
                    <h2>Transcript to strategy to EDL.</h2>
                    <p className="panel-copy">Logged-in users can create a readable edit package from pasted script text before any render worker touches media. URL context needs Firecrawl, AI-assisted strategy needs OpenAI, Claude, or OpenRouter, transcription needs a speech-to-text provider, and final MP4 rendering needs an external worker/provider.</p>
                  </div>
                  <button className="save-button is-primary-action" type="button" onClick={draftVideoProject}>
                    <VideoCamera size={17} weight="bold" />
                    Draft Video Project
                  </button>
                </div>
                <div className="build-requirement-grid" aria-label="Build feature requirements">
                  {BUILD_REQUIREMENT_GUIDE.map(([title, copy]) => (
                    <article className="build-requirement-card" key={title}>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </article>
                  ))}
                </div>
                <div className="video-project-grid">
                  <div className="field-control">
                    <span>Output format</span>
                    <CustomSelect
                      ariaLabel="Video output format"
                      value={buildForm.outputFormat}
                      options={VIDEO_OUTPUT_OPTIONS}
                      onChange={(value) => setBuildForm((current) => ({ ...current, outputFormat: value }))}
                    />
                  </div>
                  <label className="field-control build-textarea-field" htmlFor="build-transcript">
                    <span>Transcript reading view</span>
                    <textarea
                      id="build-transcript"
                      value={buildForm.transcriptText}
                      onChange={(event) => setBuildForm((current) => ({ ...current, transcriptText: event.target.value }))}
                      placeholder="Paste or draft the transcript. Keep this easy to scan and search."
                    />
                  </label>
                  <label className="field-control build-textarea-field" htmlFor="build-edit-plan">
                    <span>Edit strategy</span>
                    <textarea
                      id="build-edit-plan"
                      value={buildForm.editPlan}
                      onChange={(event) => setBuildForm((current) => ({ ...current, editPlan: event.target.value }))}
                      placeholder="Confirm the edit strategy before cutting: pacing, keeper shots, hooks, trims, visuals, and review notes."
                    />
                  </label>
                  <label className="field-control build-textarea-field is-code is-wide" htmlFor="build-edl">
                    <span>EDL JSON</span>
                    <textarea
                      id="build-edl"
                      value={buildForm.edlJson}
                      onChange={(event) => setBuildForm((current) => ({ ...current, edlJson: event.target.value }))}
                      placeholder='{"version":"promptdeck.edl.v1","sources":[],"ranges":[]}'
                    />
                  </label>
                  <label className="field-control build-textarea-field is-compact" htmlFor="build-subtitle-style">
                    <span>Subtitle style</span>
                    <textarea
                      id="build-subtitle-style"
                      value={buildForm.subtitleStyle}
                      onChange={(event) => setBuildForm((current) => ({ ...current, subtitleStyle: event.target.value }))}
                      placeholder="Describe subtitle timing, casing, placement, and contrast."
                    />
                  </label>
                  <label className="field-control build-textarea-field is-compact" htmlFor="build-checklist">
                    <span>Render checklist</span>
                    <textarea
                      id="build-checklist"
                      value={buildForm.renderChecklist}
                      onChange={(event) => setBuildForm((current) => ({ ...current, renderChecklist: event.target.value }))}
                      placeholder="Track transcript, cut, subtitle, review, and export tasks."
                    />
                  </label>
                  <label className="field-control build-textarea-field is-wide" htmlFor="build-memory">
                    <span>Project memory</span>
                    <textarea
                      id="build-memory"
                      value={buildForm.projectMemory}
                      onChange={(event) => setBuildForm((current) => ({ ...current, projectMemory: event.target.value }))}
                      placeholder="Keep persistent decisions, source notes, approvals, render attempts, and what changed between versions."
                    />
                  </label>
                </div>
                <p className="editor-note">This creates reviewable video instructions only. The browser does not transcribe source media or render final MP4 files by itself.</p>
              </section>

              <div className="build-action-row">
                <button className="save-button" type="button" onClick={seedBuildFromCurrentScript}>
                  <Article size={17} weight="bold" />
                  Use Current Script
                </button>
                <button className="save-button is-primary-action" type="button" onClick={saveCurrentBuildItem} disabled={isSavingBuildItem}>
                  <FloppyDisk size={17} weight="bold" />
                  {isSavingBuildItem ? "Saving" : editingBuildItemId ? "Update Build Item" : "Save Build Item"}
                </button>
                <button className="save-button" type="button" onClick={clearBuildForm}>
                  <Plus size={17} weight="bold" />
                  New Build Item
                </button>
                <div className="field-control build-filter-control">
                  <span>View</span>
                  <CustomSelect
                    ariaLabel="Build item status"
                    value={buildStatusFilter}
                    options={BUILD_STATUS_OPTIONS}
                    onChange={setBuildStatusFilter}
                  />
                </div>
              </div>

              {buildMessage ? <p className="library-message">{buildMessage}</p> : null}

              <div className="build-item-list" aria-label="Saved Build items">
                {visibleBuildItems.length > 0 ? (
                  visibleBuildItems.map((item) => (
                    <article className={item.status === "archived" ? "build-item-card is-archived" : "build-item-card"} key={item._id}>
                      <div>
                        <div className="build-item-heading">
                          <span className="build-kind-chip">
                            {item.kind === "video" ? <VideoCamera size={14} weight="bold" /> : <Article size={14} weight="bold" />}
                            {BUILD_KIND_OPTIONS.find((option) => option.value === item.kind)?.label ?? item.kind}
                          </span>
                          <span className="build-status-chip">{item.status}</span>
                          {item.transcriptText || item.edlJson || item.editPlan ? <span className="build-status-chip is-video-project">video project</span> : null}
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.editPlan || item.videoBrief || item.sourceText || item.notes || "No brief added yet."}</p>
                        {item.transcriptText || item.edlJson || item.renderChecklist ? (
                          <div className="build-readiness-row" aria-label="Video project readiness">
                            <span className={item.transcriptText ? "is-ready" : undefined}>Transcript</span>
                            <span className={item.edlJson ? "is-ready" : undefined}>EDL</span>
                            <span className={item.renderChecklist ? "is-ready" : undefined}>Checklist</span>
                            {item.outputFormat ? <span className="is-ready">{item.outputFormat}</span> : null}
                          </div>
                        ) : null}
                        <div className="build-item-meta">
                          <span>{BUILD_SOURCE_OPTIONS.find((option) => option.value === item.sourceType)?.label ?? item.sourceType}</span>
                          <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="build-item-actions">
                        <button className="tool-button" type="button" onClick={() => editBuildItem(item)}>
                          <PencilSimple size={16} weight="bold" />
                          Edit
                        </button>
                        <button className="tool-button" type="button" onClick={() => sendBuildItemToScript(item)}>
                          <Article size={16} weight="bold" />
                          Script
                        </button>
                        <button
                          className="tool-button"
                          type="button"
                          onClick={() => updateBuildItemStatus(item, item.status === "archived" ? "active" : "archived")}
                          disabled={isUpdatingBuildItem}
                        >
                          <Archive size={16} weight="bold" />
                          {item.status === "archived" ? "Restore" : "Archive"}
                        </button>
                        <button className="danger-button" type="button" onClick={() => setBuildPendingDeleteId(item._id)} disabled={isUpdatingBuildItem}>
                          <Trash size={16} weight="bold" />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="editor-note">No Build items in this view yet. Save a script, video plan, or combined build to start.</p>
                )}
              </div>

              {buildPendingDeleteItem ? (
                <div className="delete-popover" role="alertdialog" aria-labelledby="build-delete-title" aria-describedby="build-delete-copy">
                  <div>
                    <p className="eyebrow">Delete Build item</p>
                    <h2 id="build-delete-title">Delete "{buildPendingDeleteItem.title}"?</h2>
                    <p id="build-delete-copy">This permanently removes the saved Build item. Archive it instead if you may need it later.</p>
                  </div>
                  <div className="popover-actions">
                    <button className="save-button" type="button" onClick={() => setBuildPendingDeleteId(null)} disabled={isUpdatingBuildItem}>
                      Cancel
                    </button>
                    <button className="danger-button" type="button" onClick={confirmDeleteBuildItem} disabled={isUpdatingBuildItem}>
                      <Trash size={17} weight="bold" />
                      {isUpdatingBuildItem ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="settings-panel video-build-panel" aria-label="Video build workflow">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">Video builder</p>
                  <h2>Links, docs, scripts, and prompts to video.</h2>
                  <p className="panel-copy">Recommended path: Firecrawl for source context, AI for script and shot structure, a transcription service for word-level timing, HyperFrames or Remotion for rendering, R2 for large artifacts, and Mux for playback.</p>
                </div>
                <button
                  className="save-button has-tooltip"
                  type="button"
                  onClick={() => {
                    if (!requireLogin("Sign in with GitHub to use video build workflows and save video provider keys.")) {
                      return;
                    }
                    setApiKeyMessage("Video rendering setup is documented in docs/build-video-setup.md.");
                  }}
                  title="Review the video build setup"
                  data-tooltip="Video setup"
                >
                  <Article size={17} weight="bold" />
                  Setup Guide
                </button>
              </div>
              <div className="docs-grid">
                {VIDEO_WORKFLOW_STEPS.map(([title, copy]) => (
                  <article className="docs-card" key={title}>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
              <div className="video-provider-table" aria-label="Recommended video providers">
                <div className="video-provider-row is-header">
                  <span>Layer</span>
                  <span>Best use</span>
                </div>
                {VIDEO_PROVIDER_GUIDE.map(([name, copy]) => (
                  <div className="video-provider-row" key={name}>
                    <span>{name}</span>
                    <span>{copy}</span>
                  </div>
                ))}
              </div>
            </section>
          </section>
          {tabs}
        </>
      ) : (
        <>
          <section className="settings-view" aria-label="Help and settings">
            <section className="settings-panel app-docs-panel" aria-label="App documentation">
              <div>
                <p className="eyebrow">App docs</p>
                <h1>How Teleprompt works.</h1>
              </div>
              <p className="about-copy">
                Teleprompt has four main areas: read in Prompter, write in Script, generate in Build, then tune defaults and learn shortcuts in Help.
                Script Voice Profiles control writing tone for AI-generated scripts. Narration voice is separate and only applies to audio features.
              </p>
              <div className="docs-grid">
                {APP_DOCS.map(([title, copy]) => (
                  <article className="docs-card" key={title}>
                    <h2>{title}</h2>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </section>
            <div className="editor-header">
              <div>
                <p className="eyebrow">Help and defaults</p>
                <h1>Shortcut-ready prompting.</h1>
              </div>
              <button
                className="save-button has-tooltip is-primary-action"
                type="button"
                onClick={saveCurrentDefaults}
                disabled={isSavingDefaults}
                title="Save current font, color, speed, layout, and fit settings as defaults"
                data-tooltip="Save default settings"
              >
                <FloppyDisk size={17} weight="bold" />
                {isSavingDefaults ? "Saving" : "Save Defaults"}
              </button>
            </div>
            <div className="settings-grid">
              <section className="settings-panel" aria-label="Default script settings">
                <h2>Default script settings</h2>
                <div className="settings-controls">
                  <div className="field-control">
                    <span>Font</span>
                    <CustomSelect
                      ariaLabel="Default font"
                      value={settings.fontFamily}
                      options={FONT_OPTIONS}
                      onChange={(value) => updateSetting("fontFamily", value)}
                    />
                  </div>
                  <div className="field-control">
                    <span>Layout</span>
                    <CustomSelect
                      ariaLabel="Default layout"
                      value={settings.layoutMode}
                      options={LAYOUT_OPTIONS}
                      onChange={(value) => updateSetting("layoutMode", value)}
                    />
                  </div>
                  <div className="field-control">
                    <span>Speed multiplier</span>
                    <CustomSelect
                      ariaLabel="Default speed multiplier"
                      value={String(settings.speedMultiplier)}
                      options={SPEED_MULTIPLIER_OPTIONS}
                      onChange={(value) => updateSetting("speedMultiplier", Number(value))}
                    />
                  </div>
                  <div className="field-control">
                    <span>Text color</span>
                    <div className="segmented-control">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          className={settings.textColor === color.value ? "segment has-tooltip is-active" : "segment has-tooltip"}
                          type="button"
                          title={`Set default prompter text color to ${color.label.toLowerCase()}`}
                          data-tooltip={`Default ${color.label}`}
                          onClick={() => updateSetting("textColor", color.value)}
                        >
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field-control">
                    <span>Prompter counter</span>
                    <button
                      className="save-button has-tooltip"
                      type="button"
                      onClick={() => setIsStageMeterVisible((current) => !current)}
                      title="Show or hide the bottom prompter counter"
                      data-tooltip={isStageMeterVisible ? "Hide counter" : "Show counter"}
                    >
                      {isStageMeterVisible ? "Hide Counter" : "Show Counter"}
                    </button>
                  </div>
                </div>
                {settingsMessage ? <p className="library-message">{settingsMessage}</p> : null}
              </section>
              <section className="settings-panel" aria-label="Keyboard shortcuts">
                <h2>Keyboard shortcuts</h2>
                <div className="shortcut-list">
                  {SHORTCUTS.map(([keys, action]) => (
                    <div className="shortcut-row" key={keys}>
                      <kbd>{keys}</kbd>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <section className="settings-panel about-panel" aria-label="About">
              <div>
                <p className="eyebrow">About</p>
                <h2>About</h2>
              </div>
              <p className="about-copy">
                Teleprompt is an open source browser teleprompter for writing, organizing, and reading scripts with fewer distractions.
              </p>
              <div className="about-table-wrap">
                <table className="about-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>What it does</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ABOUT_FEATURES.map(([feature, description]) => (
                      <tr key={feature}>
                        <td>{feature}</td>
                        <td>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
          {tabs}
        </>
      )}
      {isMiniViewOpen ? (
        <div
          className="modal-scrim mini-view-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsMiniViewOpen(false);
            }
          }}
        >
          <section
            className="mini-view-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Mini prompter view"
            style={{
              height: `${miniViewFrame.height}px`,
              left: `${miniViewFrame.x}px`,
              top: `${miniViewFrame.y}px`,
              width: `${miniViewFrame.width}px`,
            }}
          >
            <div
              className="mini-view-drag-handle"
              title="Drag to move"
              onPointerDown={(event) => beginMiniViewInteraction("move", event)}
            >
              <span />
            </div>
            <div className="mini-view-actions">
              <button
                className="mini-view-button has-tooltip"
                type="button"
                onClick={() => {
                  if (readingMode !== "rsvp" || rsvpWords.length > 0) {
                    setIsRunning((current) => !current);
                  }
                }}
                aria-label={isRunning ? "Pause" : "Start"}
                title={isRunning ? "Pause" : "Start"}
                data-tooltip={isRunning ? "Pause" : "Start"}
              >
                {isRunning ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
              </button>
              <button
                className="mini-view-button has-tooltip"
                type="button"
                onClick={() => setIsShortcutsModalOpen(true)}
                aria-label="Open shortcuts"
                title="Open shortcuts"
                data-tooltip="Shortcuts"
              >
                <Question size={15} weight="bold" />
              </button>
              <button
                className="mini-view-button has-tooltip"
                type="button"
                onClick={() => setIsMiniViewOpen(false)}
                aria-label="Close mini view"
                title="Close mini view"
                data-tooltip="Close"
                autoFocus
              >
                <X size={15} weight="bold" />
              </button>
            </div>
            <section
              ref={miniStageRef}
              className={readingMode === "rsvp" ? "mini-view-stage is-rsvp" : "mini-view-stage"}
              aria-label="Mini teleprompter text"
            >
              {readingMode === "rsvp" ? (
                <div className="mini-view-content is-rsvp-word">
                  {currentRsvpWord ? (
                    <>
                      <div className="mini-rsvp-word" dangerouslySetInnerHTML={{ __html: renderMiniRsvpWordHtml(currentRsvpWord) }} />
                      <div className="mini-rsvp-meta">
                        Word {Math.min(rsvpWordIndex + 1, rsvpWords.length).toLocaleString()} of {rsvpWords.length.toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div className="mini-rsvp-meta">Add script text on Tab 2 to use RSVP mode.</div>
                  )}
                </div>
              ) : (
                <div
                  className={[
                    "mini-view-content",
                    `text-${settings.textColor}`,
                    settings.layoutMode === "centered" ? "is-centered" : "",
                    settings.mirrored ? "is-mirrored" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ fontSize: `${clamp(settings.fontSize * 0.66, 28, 76)}px` }}
                  dangerouslySetInnerHTML={{ __html: renderMiniScriptHtml(currentScript) }}
                />
              )}
            </section>
            <div
              className="mini-view-resize-handle"
              aria-hidden="true"
              title="Drag to resize"
              onPointerDown={(event) => beginMiniViewInteraction("resize", event)}
            />
          </section>
        </div>
      ) : null}
      {isShortcutsModalOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsShortcutsModalOpen(false);
            }
          }}
        >
          <section
            className="shortcut-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcut-modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Keyboard controls</p>
                <h2 id="shortcut-modal-title">Shortcuts</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setIsShortcutsModalOpen(false)}
                aria-label="Close keyboard shortcuts"
                title="Close keyboard shortcuts"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <div className="shortcut-list modal-shortcuts">
              {SHORTCUTS.map(([keys, action]) => (
                <div className="shortcut-row" key={keys}>
                  <kbd>{keys}</kbd>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      {isLoginRequiredModalOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsLoginRequiredModalOpen(false);
            }
          }}
        >
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-required-title"
            aria-describedby="login-required-copy"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">GitHub login</p>
                <h2 id="login-required-title">Sign in to continue</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setIsLoginRequiredModalOpen(false)}
                aria-label="Close login notice"
                title="Close login notice"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p id="login-required-copy" className="modal-copy">
              {loginRequiredMessage}
            </p>
            <div className="modal-actions">
              <button className="save-button" type="button" onClick={() => setIsLoginRequiredModalOpen(false)}>
                Cancel
              </button>
              <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                <GithubLogo size={17} weight="bold" />
                Sign in with GitHub
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {isNewScriptDialogOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsNewScriptDialogOpen(false);
            }
          }}
        >
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="new-script-title"
            aria-describedby="new-script-copy"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">New script</p>
                <h2 id="new-script-title">Save before clearing?</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setIsNewScriptDialogOpen(false)}
                aria-label="Cancel new script"
                title="Cancel new script"
                data-tooltip="Cancel"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p id="new-script-copy" className="modal-copy">
              Save the current script to the shared library before starting a blank script. If this title already exists, saving updates it.
            </p>
            <div className="modal-actions">
              <button className="save-button" type="button" onClick={() => setIsNewScriptDialogOpen(false)} disabled={isSavingScript}>
                Cancel
              </button>
              <button className="danger-button" type="button" onClick={startNewScriptWithoutSaving} disabled={isSavingScript}>
                Don't Save
              </button>
              <button className="save-button is-primary-action" type="button" onClick={saveThenStartNewScript} disabled={isSavingScript}>
                <FloppyDisk size={17} weight="bold" />
                {isSavingScript ? "Saving" : "Save First"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {isAiGeneratorOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsAiGeneratorOpen(false);
            }
          }}
        >
          <section
            className="confirm-modal ai-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-generator-title"
            aria-describedby="ai-generator-copy"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Generate script</p>
                <h2 id="ai-generator-title">Choose the output</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setIsAiGeneratorOpen(false)}
                aria-label="Close script generator"
                title="Close script generator"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p id="ai-generator-copy" className="modal-copy">
              The generated script replaces the current Script text only after the provider returns a result.
            </p>
            <div className="ai-modal-grid">
              <div className="field-control">
                <span>Provider</span>
                <CustomSelect
                  ariaLabel="AI provider"
                  value={aiProvider}
                  options={AI_PROVIDER_OPTIONS}
                  onChange={setAiProvider}
                />
              </div>
              <div className="field-control">
                <span>Length</span>
                <CustomSelect
                  ariaLabel="AI script length"
                  value={aiLength}
                  options={AI_LENGTH_OPTIONS}
                  onChange={setAiLength}
                />
              </div>
              <div className="field-control ai-modal-wide">
                <span>Script voice</span>
                <CustomSelect
                  ariaLabel="Script voice profile"
                  value={selectedScriptVoiceId}
                  options={scriptVoiceOptions}
                  onChange={(value) => {
                    setSelectedScriptVoiceId(value);
                    setScriptVoiceMessage(null);
                  }}
                />
              </div>
              <div className="voice-summary ai-modal-wide">
                <div>
                  <p className="eyebrow">Selected writing tone</p>
                  <h3>{selectedScriptVoice.name}</h3>
                </div>
                <p>{selectedScriptVoice.tone}</p>
              </div>
              <label className="field-control ai-modal-wide" htmlFor="ai-model">
                <span>Model override</span>
                <input
                  id="ai-model"
                  type="text"
                  value={aiModelOverride}
                  onChange={(event) => setAiModelOverride(event.target.value)}
                  placeholder={
                    (aiProvider !== "auto"
                      ? aiProviderStatus?.providers.find((provider) => provider.provider === aiProvider)?.model
                      : undefined) ??
                    aiProviderStatus?.providers[0]?.model ??
                    "Use configured model"
                  }
                />
              </label>
              <label className="field-control ai-modal-wide" htmlFor="ai-instructions">
                <span>Style notes</span>
                <textarea
                  id="ai-instructions"
                  className="modal-textarea"
                  value={aiInstructions}
                  onChange={(event) => setAiInstructions(event.target.value)}
                  placeholder="Example: Make it direct, practical, and easy to read on camera."
                />
              </label>
              <section className="voice-profile-editor ai-modal-wide" aria-label="Custom script voice profile editor">
                <div className="voice-profile-header">
                  <div>
                    <p className="eyebrow">Custom script voice</p>
                    <h3>Save a reusable writing tone</h3>
                  </div>
                  <div className="voice-profile-actions">
                    <button className="tool-button" type="button" onClick={loadSelectedVoiceIntoForm}>
                      Load Selected
                    </button>
                    <button className="tool-button" type="button" onClick={clearScriptVoiceForm}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="voice-profile-grid">
                  <label className="field-control" htmlFor="voice-profile-name">
                    <span>Name</span>
                    <input
                      id="voice-profile-name"
                      type="text"
                      value={scriptVoiceForm.name}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="My founder voice"
                    />
                  </label>
                  <label className="field-control" htmlFor="voice-profile-audience">
                    <span>Audience</span>
                    <input
                      id="voice-profile-audience"
                      type="text"
                      value={scriptVoiceForm.audience}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, audience: event.target.value }))}
                      placeholder="Founders, creators, operators"
                    />
                  </label>
                  <label className="field-control ai-modal-wide" htmlFor="voice-profile-tone">
                    <span>Tone</span>
                    <textarea
                      id="voice-profile-tone"
                      className="modal-textarea is-compact"
                      value={scriptVoiceForm.tone}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, tone: event.target.value }))}
                      placeholder="Direct, practical, strong point of view, no hype."
                    />
                  </label>
                  <label className="field-control" htmlFor="voice-profile-pacing">
                    <span>Pacing</span>
                    <input
                      id="voice-profile-pacing"
                      type="text"
                      value={scriptVoiceForm.pacing}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, pacing: event.target.value }))}
                      placeholder="Short spoken sentences"
                    />
                  </label>
                  <div className="field-control">
                    <span>Default length</span>
                    <CustomSelect
                      ariaLabel="Profile default length"
                      value={scriptVoiceForm.defaultLength}
                      options={AI_LENGTH_OPTIONS}
                      onChange={(value) => setScriptVoiceForm((current) => ({ ...current, defaultLength: value }))}
                    />
                  </div>
                  <label className="field-control ai-modal-wide" htmlFor="voice-profile-banned">
                    <span>Banned words</span>
                    <input
                      id="voice-profile-banned"
                      type="text"
                      value={scriptVoiceForm.bannedWords}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, bannedWords: event.target.value }))}
                      placeholder="No hype, no generic AI phrases"
                    />
                  </label>
                  <label className="field-control ai-modal-wide" htmlFor="voice-profile-preferred">
                    <span>Preferred phrases</span>
                    <input
                      id="voice-profile-preferred"
                      type="text"
                      value={scriptVoiceForm.preferredPhrases}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, preferredPhrases: event.target.value }))}
                      placeholder="Use practical next steps and specific examples"
                    />
                  </label>
                  <label className="field-control ai-modal-wide" htmlFor="voice-profile-structure">
                    <span>Structure</span>
                    <input
                      id="voice-profile-structure"
                      type="text"
                      value={scriptVoiceForm.structure}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, structure: event.target.value }))}
                      placeholder="Hook, context, recommendation, close"
                    />
                  </label>
                  <label className="field-control ai-modal-wide" htmlFor="voice-profile-examples">
                    <span>Examples / import markdown</span>
                    <textarea
                      id="voice-profile-examples"
                      className="modal-textarea"
                      value={scriptVoiceForm.examples}
                      onChange={(event) => setScriptVoiceForm((current) => ({ ...current, examples: event.target.value }))}
                      placeholder="Paste sample lines, markdown notes, or a style guide here."
                    />
                  </label>
                </div>
                {scriptVoiceMessage ? <p className="library-message modal-message">{scriptVoiceMessage}</p> : null}
                <div className="voice-profile-actions is-footer">
                  <button
                    className="save-button"
                    type="button"
                    onClick={saveCustomScriptVoice}
                    disabled={isSavingScriptVoice}
                  >
                    <FloppyDisk size={17} weight="bold" />
                    {isSavingScriptVoice ? "Saving" : "Save Voice"}
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={deleteSelectedScriptVoice}
                    disabled={!selectedScriptVoiceId.startsWith("custom:") || isDeletingScriptVoice}
                  >
                    <Trash size={17} weight="bold" />
                    {isDeletingScriptVoice ? "Deleting" : "Delete Voice"}
                  </button>
                </div>
              </section>
            </div>
            {aiMessage ? <p className="library-message modal-message">{aiMessage}</p> : null}
            <div className="modal-actions">
              <button className="save-button" type="button" onClick={() => setIsAiGeneratorOpen(false)} disabled={isGeneratingScript}>
                Cancel
              </button>
              <button className="save-button is-primary-action" type="button" onClick={generateScriptFromAi} disabled={isGeneratingScript}>
                <Sparkle size={17} weight="bold" />
                {isGeneratingScript ? "Generating" : "Generate"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {isAiSetupModalOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsAiSetupModalOpen(false);
            }
          }}
        >
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ai-setup-title"
            aria-describedby="ai-setup-copy"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Generator setup</p>
                <h2 id="ai-setup-title">AI options unavailable</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setIsAiSetupModalOpen(false)}
                aria-label="Close setup notice"
                title="Close setup notice"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p id="ai-setup-copy" className="modal-copy">
              {aiSetupMessage}
            </p>
            <div className="modal-actions">
              <button className="save-button is-primary-action" type="button" onClick={() => setIsAiSetupModalOpen(false)}>
                Got it
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {isVoiceModalOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsVoiceModalOpen(false);
            }
          }}
        >
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-setup-title"
            aria-describedby="voice-setup-copy"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Voice controls</p>
                <h2 id="voice-setup-title">{voiceStatus?.isConfigured ? "Voice is ready" : "Voice is not set up"}</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setIsVoiceModalOpen(false)}
                aria-label="Close voice controls"
                title="Close voice controls"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p id="voice-setup-copy" className="modal-copy">
              {voiceStatus?.isConfigured
                ? "Voice control is ready. It stays off until you turn it on for this session. RSVP mode still uses the Start button and WPM pace."
                : "Voice control is not set up yet. Ask the site owner to configure ELEVENLABS_API_KEY."}
            </p>
            {voiceStatus?.isConfigured && isVoiceModeRequested ? (
              <p className="library-message modal-message">
                Voice mode is marked on for this session. Full voice-follow scrolling still needs the listening engine.
              </p>
            ) : null}
            <div className="modal-actions">
              <button className="save-button" type="button" onClick={() => setIsVoiceModalOpen(false)}>
                Close
              </button>
              {voiceStatus?.isConfigured ? (
                <button
                  className="save-button is-primary-action"
                  type="button"
                  onClick={() => {
                    setIsVoiceModeRequested((current) => !current);
                    setIsVoiceModalOpen(false);
                  }}
                >
                  <Microphone size={17} weight="bold" />
                  {isVoiceModeRequested ? "Turn Off" : "Turn On"}
                </button>
              ) : (
                <button className="save-button is-primary-action" type="button" onClick={() => setIsVoiceModalOpen(false)}>
                  Got it
                </button>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
