import {
  type ClipboardEvent as ReactClipboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Copy,
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
  PaperPlaneTilt,
  Pause,
  PencilSimple,
  Play,
  Plus,
  Question,
  SignOut,
  SlidersHorizontal,
  Sparkle,
  TextAlignCenter,
  Trash,
  UserCircle,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

type PromptTab = "prompter" | "script" | "build" | "video" | "help" | "account";
type TextColor = "white" | "red" | "yellow" | "grey" | "darkgrey";
type PromptFont = "system" | "promptdeck" | "lexend" | "opendyslexic";
type LayoutMode = "left" | "centered";
type BackgroundMode = "black" | "spotlight" | "white";
type AiProvider = "auto" | "openai" | "claude" | "openrouter";
type AiLength = "short" | "long" | "open";
type ReadingMode = "scroll" | "rsvp";
type LegalModal = "privacy" | "terms";
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

type AiPromptSettings = {
  isAuthenticated: boolean;
  defaultPrompt: string;
  prompt: string;
  hasCustomPrompt: boolean;
  skillSourceUrl: string | null;
  skillMarkdown: string | null;
  notes: string | null;
  updatedAt: number | null;
};

type GeneratedScriptResult = {
  script: string;
  model: string;
  provider: Exclude<AiProvider, "auto">;
  usedUrl: string | null;
};

type SkillImportResult =
  | {
      ok: true;
      message: string;
      skillMarkdown: string;
      skillSourceUrl: string;
    }
  | {
      ok: false;
      message: string;
    };

type UserApiKeyService = "openai" | "claude" | "openrouter" | "firecrawl" | "elevenlabs" | "heygen";
type StoredApiKeyService = UserApiKeyService | "r2" | "mux";

type UserApiKeyStatus = {
  isAuthenticated: boolean;
  keys: Array<{
    service: StoredApiKeyService;
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
type VideoSourceType = "prompt" | "url" | "script" | "mixed";
type VideoAspectRatio = "16:9" | "9:16" | "1:1";
type VideoQuality = "draft" | "standard" | "high";
type VideoJobStatus = "queued" | "authoring" | "authored" | "rendering" | "done" | "failed";
type VideoJob = {
  _id: Id<"videoJobs">;
  status: VideoJobStatus;
  sourceType: VideoSourceType;
  title: string;
  prompt?: string;
  sourceUrl?: string;
  scriptText?: string;
  designInstructions?: string;
  designUrl?: string;
  voiceProfileId?: string;
  voiceProfileName?: string;
  aspectRatio: VideoAspectRatio;
  durationSeconds: number;
  quality: VideoQuality;
  progress: number;
  message?: string;
  outputUrl?: string;
  createdAt: number;
  updatedAt: number;
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
  backgroundMode: BackgroundMode;
};
const PROMPT_FONTS: PromptFont[] = ["system", "promptdeck", "lexend", "opendyslexic"];
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

const DEFAULT_SCRIPT = `Welcome to PromptDeck.

PromptDeck helps you write, organize, generate, and read scripts in the browser.
It also gives you an agent AI workflow for turning notes, links, docs, or prompts into scripts and video jobs.

Start in Script when you want to draft by hand.
Move to Build when you want agent-style help turning notes, links, or ideas into a stronger script.
Open Video when you want to turn a prompt, URL, script, or design notes into a video job.

[pause]

AI is optional.
The prompter works without login.

If you sign in, you can save scripts, create your own writing tones, add your own keys, and keep scripts or video jobs private to your account.

[pause]

Use page breaks when you want a cleaner pace.
Use RSVP when you want one word at a time.
Use Mini View when you need a compact recording window.

The goal is simple:
write the script, shape it with help when you need it, and deliver without distractions.

Let's record.`;

const DEFAULT_SETTINGS: PromptSettings = {
  fontSize: 56,
  speed: 36,
  speedMultiplier: 1,
  scroll: 0,
  mirrored: false,
  guide: false,
  fitToWindow: false,
  textColor: "white",
  fontFamily: "system",
  layoutMode: "left",
  backgroundMode: "black",
};
const LOCAL_SCRIPT_CACHE_KEY = "promptdeck.localScriptState.v1";
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
  { value: "promptdeck", label: "PromptDeck" },
  { value: "lexend", label: "Lexend" },
  { value: "opendyslexic", label: "OpenDyslexic" },
];
const LAYOUT_OPTIONS: Array<SelectOption<LayoutMode>> = [
  { value: "left", label: "Left aligned" },
  { value: "centered", label: "Left aligned, centered page" },
];
const BACKGROUND_MODE_OPTIONS: Array<SelectOption<BackgroundMode>> = [
  { value: "black", label: "Black" },
  { value: "spotlight", label: "Spotlight" },
  { value: "white", label: "White" },
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
  { value: "heygen", label: "HeyGen / HyperFrames" },
];
const API_MODEL_OPTIONS: Partial<Record<UserApiKeyService, Array<SelectOption<string>>>> = {
  openai: [
    { value: "", label: "Default: GPT-5.4 mini" },
    { value: "gpt-5.4-mini", label: "GPT-5.4 mini" },
    { value: "gpt-5.5", label: "GPT-5.5" },
    { value: "gpt-5.4", label: "GPT-5.4" },
  ],
  claude: [
    { value: "", label: "Default: Claude Sonnet 4.6" },
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { value: "claude-fable-5", label: "Claude Fable 5" },
    { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
    { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  ],
  openrouter: [
    { value: "", label: "Default: OpenRouter Fusion" },
    { value: "openrouter/fusion", label: "OpenRouter Fusion" },
    { value: "anthropic/claude-fable-5", label: "Claude Fable 5" },
    { value: "anthropic/claude-opus-4.8", label: "Claude Opus 4.8" },
    { value: "openai/gpt-5.5", label: "OpenAI GPT-5.5" },
    { value: "openai/gpt-5.4-mini", label: "OpenAI GPT-5.4 mini" },
  ],
};
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
const VIDEO_SOURCE_OPTIONS: Array<SelectOption<VideoSourceType>> = [
  { value: "mixed", label: "Prompt + sources" },
  { value: "prompt", label: "Prompt only" },
  { value: "url", label: "URL" },
  { value: "script", label: "Script" },
];
const VIDEO_ASPECT_OPTIONS: Array<SelectOption<VideoAspectRatio>> = [
  { value: "16:9", label: "16:9 demo" },
  { value: "9:16", label: "9:16 short" },
  { value: "1:1", label: "1:1 square" },
];
const VIDEO_QUALITY_OPTIONS: Array<SelectOption<VideoQuality>> = [
  { value: "draft", label: "Draft" },
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
];
const EMPTY_BUILD_FORM = {
  kind: "script" as BuildItemKind,
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
const EMPTY_VIDEO_FORM = {
  sourceType: "mixed" as VideoSourceType,
  title: "",
  prompt: "",
  sourceUrl: "",
  scriptText: "",
  designInstructions: "",
  designUrl: "",
  voiceProfileId: "builtin-natural",
  aspectRatio: "16:9" as VideoAspectRatio,
  durationSeconds: 60,
  quality: "draft" as VideoQuality,
};
const MODEL_KEY_SERVICES = new Set<UserApiKeyService>(["openai", "claude", "openrouter"]);
const SITE_APP_KEY_SERVICES = new Set<UserApiKeyService>(["openrouter"]);
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
  heygen: {
    keyLabel: "API key",
    modelLabel: "Model",
    modelPlaceholder: "",
    siteLabel: "Site URL",
    appLabel: "App name",
    help: "Used by Video jobs for HyperFrames cloud rendering with the user's own HeyGen key.",
  },
};
const BYOK_REQUIREMENTS: Array<{ service: UserApiKeyService; label: string; required: string; use: string }> = [
  { service: "openai", label: "OpenAI", required: "API key, optional model", use: "Generate scripts, RSVP rewrites, and video authoring prompts." },
  { service: "claude", label: "Claude", required: "API key, optional model", use: "Generate scripts, RSVP rewrites, and video authoring prompts." },
  { service: "openrouter", label: "OpenRouter", required: "API key, optional model, optional site URL/app name", use: "Route script and video authoring through OpenRouter. Use https://www.promptdeck.app as the site URL." },
  { service: "firecrawl", label: "Firecrawl", required: "API key", use: "Scrape pasted URLs, markdown links, docs URLs, and design URLs before generation." },
  { service: "elevenlabs", label: "ElevenLabs", required: "API key", use: "Enable narration voice features when configured." },
  { service: "heygen", label: "HeyGen / HyperFrames", required: "API key", use: "Render Video tab jobs through HyperFrames cloud using the user's own HeyGen key." },
];
const STACK_SHOWCASE = [
  { label: "Frontend", value: "React + Vite", copy: "Fast browser scripts with TypeScript and Phosphor controls." },
  { label: "Backend", value: "Convex", copy: "Reactive functions, database tables, auth, and static hosting." },
  { label: "Private data", value: "GitHub login", copy: "User-owned scripts, folders, voices, prompts, defaults, and keys." },
  { label: "Hosting", value: "Static hosting", copy: "The production app ships through the Convex static hosting component." },
] as const;
const STACK_BYOK_OPTIONS = [
  ["OpenAI", "Script generation"],
  ["Claude", "Script generation"],
  ["OpenRouter", "Model routing"],
  ["Firecrawl", "URL context"],
  ["ElevenLabs", "Narration voice"],
  ["HeyGen", "Video rendering"],
] as const;
const ACTIVE_API_KEY_SERVICES = new Set<UserApiKeyService>(API_KEY_SERVICE_OPTIONS.map((option) => option.value));
const PRIVACY_SECTIONS = [
  ["Overview", "PromptDeck is an open source browser teleprompter for writing, organizing, and reading scripts. We collect the minimum data needed to run the hosted service. You own your content. We do not sell your data."],
  ["Account data", "When you sign in with GitHub, PromptDeck stores the profile details GitHub shares with the app, such as your name, email when available, avatar, and authentication session records."],
  ["Script, build, and video data", "If you save content after signing in, PromptDeck stores your scripts, folders, Build items, video jobs, custom Script Voice Profiles, default settings, and project notes in Convex under your user account."],
  ["Bring your own keys", "If you save API keys for OpenAI, Claude, OpenRouter, Firecrawl, ElevenLabs, or HeyGen, the raw key is encrypted server-side before storage. The app only shows configured status later, not the raw key."],
  ["How data is used", "Your data is used to provide saved libraries, generation features, URL scraping, and narration setup. We do not train AI models on your saved scripts."],
  ["Third-party services", "PromptDeck uses Convex for backend storage and GitHub OAuth through Convex Auth for login. Your own provider keys are used only when you choose features that call those providers."],
  ["Deleting data", "You can delete saved scripts and Build items from the app. Signed-in users can delete their account from Account, which removes PromptDeck-owned app data tied to that user, including video jobs."],
  ["Contact", "For privacy questions, open an issue at github.com/waynesutton/teleprompter."],
] as const;
const TERMS_SECTIONS = [
  ["Agreement", "By using PromptDeck at www.promptdeck.app, you agree to these terms for the hosted service. The source code is open source; these terms cover the hosted app."],
  ["Service", "PromptDeck provides script writing, live prompting, local drafting, saved libraries for signed-in users, optional AI generation, optional URL scraping, optional narration setup, and optional video job creation."],
  ["Your content", "You own the scripts, notes, prompts, Build items, video jobs, and settings you create. You grant PromptDeck permission to store, process, and display that content only to provide the service to you."],
  ["Your responsibilities", "Do not use PromptDeck for illegal activity, malicious content, unauthorized access, or content you do not have the right to store or process."],
  ["Provider keys", "If you bring your own API keys, you are responsible for those provider accounts, usage, cost, and key rotation. Remove a key from Account if you no longer want PromptDeck to use it."],
  ["Availability", "PromptDeck is provided as-is and may change, pause, or stop at any time. Use it at your own risk, especially for live production workflows."],
  ["Liability", "To the maximum extent allowed by law, the maintainer is not liable for indirect, incidental, special, consequential, or punitive damages from using the hosted service."],
  ["Governing law", "These terms are governed by the laws of California, United States, without regard to conflict of law rules."],
  ["Contact", "For questions about these terms, open an issue at github.com/waynesutton/teleprompter."],
] as const;
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
  {
    id: "builtin-devrel",
    name: "DevRel",
    audience: "Developers, builders, technical buyers, and community members evaluating a tool or idea.",
    tone: "Practical, clear, technically credible, and conversational. Explain what matters and why without sounding salesy.",
    pacing: "Start with a real problem, move quickly into proof, show the useful path, and close with one concrete next step.",
    bannedWords: "Avoid empty hype, over-polished corporate language, vague claims, and unexplained jargon.",
    preferredPhrases: "Use specific pain points, short setup context, practical demos, tradeoffs, and direct takeaways.",
    examples: "Sounds like a trusted technical builder walking one viewer through why a workflow matters.",
    structure: "Hook, problem, context, demo-style beats, tradeoffs, recap, next step.",
    defaultLength: "long",
    source: "builtin",
  },
  {
    id: "builtin-viral-video",
    name: "Viral Video",
    audience: "Short-form viewers who need a fast hook, useful payoff, and clear reason to keep watching.",
    tone: "Punchy, direct, curious, and easy to record. No filler, no fake urgency, no engagement begging.",
    pacing: "Very fast opening, one useful beat every few seconds, short spoken sentences, strongest takeaway at the end.",
    bannedWords: "Avoid unlock, unleash, game changer, dive into, landscape, leverage, elevate, robust, cutting-edge, revolutionary, breakthrough, seamless, empower, innovative, transformative, journey, synergy, optimize, and generic hype.",
    preferredPhrases: "Use curiosity, contrast, personal relevance, casual credibility, and one surprising payoff.",
    examples: "A short-form script with three hook options, tight spoken sections, caption-ready phrases, and recording notes.",
    structure: "Curiosity hook, broad relevance, credibility stamp, rapid-fire payoff, memorable close.",
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
  ["Keyboard control", "Use shortcuts for playback, tabs, pages, sizing, About, and undo."],
  ["Mini view", "Open a synced popup prompter for a compact recording view while keeping keyboard controls active."],
  ["Build workspace", "Sign in to generate scripts with your saved prompt rules and save reusable script Build items."],
  ["Video jobs", "Sign in to queue video jobs from prompts, URLs, scripts, and design markdown. Rendering uses your saved HeyGen / HyperFrames key."],
  ["Skill-supported scripts", "Import or paste skill guidance in Account so generated scripts can follow a specific writing system."],
  ["Optional tools", "AI script generation, Firecrawl URL context, and narration voice depend on your saved provider keys."],
  ["Open source", "The project is open source at github.com/waynesutton/teleprompter."],
] as const;

const APP_DOCS = [
  ["Prompter", "Read the current script live. Use Start, speed, page controls, fit, guide, mirror, RSVP, and the hide-bar control for recording."],
  ["Mini View", "Use the monitor icon on Tab 1 to open a compact movable prompter. It follows the active page, scroll/RSVP mode, playback state, and keyboard shortcuts."],
  ["Script", "Write or paste the source script, preview formatting, add page breaks, save scripts into folders, and export markdown."],
  ["Build", "Sign in to generate scripts from topics, notes, links, docs, or the current draft. URL scraping needs Firecrawl, and AI generation needs OpenAI, Claude, or OpenRouter."],
  ["Video", "Sign in to queue a HyperFrames video job from a prompt, URL, script, or design markdown. Convex tracks the job, and rendering requires your saved HeyGen / HyperFrames key."],
  ["About", "Review shortcuts, read app docs, and check the open source feature list."],
  ["Script Voice Profiles", "Choose a writing tone for AI-generated scripts. Built-in profiles work immediately, and custom profiles can be saved, edited, deleted, or imported from notes."],
  ["Narration Voice", "Audio narration is separate from script writing tone. It only becomes usable when your ElevenLabs key is saved."],
  ["RSVP Mode", "Switch Tab 1 to RSVP to show one word at a time with a red ORP pivot letter. AI is optional and only helps rewrite scripts for easier RSVP reading."],
  ["Saving", "Generated text replaces the editor draft, but it is not saved to your library until you click a save control."],
] as const;

const SHORTCUTS = [
  ["Space", "Start or pause"],
  ["S or Escape", "Stop and return to the top"],
  ["Command/Ctrl + ?", "Open keyboard shortcuts"],
  ["Command/Ctrl + 1", "Open Prompter"],
  ["Command/Ctrl + 2", "Open Script"],
  ["Command/Ctrl + 3", "Open Build"],
  ["Command/Ctrl + 4", "Open Video"],
  ["Command/Ctrl + 5", "Open About"],
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

const getFontClass = (fontFamily: PromptFont) => `font-${fontFamily}`;

const normalizePromptFont = (fontFamily: string | undefined): PromptFont =>
  PROMPT_FONTS.includes(fontFamily as PromptFont) ? (fontFamily as PromptFont) : DEFAULT_SETTINGS.fontFamily;

type LocalScriptState = {
  draft: string;
  settings: PromptSettings;
  scriptTitle: string;
  scriptFolder: string;
  updatedAt: number;
};

const normalizeLocalSettings = (settings: Partial<PromptSettings> | null | undefined): PromptSettings => ({
  ...DEFAULT_SETTINGS,
  ...(settings ?? {}),
  textColor: ["white", "red", "yellow", "grey", "darkgrey"].includes(settings?.textColor ?? "")
    ? (settings?.textColor as TextColor)
    : DEFAULT_SETTINGS.textColor,
  fontFamily: normalizePromptFont(settings?.fontFamily),
  layoutMode: settings?.layoutMode === "centered" ? "centered" : "left",
  backgroundMode: settings?.backgroundMode === "spotlight" || settings?.backgroundMode === "white" ? settings.backgroundMode : "black",
});

const readLocalScriptState = (): LocalScriptState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(LOCAL_SCRIPT_CACHE_KEY);
    if (!rawValue) {
      return null;
    }

    const value = JSON.parse(rawValue) as Partial<LocalScriptState>;
    return {
      draft: typeof value.draft === "string" ? value.draft : DEFAULT_SCRIPT,
      settings: normalizeLocalSettings(value.settings),
      scriptTitle: typeof value.scriptTitle === "string" ? value.scriptTitle : getDefaultScriptTitle(value.draft ?? DEFAULT_SCRIPT),
      scriptFolder: typeof value.scriptFolder === "string" ? value.scriptFolder : "",
      updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : 0,
    };
  } catch {
    return null;
  }
};

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
  const videoJobsQuery = useQuery(api.videoJobs.list) as VideoJob[] | undefined;
  const viewer = useQuery(api.users.getViewer);
  const apiKeyStatus = useQuery(api.userApiKeys.getStatus) as UserApiKeyStatus | undefined;
  const aiPromptSettings = useQuery(api.aiPromptSettings.get) as AiPromptSettings | undefined;
  const getAiProviderStatus = useAction(api.aiScripts.getAiProviderStatus);
  const generateAiScript = useAction(api.aiScripts.generateScript);
  const rewriteScriptForRsvp = useAction(api.aiScripts.rewriteForRsvp);
  const importSkillFromUrl = useAction(api.aiPromptImports.importSkillFromUrl);
  const getVoiceStatus = useAction(api.voice.getVoiceStatus);
  const saveUserApiKey = useAction(api.apiKeyActions.save);
  const deleteCurrentAccount = useMutation(api.users.deleteCurrentAccount);
  const savePrompt = useMutation(api.teleprompter.save);
  const saveSharedScript = useMutation(api.teleprompter.saveSharedScript);
  const saveDefaultSettings = useMutation(api.teleprompter.saveDefaultSettings);
  const deleteSharedScript = useMutation(api.teleprompter.deleteSharedScript);
  const saveBuildItem = useMutation(api.buildItems.save);
  const setBuildItemStatus = useMutation(api.buildItems.setStatus);
  const deleteBuildItem = useMutation(api.buildItems.remove);
  const createVideoJob = useMutation(api.videoJobs.create);
  const removeUserApiKey = useMutation(api.userApiKeys.remove);
  const saveAiPromptSettings = useMutation(api.aiPromptSettings.save);
  const resetAiPromptSettings = useMutation(api.aiPromptSettings.reset);
  const saveScriptVoiceProfile = useMutation(api.scriptVoices.save);
  const deleteScriptVoiceProfile = useMutation(api.scriptVoices.remove);
  const [activeTab, setActiveTab] = useState<PromptTab>("prompter");
  const initialLocalScriptState = useRef(readLocalScriptState());
  const previousAuthenticatedRef = useRef<boolean | null>(null);
  const skipNextLocalPersistRef = useRef(false);
  const [draft, setDraft] = useState(initialLocalScriptState.current?.draft ?? DEFAULT_SCRIPT);
  const [draftUndoStack, setDraftUndoStack] = useState<string[]>([]);
  const [settings, setSettings] = useState<PromptSettings>(initialLocalScriptState.current?.settings ?? DEFAULT_SETTINGS);
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
  const [scriptTitle, setScriptTitle] = useState(initialLocalScriptState.current?.scriptTitle ?? getDefaultScriptTitle(DEFAULT_SCRIPT));
  const [scriptFolder, setScriptFolder] = useState(initialLocalScriptState.current?.scriptFolder ?? "");
  const [savedFolderFilter, setSavedFolderFilter] = useState("all");
  const [selectedSavedScriptId, setSelectedSavedScriptId] = useState("");
  const [linkedSavedScriptId, setLinkedSavedScriptId] = useState<Id<"savedScripts"> | null>(null);
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
  const [isDeleteAccountConfirmOpen, setIsDeleteAccountConfirmOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [isNewScriptDialogOpen, setIsNewScriptDialogOpen] = useState(false);
  const [isScriptPreviewOpen, setIsScriptPreviewOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isAiSetupModalOpen, setIsAiSetupModalOpen] = useState(false);
  const [isCheckingAiSetup, setIsCheckingAiSetup] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
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
  const [aiPromptDraft, setAiPromptDraft] = useState("");
  const [aiPromptNotes, setAiPromptNotes] = useState("");
  const [skillSourceUrl, setSkillSourceUrl] = useState("");
  const [skillMarkdownDraft, setSkillMarkdownDraft] = useState("");
  const [aiPromptMessage, setAiPromptMessage] = useState<string | null>(null);
  const [isSavingAiPrompt, setIsSavingAiPrompt] = useState(false);
  const [isImportingSkill, setIsImportingSkill] = useState(false);
  const [buildForm, setBuildForm] = useState(EMPTY_BUILD_FORM);
  const [editingBuildItemId, setEditingBuildItemId] = useState<Id<"buildItems"> | null>(null);
  const [buildMessage, setBuildMessage] = useState<string | null>(null);
  const [isSavingBuildItem, setIsSavingBuildItem] = useState(false);
  const [isUpdatingBuildItem, setIsUpdatingBuildItem] = useState(false);
  const [buildPendingDeleteId, setBuildPendingDeleteId] = useState<Id<"buildItems"> | null>(null);
  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO_FORM);
  const [videoMessage, setVideoMessage] = useState<string | null>(null);
  const [isCreatingVideoJob, setIsCreatingVideoJob] = useState(false);
  const [isVideoSetupOpen, setIsVideoSetupOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [generatedScriptResult, setGeneratedScriptResult] = useState<GeneratedScriptResult | null>(null);
  const [isGeneratedScriptHandled, setIsGeneratedScriptHandled] = useState(false);
  const [hasAiGenerationFailed, setHasAiGenerationFailed] = useState(false);
  const [isGeneratedScriptCloseConfirmOpen, setIsGeneratedScriptCloseConfirmOpen] = useState(false);
  const [aiSetupMessage, setAiSetupMessage] = useState("These options are not setup. Contact the app creator to config.");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCheckingVoiceStatus, setIsCheckingVoiceStatus] = useState(false);
  const [isVoiceModeRequested, setIsVoiceModeRequested] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);
  const [legalModal, setLegalModal] = useState<LegalModal | null>(null);
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
  const videoJobs = useMemo(() => videoJobsQuery ?? [], [videoJobsQuery]);
  const activeApiKeyStatuses = useMemo(
    () => (apiKeyStatus?.keys ?? []).filter((key) => ACTIVE_API_KEY_SERVICES.has(key.service as UserApiKeyService)),
    [apiKeyStatus],
  );
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
  const videoAiConfigured = useMemo(
    () =>
      Boolean(
        apiKeyStatus?.keys.some(
          (key) => key.isConfigured && (key.service === "openai" || key.service === "claude" || key.service === "openrouter"),
        ),
      ),
    [apiKeyStatus],
  );
  const firecrawlConfigured = useMemo(
    () => Boolean(apiKeyStatus?.keys.some((key) => key.service === "firecrawl" && key.isConfigured)),
    [apiKeyStatus],
  );
  const heygenConfigured = useMemo(
    () => Boolean(apiKeyStatus?.keys.some((key) => key.service === "heygen" && key.isConfigured)),
    [apiKeyStatus],
  );
  const buildGeneratorSource = useMemo(
    () =>
      [
        buildForm.title ? `Title: ${buildForm.title}` : "",
        buildForm.sourceText,
        buildForm.scriptSnapshot,
        buildForm.notes,
      ]
        .map((value) => value.trim())
        .filter(Boolean)
        .join("\n\n"),
    [buildForm.notes, buildForm.scriptSnapshot, buildForm.sourceText, buildForm.title],
  );
  const getAiGeneratorSource = () => (activeTab === "build" ? buildGeneratorSource.trim() : draft.trim());
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
  const selectedVideoVoice = useMemo(() => {
    return scriptVoiceProfiles.find((profile) => profile.id === videoForm.voiceProfileId) ?? BUILT_IN_SCRIPT_VOICES[0];
  }, [scriptVoiceProfiles, videoForm.voiceProfileId]);
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

  const clearLinkedSavedScript = useCallback((message?: string) => {
    setLinkedSavedScriptId(null);
    setSelectedSavedScriptId("");

    if (message) {
      setLibraryMessage(message);
    }
  }, []);

  const handleScriptPaste = (event: ReactClipboardEvent<HTMLTextAreaElement>) => {
    if (!linkedSavedScriptId || !textareaRef.current) {
      return;
    }

    const pastedText = event.clipboardData.getData("text");
    const selectedLength = textareaRef.current.selectionEnd - textareaRef.current.selectionStart;
    const replacesMostDraft = draft.length > 0 && selectedLength >= draft.length * 0.5;

    if (pastedText.length >= 120 || replacesMostDraft) {
      clearLinkedSavedScript("Pasted new content. Use a new title or folder before saving to avoid overwriting a saved script.");
    }
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
      fontFamily: normalizePromptFont(savedDefaultSettings.fontFamily),
      layoutMode: savedDefaultSettings.layoutMode,
      backgroundMode: savedDefaultSettings.backgroundMode ?? DEFAULT_SETTINGS.backgroundMode,
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
      fontFamily: normalizePromptFont(savedPrompt.fontFamily),
      layoutMode: savedPrompt.layoutMode,
      backgroundMode: savedPrompt.backgroundMode ?? DEFAULT_SETTINGS.backgroundMode,
    });
    setLastSavedAt(savedPrompt.updatedAt);
  }, [savedPrompt]);

  useEffect(() => {
    if (authState.isLoading) {
      return;
    }

    const wasAuthenticated = previousAuthenticatedRef.current;
    previousAuthenticatedRef.current = isAuthenticated;

    if (wasAuthenticated && !isAuthenticated) {
      const localState = readLocalScriptState();
      skipNextLocalPersistRef.current = true;
      setDraft(localState?.draft ?? DEFAULT_SCRIPT);
      setDraftUndoStack([]);
      setSettings(localState?.settings ?? DEFAULT_SETTINGS);
      setScriptTitle(localState?.scriptTitle ?? getDefaultScriptTitle(localState?.draft ?? DEFAULT_SCRIPT));
      setScriptFolder(localState?.scriptFolder ?? "");
      setSelectedSavedScriptId("");
      setLinkedSavedScriptId(null);
      setSavedFolderFilter("all");
      setCurrentPageIndex(0);
      resetScroll();
      setLibraryMessage("Signed out. Using this browser's local script draft.");
    }
  }, [authState.isLoading, isAuthenticated, resetScroll]);

  useEffect(() => {
    if (authState.isLoading || isAuthenticated || typeof window === "undefined") {
      return;
    }

    if (skipNextLocalPersistRef.current) {
      skipNextLocalPersistRef.current = false;
      return;
    }

    const localState: LocalScriptState = {
      draft,
      settings,
      scriptTitle,
      scriptFolder,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(LOCAL_SCRIPT_CACHE_KEY, JSON.stringify(localState));
  }, [authState.isLoading, draft, isAuthenticated, scriptFolder, scriptTitle, settings]);

  useEffect(() => {
    if (authState.isLoading || !isAuthenticated || savedPrompt === undefined) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      void savePrompt({
        script: draft,
        fontSize: settings.fontSize,
        speed: settings.speed,
        speedMultiplier: settings.speedMultiplier,
        scroll: settings.scroll,
        mirrored: settings.mirrored,
        guide: settings.guide,
        fitToWindow: settings.fitToWindow,
        textColor: settings.textColor,
        fontFamily: settings.fontFamily,
        layoutMode: settings.layoutMode,
        backgroundMode: settings.backgroundMode,
        updatedAt: Date.now(),
      });
    }, 700);

    return () => window.clearTimeout(saveTimer);
  }, [authState.isLoading, draft, isAuthenticated, savedPrompt, savePrompt, settings]);

  useEffect(() => {
    if (!aiPromptSettings) {
      return;
    }

    setAiPromptDraft(aiPromptSettings.prompt);
    setAiPromptNotes(aiPromptSettings.notes ?? "");
    setSkillSourceUrl(aiPromptSettings.skillSourceUrl ?? "");
    setSkillMarkdownDraft(aiPromptSettings.skillMarkdown ?? "");
  }, [aiPromptSettings]);

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

  const closeAiGenerator = useCallback(() => {
    if (isGeneratingScript) {
      return;
    }

    if (generatedScriptResult && !isGeneratedScriptHandled) {
      setIsGeneratedScriptCloseConfirmOpen(true);
      return;
    }

    setIsGeneratedScriptCloseConfirmOpen(false);
    setIsAiGeneratorOpen(false);
    setGeneratedScriptResult(null);
    setIsGeneratedScriptHandled(false);
    setHasAiGenerationFailed(false);
  }, [generatedScriptResult, isGeneratedScriptHandled, isGeneratingScript]);

  const confirmCloseAiGenerator = () => {
    setIsGeneratedScriptCloseConfirmOpen(false);
    setIsAiGeneratorOpen(false);
    setGeneratedScriptResult(null);
    setIsGeneratedScriptHandled(false);
    setHasAiGenerationFailed(false);
  };

  const keepReviewingGeneratedScript = () => {
    setIsGeneratedScriptCloseConfirmOpen(false);
  };

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

      if (event.key === "Escape" && isGeneratedScriptCloseConfirmOpen) {
        event.preventDefault();
        setIsGeneratedScriptCloseConfirmOpen(false);
        return;
      }

      if (event.key === "Escape" && isAiGeneratorOpen) {
        event.preventDefault();
        closeAiGenerator();
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
          "4": "video",
          "5": "help",
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
    closeAiGenerator,
    draftUndoStack.length,
    goToNextPage,
    goToPreviousPage,
    isAiGeneratorOpen,
    isAiSetupModalOpen,
    isGeneratedScriptCloseConfirmOpen,
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
  const currentYear = new Date().getFullYear();
  const apiKeyModelOptions = useMemo<Array<SelectOption<string>>>(() => {
    const options = API_MODEL_OPTIONS[apiKeyService] ?? [];

    if (!MODEL_KEY_SERVICES.has(apiKeyService)) {
      return [];
    }

    if (apiKeyModel && !options.some((option) => option.value === apiKeyModel)) {
      return [{ value: apiKeyModel, label: `Custom: ${apiKeyModel}` }, ...options];
    }

    return options;
  }, [apiKeyModel, apiKeyService]);

  const clearForNewScript = useCallback(() => {
    setDraftFromTool("");
    setScriptTitle("");
    setScriptFolder("");
    setSelectedSavedScriptId("");
    setLinkedSavedScriptId(null);
    setCurrentPageIndex(0);
    resetScroll();
    setLibraryMessage("Ready for a new script.");
    setDeleteMessage(null);
    setScriptPendingDeleteId("");

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [resetScroll, setDraftFromTool]);

  const saveScriptToLibrary = async (mode: "save" | "saveAs" = "save") => {
    if (!requireLogin("Sign in with GitHub to save scripts to your library.")) {
      return false;
    }

    const isSaveAs = mode === "saveAs";
    const script = draft.trim();
    const title = scriptTitle.trim() || getDefaultScriptTitle(draft);
    const folder = scriptFolder.trim();

    if (!script) {
      setLibraryMessage(`Add script text before ${isSaveAs ? "using Save As" : "saving"}.`);
      return false;
    }

    if (!scriptTitle.trim()) {
      setLibraryMessage(`Add a script title before ${isSaveAs ? "using Save As" : "saving to your library"}.`);
      return false;
    }

    const savedAt = Date.now();
    setIsSavingScript(true);

    try {
      const result = await saveSharedScript({
        title,
        folder,
        script,
        expectedScriptId: isSaveAs ? undefined : linkedSavedScriptId ?? undefined,
        saveAs: isSaveAs,
        updatedAt: savedAt,
      });

      if (!result || result.status === "invalid") {
        setLibraryMessage("Add a title and script before saving.");
        return false;
      }

      if (result.status === "missing") {
        clearLinkedSavedScript("That saved script is no longer available. Save this draft with a new title.");
        return false;
      }

      if (result.status === "conflict") {
        const location = result.existingFolder ? ` in "${result.existingFolder}"` : "";
        setLibraryMessage(`A script named "${result.existingTitle}" already exists${location}. Use a new title or folder before ${isSaveAs ? "saving a copy" : "saving this draft"}.`);
        return false;
      }

      setScriptTitle(title);
      setScriptFolder(folder);
      if (folder) {
        setSavedFolderFilter(folder);
      } else if (savedFolderFilter !== "all") {
        setSavedFolderFilter("none");
      }
      setLinkedSavedScriptId(result.scriptId);
      setSelectedSavedScriptId(result.scriptId);
      setLastSavedAt(savedAt);
      setLibraryMessage(isSaveAs ? `Saved "${title}" as a new script.` : result.status === "created" ? `Created "${title}" in your library.` : `Saved changes to "${title}".`);
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
    const source = getAiGeneratorSource();
    setAiMessage(null);
    setHasAiGenerationFailed(false);
    setIsGeneratedScriptCloseConfirmOpen(false);

    if (!requireLogin("Sign in with GitHub and add your API keys to generate scripts.")) {
      return;
    }

    if (!source) {
      setAiMessage("Add a topic, notes, URL, markdown link, or script before generating.");
      return;
    }

    setIsCheckingAiSetup(true);

    try {
      const status = await getAiProviderStatus();
      const nextStatus = status as AiProviderStatus;
      const hasUrl = Boolean(getFirstUrl(source));

      if (nextStatus.providers.length === 0 || (hasUrl && !nextStatus.hasFirecrawl)) {
        setAiSetupMessage(
          hasUrl && !nextStatus.hasFirecrawl
            ? "Add your Firecrawl API key in Account settings before generating from a URL."
            : "Add an OpenAI, Claude, or OpenRouter API key in Account settings.",
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

  const signOutFromAccount = async () => {
    setAccountMessage(null);
    await signOut();
    setActiveTab("prompter");
    setIsDeleteAccountConfirmOpen(false);
  };

  const deleteSignedInAccount = async () => {
    setAccountMessage(null);
    setIsDeletingAccount(true);

    try {
      const result = await deleteCurrentAccount();
      setAccountMessage(result.message);

      if (result.ok) {
        try {
          await signOut();
        } catch {
          // The account deletion removes the active auth session, so signOut can be a no-op.
        }

        setIsDeleteAccountConfirmOpen(false);
        setActiveTab("prompter");
      }
    } finally {
      setIsDeletingAccount(false);
    }
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

  const saveScriptGeneratorPrompt = async () => {
    if (!requireLogin("Sign in with GitHub to save your script generator prompt.")) {
      return;
    }

    setAiPromptMessage(null);
    setIsSavingAiPrompt(true);

    try {
      const result = await saveAiPromptSettings({
        prompt: aiPromptDraft,
        skillSourceUrl: skillSourceUrl.trim() || undefined,
        skillMarkdown: skillMarkdownDraft.trim() || undefined,
        notes: aiPromptNotes.trim() || undefined,
        updatedAt: Date.now(),
      });
      setAiPromptMessage(result.message);
    } finally {
      setIsSavingAiPrompt(false);
    }
  };

  const resetScriptGeneratorPrompt = async () => {
    if (!requireLogin("Sign in with GitHub to reset your script generator prompt.")) {
      return;
    }

    setAiPromptMessage(null);
    setIsSavingAiPrompt(true);

    try {
      const result = await resetAiPromptSettings({ updatedAt: Date.now() });
      setAiPromptMessage(result.message);

      if (aiPromptSettings) {
        setAiPromptDraft(aiPromptSettings.defaultPrompt);
        setAiPromptNotes("");
        setSkillSourceUrl("");
        setSkillMarkdownDraft("");
      }
    } finally {
      setIsSavingAiPrompt(false);
    }
  };

  const copyScriptGeneratorPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPromptDraft);
      setAiPromptMessage("Prompt copied.");
    } catch {
      setAiPromptMessage("Could not copy the prompt in this browser.");
    }
  };

  const importSkillGuidance = async () => {
    if (!requireLogin("Sign in with GitHub and add Firecrawl to import a skill URL.")) {
      return;
    }

    setAiPromptMessage(null);
    setIsImportingSkill(true);

    try {
      const result = (await importSkillFromUrl({ url: skillSourceUrl })) as SkillImportResult;

      if (!result.ok) {
        setAiPromptMessage(result.message);
        return;
      }

      setSkillMarkdownDraft(result.skillMarkdown);
      setSkillSourceUrl(result.skillSourceUrl);
      setAiPromptMessage(result.message);
    } finally {
      setIsImportingSkill(false);
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
      kind: "script",
      sourceType: "script",
      title: nextTitle,
      scriptSnapshot: draft,
      sourceText: current.sourceText || nextTitle,
      transcriptText: "",
      editPlan: "",
      edlJson: "",
      subtitleStyle: "",
      renderChecklist: "",
      projectMemory: "",
      outputFormat: "",
    }));
    setBuildMessage("Current script added to the Build form.");
  };

  const editBuildItem = (item: BuildItem) => {
    setBuildForm({
      kind: "script",
      sourceType: item.sourceType,
      title: item.title,
      sourceText: item.sourceText ?? "",
      scriptSnapshot: item.scriptSnapshot ?? "",
      videoBrief: "",
      transcriptText: "",
      editPlan: "",
      edlJson: "",
      subtitleStyle: "",
      renderChecklist: "",
      projectMemory: "",
      outputFormat: "",
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
    const scriptSnapshot = buildForm.scriptSnapshot || draft;

    if (!title) {
      setBuildMessage("Add a title before saving.");
      return;
    }

    setBuildMessage(null);
    setIsSavingBuildItem(true);

    try {
      const savedId = await saveBuildItem({
        itemId: editingBuildItemId ?? undefined,
        kind: "script",
        sourceType: buildForm.sourceType,
        title,
        sourceText: buildForm.sourceText,
        scriptSnapshot,
        videoBrief: "",
        transcriptText: "",
        editPlan: "",
        edlJson: "",
        subtitleStyle: "",
        renderChecklist: "",
        projectMemory: "",
        outputFormat: "",
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

  const seedVideoFromCurrentScript = () => {
    const nextTitle = scriptTitle.trim() || getDefaultScriptTitle(draft);
    setVideoForm((current) => ({
      ...current,
      sourceType: current.sourceUrl.trim() || current.prompt.trim() ? "mixed" : "script",
      title: current.title || `${nextTitle} video`,
      prompt: current.prompt || `Create a clear demo video from this script: ${nextTitle}`,
      scriptText: draft,
    }));
    setVideoMessage("Current Script text added to Video.");
  };

  const loadVideoDesignFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    setVideoForm((current) => ({
      ...current,
      designInstructions: text.slice(0, 60000),
    }));
    setVideoMessage(`Loaded ${file.name} into design instructions.`);
  };

  const clearVideoForm = () => {
    setVideoForm({
      ...EMPTY_VIDEO_FORM,
      voiceProfileId: selectedScriptVoiceId,
    });
    setVideoMessage("Video form cleared.");
  };

  const createCurrentVideoJob = async () => {
    if (!requireLogin("Sign in with GitHub and add your own keys to create video jobs.")) {
      return;
    }

    const title = videoForm.title.trim() || getDefaultScriptTitle(videoForm.scriptText || videoForm.prompt || videoForm.sourceUrl);
    const hasSource = Boolean(videoForm.prompt.trim() || videoForm.sourceUrl.trim() || videoForm.scriptText.trim());

    if (!hasSource) {
      setVideoMessage("Add a prompt, URL, or script before creating a video job.");
      return;
    }

    if (!videoAiConfigured) {
      setVideoMessage("Add an OpenAI, Claude, or OpenRouter key in Account before creating video jobs.");
      return;
    }

    if (!heygenConfigured) {
      setVideoMessage("Add your HeyGen / HyperFrames API key in Account before creating video jobs.");
      return;
    }

    if ((videoForm.sourceUrl.trim() || videoForm.designUrl.trim()) && !firecrawlConfigured) {
      setVideoMessage("Add a Firecrawl key in Account to use URL or design URL context.");
      return;
    }

    setIsCreatingVideoJob(true);
    setVideoMessage(null);

    try {
      const jobId = await createVideoJob({
        sourceType: videoForm.sourceType,
        title,
        prompt: videoForm.prompt,
        sourceUrl: videoForm.sourceUrl,
        scriptText: videoForm.scriptText,
        designInstructions: videoForm.designInstructions,
        designUrl: videoForm.designUrl,
        voiceProfileId: selectedVideoVoice.id,
        voiceProfileName: selectedVideoVoice.name,
        aspectRatio: videoForm.aspectRatio,
        durationSeconds: videoForm.durationSeconds,
        quality: videoForm.quality,
        updatedAt: Date.now(),
      });

      setVideoMessage(
        jobId
          ? `Queued "${title}" with your HeyGen / HyperFrames key. Connect the renderer to author and render the MP4.`
          : "Could not create that video job. Check your source, AI key, HeyGen / HyperFrames key, Firecrawl key for URLs, and login state.",
      );
    } finally {
      setIsCreatingVideoJob(false);
    }
  };

  const loadScriptVoiceIntoForm = (profile: ScriptVoiceProfile) => {
    setSelectedScriptVoiceId(profile.id);
    setScriptVoiceForm({
      name: profile.name,
      audience: profile.audience,
      tone: profile.tone,
      pacing: profile.pacing,
      bannedWords: profile.bannedWords,
      preferredPhrases: profile.preferredPhrases,
      examples: profile.examples,
      structure: profile.structure,
      defaultLength: profile.defaultLength,
    });
    setScriptVoiceMessage(`Loaded "${profile.name}" into the custom profile editor.`);
  };

  const loadSelectedVoiceIntoForm = () => {
    loadScriptVoiceIntoForm(selectedScriptVoice);
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

  const deleteCustomScriptVoiceById = async (profileId: Id<"scriptVoiceProfiles">, name: string) => {
    if (!requireLogin("Sign in with GitHub to delete custom Script Voice Profiles.")) {
      return;
    }

    setIsDeletingScriptVoice(true);

    try {
      const didDelete = await deleteScriptVoiceProfile({ profileId });

      if (!didDelete) {
        setScriptVoiceMessage("That custom script voice was already deleted.");
        return;
      }

      if (selectedScriptVoiceId === `custom:${profileId}`) {
        setSelectedScriptVoiceId("builtin-natural");
      }

      setScriptVoiceMessage(`Deleted "${name}".`);
    } finally {
      setIsDeletingScriptVoice(false);
    }
  };

  const generateScriptFromAi = async () => {
    const source = getAiGeneratorSource();
    if (!source) {
      setAiMessage("Add a topic, notes, URL, markdown link, or script before generating.");
      return;
    }

    setAiMessage(null);
    setGeneratedScriptResult(null);
    setIsGeneratedScriptHandled(false);
    setHasAiGenerationFailed(false);
    setIsGeneratedScriptCloseConfirmOpen(false);
    setIsGeneratingScript(true);

    try {
      const result = await generateAiScript({
        input: source,
        provider: aiProvider,
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
          setHasAiGenerationFailed(true);
        }
        return;
      }

      setGeneratedScriptResult({
        script: result.script,
        model: result.model,
        provider: result.provider,
        usedUrl: result.usedUrl,
      });
      setIsGeneratedScriptHandled(false);
      setHasAiGenerationFailed(false);
      setAiMessage(`Generated with ${result.model}. Review it, then send it to Script.`);
    } catch {
      setAiMessage("Could not generate the script. Check your provider key and try again.");
      setHasAiGenerationFailed(true);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const sendGeneratedScriptToEditor = async () => {
    if (!generatedScriptResult) {
      return;
    }

    const generatedResult = generatedScriptResult;
    const nextScript = generatedScriptResult.script;
    const nextTitle = scriptTitle.trim() || getDefaultScriptTitle(nextScript);
    setDraftFromTool(generatedScriptResult.script);
    setLinkedSavedScriptId(null);
    setSelectedSavedScriptId("");
    setCurrentPageIndex(0);
    resetScroll();

    if (!scriptTitle.trim()) {
      setScriptTitle(nextTitle);
    }

    if (isAuthenticated) {
      await savePrompt({
        script: nextScript,
        fontSize: settings.fontSize,
        speed: settings.speed,
        speedMultiplier: settings.speedMultiplier,
        scroll: 0,
        mirrored: settings.mirrored,
        guide: settings.guide,
        fitToWindow: settings.fitToWindow,
        textColor: settings.textColor,
        fontFamily: settings.fontFamily,
        layoutMode: settings.layoutMode,
        backgroundMode: settings.backgroundMode,
        updatedAt: Date.now(),
      });
    }

    setIsAiGeneratorOpen(false);
    setGeneratedScriptResult(null);
    setIsGeneratedScriptHandled(false);
    setHasAiGenerationFailed(false);
    setIsGeneratedScriptCloseConfirmOpen(false);
    setActiveTab("script");
    setAiMessage(`Sent generated script from ${generatedResult.model} to Script.`);
  };

  const copyGeneratedScript = async () => {
    if (!generatedScriptResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedScriptResult.script);
      setIsGeneratedScriptHandled(true);
      setAiMessage("Generated script copied.");
    } catch {
      setAiMessage("Could not copy the generated script in this browser.");
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

      if (nextStatus.providers.length === 0) {
        setAiSetupMessage("These options are not setup. Contact the app creator to config.");
        setIsAiSetupModalOpen(true);
        return;
      }

      const result = await rewriteScriptForRsvp({
        input: source,
        provider: aiProvider,
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
      setLinkedSavedScriptId(null);
      setSelectedSavedScriptId("");
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
    setLinkedSavedScriptId(selectedSavedScript._id);
    setSelectedSavedScriptId(selectedSavedScript._id);
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

    const caret = textarea.selectionStart;
    const pageBreak = "\n\n---\n\n";
    const nextDraft = `${draft.slice(0, caret)}${pageBreak}${draft.slice(textarea.selectionEnd)}`;
    setDraftFromTool(nextDraft);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(caret + pageBreak.length, caret + pageBreak.length);
    });
  };

  const downloadMarkdown = (content: string, title: string) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getSafeMarkdownFileName(title || getDefaultScriptTitle(content));
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    downloadMarkdown(draft, scriptTitle || getDefaultScriptTitle(draft));
  };

  const exportGeneratedMarkdown = () => {
    if (!generatedScriptResult) {
      return;
    }

    downloadMarkdown(generatedScriptResult.script, scriptTitle || getDefaultScriptTitle(generatedScriptResult.script));
    setIsGeneratedScriptHandled(true);
    setAiMessage("Generated script saved as Markdown.");
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
        backgroundMode: settings.backgroundMode,
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

      if (linkedSavedScriptId === scriptToDelete._id) {
        setLinkedSavedScriptId(null);
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
          title="Open the script builder"
          data-tooltip="Build workspace"
          type="button"
        >
          <Sparkle size={16} weight="bold" />
          <span>Build</span>
        </button>
        <button
          className={activeTab === "video" ? "tab has-tooltip is-active" : "tab has-tooltip"}
          onClick={() => setActiveTab("video")}
          aria-current={activeTab === "video" ? "page" : undefined}
          title="Open video generation"
          data-tooltip="Video"
          type="button"
        >
          <VideoCamera size={16} weight="bold" />
          <span>Video</span>
        </button>
        <button
          className={activeTab === "help" ? "tab has-tooltip is-active" : "tab has-tooltip"}
          onClick={() => setActiveTab("help")}
          aria-current={activeTab === "help" ? "page" : undefined}
          title="Open About"
          data-tooltip="About"
          type="button"
        >
          <Question size={16} weight="bold" />
          <span>About</span>
        </button>
        {isAuthenticated ? (
          <button
            className={activeTab === "account" ? "tab account-tab has-tooltip is-active is-icon-only" : "tab account-tab has-tooltip is-icon-only"}
            type="button"
            onClick={() => {
              setAccountMessage(null);
              setActiveTab("account");
            }}
            aria-current={activeTab === "account" ? "page" : undefined}
            title={`Signed in as ${viewer?.name ?? viewer?.email ?? "GitHub user"}. Open account.`}
            data-tooltip="Account"
            aria-label={`Signed in as ${viewer?.name ?? viewer?.email ?? "GitHub user"}. Open account.`}
          >
            {viewer?.image ? (
              <img className="account-tab-avatar" src={viewer.image} alt="" />
            ) : (
              <UserCircle size={16} weight="bold" />
            )}
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
  const pageFooter = (
    <footer className="app-footer" aria-label="App footer">
      <span>
        © {currentYear} PromptDeck by{" "}
        <a href="https://waynesutton.ai" target="_blank" rel="noreferrer">
          waynesutton.ai
        </a>
      </span>
      <a href="https://github.com/waynesutton/teleprompter" target="_blank" rel="noreferrer">
        Open source
      </a>
      <a href="https://convex.dev" target="_blank" rel="noreferrer">
        Powered by Convex
      </a>
      <button type="button" onClick={() => setLegalModal("terms")}>
        Terms
      </button>
      <button type="button" onClick={() => setLegalModal("privacy")}>
        Privacy
      </button>
    </footer>
  );

  return (
    <main className="app-shell">
      {activeTab === "prompter" ? (
        <section
          className={[
            "prompter-stage",
            `background-${settings.backgroundMode}`,
            isPrompterDockVisible ? "" : "is-dock-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label="Teleprompter"
        >
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
                      <div className="gear-menu-group" aria-label="Background">
                        <span className="gear-menu-label">Background</span>
                        {BACKGROUND_MODE_OPTIONS.map((option) => (
                          <button
                            className={settings.backgroundMode === option.value ? "gear-menu-item is-active" : "gear-menu-item"}
                            type="button"
                            role="menuitemradio"
                            aria-checked={settings.backgroundMode === option.value}
                            key={option.value}
                            onClick={() => {
                              updateSetting("backgroundMode", option.value);
                              setIsPrompterOptionsOpen(false);
                            }}
                          >
                            <Layout size={16} weight="bold" />
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
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
                        className={isStageMeterVisible ? "gear-menu-item is-active" : "gear-menu-item"}
                        type="button"
                        role="menuitem"
                        onClick={() => setIsStageMeterVisible((current) => !current)}
                      >
                        <Gauge size={16} weight="bold" />
                        <span>{isStageMeterVisible ? "Hide counter" : "Show counter"}</span>
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
              </div>
            </div>

            <div className="script-toolbar" aria-label="Script formatting">
              <div className="toolbar-intro">
                <span>Formatting tools</span>
                <p>Choose how the script appears in Prompter. Whole script changes every line; selected text marks only the words you highlight.</p>
              </div>
              <div className="toolbar-group">
                <span>Whole script color</span>
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
                <span>Selected text tools</span>
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
                    title="Insert a page break at the caret"
                    data-tooltip="Insert page break"
                  >
                    Add Page Break
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
                onPaste={handleScriptPaste}
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
            <div className="script-library" aria-label="Your script library">
              <div>
                <p className="eyebrow">Your library</p>
                <h2>Save and load your scripts.</h2>
                <p className="panel-copy">Saved scripts and folders are private to your GitHub account.</p>
              </div>
              {isAuthenticated ? (
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
                    onClick={() => void saveScriptToLibrary()}
                    disabled={isSavingScript}
                    title="Save this script to your library"
                    data-tooltip="Save script"
                  >
                    <FloppyDisk size={17} weight="bold" />
                    {isSavingScript ? "Saving" : "Save Script"}
                  </button>
                  <button
                    className="save-button has-tooltip"
                    type="button"
                    onClick={() => void saveScriptToLibrary("saveAs")}
                    disabled={isSavingScript}
                    title="Save this draft as a separate script"
                    data-tooltip="Save as a new script"
                  >
                    <Copy size={17} weight="bold" />
                    Save As
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
                    title="Load the selected script"
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
                    title="Delete the selected script"
                    data-tooltip="Delete script"
                  >
                    <Trash size={17} weight="bold" />
                    Delete Script
                  </button>
                </div>
              ) : (
                <div className="login-inline-panel">
                  <p>Log in to save, load, delete, and organize scripts in folders. You can still write, preview, start a new script, and export Markdown without an account.</p>
                  <div className="build-action-row">
                    <button className="save-button" type="button" onClick={exportMarkdown}>
                      <DownloadSimple size={17} weight="bold" />
                      Markdown
                    </button>
                    <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                      <GithubLogo size={17} weight="bold" />
                      Sign in with GitHub
                    </button>
                  </div>
                </div>
              )}
              {libraryMessage ? <p className="library-message">{libraryMessage}</p> : null}
              {deleteMessage ? <p className="library-message">{deleteMessage}</p> : null}
            </div>
            {scriptPendingDeleteId ? (
              <div className="delete-popover" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-copy">
                <div>
                  <p className="eyebrow">Delete script</p>
                  <h2 id="delete-title">Remove from library?</h2>
                  <p id="delete-copy">
                    This deletes "{savedScripts.find((script) => script._id === scriptPendingDeleteId)?.title}" from your library.
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
            {pageFooter}
          </section>
          {tabs}
        </>
      ) : activeTab === "build" ? (
        <>
          <section className="build-view" aria-label="Build workspace">
            <div className="editor-header">
              <div>
                <p className="eyebrow">Build</p>
                <h1>Generate scripts.</h1>
                <p className="panel-copy">Build is for signed-in users. Add source material, choose your AI setup, and create a teleprompter-ready script.</p>
              </div>
              {!isAuthenticated ? (
                <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                  <GithubLogo size={17} weight="bold" />
                  Sign in
                </button>
              ) : null}
            </div>

            <section className="creator-console-panel" aria-label="Script creator console">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">Script creator</p>
                  <h2>Add source. Generate a script.</h2>
                  <p className="panel-copy">Paste a topic, link, doc note, or rough outline. Script generation requires GitHub login plus a saved OpenAI, Claude, or OpenRouter key. URL context also needs Firecrawl in Account.</p>
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
                    placeholder="Product update script"
                  />
                </label>
                <div className="field-control">
                  <span>Build type</span>
                  <div className="readonly-select" aria-label="Build type">
                    Script
                  </div>
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
                <label className="field-control build-textarea-field is-wide" htmlFor="build-source">
                  <span>Prompt, link, doc reference, or notes</span>
                  <textarea
                    id="build-source"
                    value={buildForm.sourceText}
                    onChange={(event) => setBuildForm((current) => ({ ...current, sourceText: event.target.value }))}
                    placeholder="Paste a URL, doc title, topic, outline, or notes for the script"
                  />
                </label>
                <label className="field-control build-textarea-field" htmlFor="build-script">
                  <span>Script draft</span>
                  <textarea
                    id="build-script"
                    value={buildForm.scriptSnapshot}
                    onChange={(event) => setBuildForm((current) => ({ ...current, scriptSnapshot: event.target.value }))}
                    placeholder="Use current Script text, paste a draft, or leave blank until generation"
                  />
                </label>
              </div>
              <div className="build-generator-card" aria-label="Script generator">
                <div>
                  <p className="eyebrow">Script generator</p>
                  <h2>Generate from the source above.</h2>
                  <p className="panel-copy">Requires login and a saved AI provider key. If a URL is present, Firecrawl must be saved in Account settings.</p>
                </div>
                <button
                  className="save-button has-tooltip is-primary-action"
                  type="button"
                  onClick={openAiGenerator}
                  disabled={(isAuthenticated && !buildGeneratorSource.trim()) || isCheckingAiSetup || isGeneratingScript}
                  title={isAuthenticated ? "Generate a script from the Build source" : "Log in to use script generation"}
                  data-tooltip={isAuthenticated ? "Generate script" : "Log in to use"}
                >
                  <Sparkle size={17} weight="bold" />
                  {isCheckingAiSetup ? "Checking" : isAuthenticated ? "Generate Script" : "Log in to use"}
                </button>
              </div>
            </section>
            {aiMessage ? <p className="library-message">{aiMessage}</p> : null}

            <section className="settings-panel build-library-panel" aria-label="Build library">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">Build library</p>
                  <h2>Save generated scripts.</h2>
                  <p className="panel-copy">Sign in with GitHub to save private script drafts and reusable Build items. Active items stay in the workspace; archived items stay out of the way until restored.</p>
                </div>
                <div className="build-summary">
                  <span>{activeBuildCount} active</span>
                  <span>{archivedBuildCount} archived</span>
                </div>
              </div>

              <div className="build-library-controls">
                <label className="field-control build-textarea-field" htmlFor="build-notes">
                  <span>Notes</span>
                  <textarea
                    id="build-notes"
                    value={buildForm.notes}
                    onChange={(event) => setBuildForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Status, next step, setup notes, or approval comments"
                  />
                </label>
              </div>

              <div className="build-action-row">
                <button className="save-button" type="button" onClick={seedBuildFromCurrentScript}>
                  <Article size={17} weight="bold" />
                  Use Current Script
                </button>
                <button className="save-button is-primary-action" type="button" onClick={saveCurrentBuildItem} disabled={isSavingBuildItem}>
                  <FloppyDisk size={17} weight="bold" />
                  {isSavingBuildItem ? "Saving" : editingBuildItemId ? "Update Script Item" : "Save Script Item"}
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
                            <Article size={14} weight="bold" />
                            Script
                          </span>
                          <span className="build-status-chip">{item.status}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.scriptSnapshot || item.sourceText || item.notes || "No script text added yet."}</p>
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
                  <p className="editor-note">No script Build items in this view yet. Generate or save a script to start.</p>
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
            {pageFooter}
          </section>
          {tabs}
        </>
      ) : activeTab === "video" ? (
        <>
          <section className="video-view" aria-label="Video generation">
            <div className="editor-header">
              <div>
                <p className="eyebrow">Video</p>
                <h1 className="video-title-line">
                  Create video jobs.
                  <span className="beta-badge">Beta</span>
                </h1>
                <p className="panel-copy">
                  Start from a prompt, URL, script, or design markdown. Video jobs require GitHub login, one AI provider key, and your HeyGen / HyperFrames key. URLs also need Firecrawl.
                </p>
              </div>
              {!isAuthenticated ? (
                <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                  <GithubLogo size={17} weight="bold" />
                  Sign in
                </button>
              ) : null}
            </div>

            <section className="creator-console-panel video-creator-panel" aria-label="Video creator">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">Video creator</p>
                  <h2>Describe the video. Add sources. Queue the job.</h2>
                  <p className="panel-copy">
                    Keep it simple: add what the video should teach or show, optionally include a URL, paste a script, and choose a Script Voice for the tone.
                  </p>
                </div>
                <div className="build-summary">
                  <span>{videoJobs.length} jobs</span>
                  <span>{videoAiConfigured ? "AI key ready" : "AI key missing"}</span>
                  <span>{heygenConfigured ? "HeyGen ready" : "HeyGen missing"}</span>
                  <span>{firecrawlConfigured ? "Firecrawl ready" : "Firecrawl optional"}</span>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="login-inline-panel">
                  <p>Log in to create video jobs. You can still review the setup guide below before connecting keys and a worker.</p>
                  <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                    <GithubLogo size={17} weight="bold" />
                    Sign in with GitHub
                  </button>
                </div>
              ) : null}

              <div className="video-form-grid">
                <label className="field-control" htmlFor="video-title">
                  <span>Video title</span>
                  <input
                    id="video-title"
                    type="text"
                    value={videoForm.title}
                    onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Convex insights CLI demo"
                  />
                </label>
                <div className="field-control">
                  <span>Source type</span>
                  <CustomSelect
                    ariaLabel="Video source type"
                    value={videoForm.sourceType}
                    options={VIDEO_SOURCE_OPTIONS}
                    onChange={(value) => setVideoForm((current) => ({ ...current, sourceType: value }))}
                  />
                </div>
                <div className="field-control">
                  <span>Script Voice / tone</span>
                  <CustomSelect
                    ariaLabel="Video tone"
                    value={videoForm.voiceProfileId}
                    options={scriptVoiceOptions}
                    onChange={(value) => setVideoForm((current) => ({ ...current, voiceProfileId: value }))}
                  />
                </div>
                <label className="field-control build-textarea-field is-wide" htmlFor="video-prompt">
                  <span>Prompt</span>
                  <textarea
                    id="video-prompt"
                    value={videoForm.prompt}
                    onChange={(event) => setVideoForm((current) => ({ ...current, prompt: event.target.value }))}
                    placeholder="Create a concise browser demo video that explains how to use Convex insights from this source."
                  />
                </label>
                <label className="field-control" htmlFor="video-source-url">
                  <span>URL context</span>
                  <input
                    id="video-source-url"
                    type="url"
                    value={videoForm.sourceUrl}
                    onChange={(event) => setVideoForm((current) => ({ ...current, sourceUrl: event.target.value }))}
                    placeholder="https://docs.convex.dev/cli/reference/insights"
                  />
                </label>
                <div className="field-control">
                  <span>Aspect</span>
                  <CustomSelect
                    ariaLabel="Video aspect ratio"
                    value={videoForm.aspectRatio}
                    options={VIDEO_ASPECT_OPTIONS}
                    onChange={(value) => setVideoForm((current) => ({ ...current, aspectRatio: value }))}
                  />
                </div>
                <label className="field-control" htmlFor="video-duration">
                  <span>Target seconds</span>
                  <input
                    id="video-duration"
                    type="number"
                    min={15}
                    max={900}
                    value={videoForm.durationSeconds}
                    onChange={(event) => setVideoForm((current) => ({ ...current, durationSeconds: Number(event.target.value) || 60 }))}
                  />
                </label>
                <div className="field-control">
                  <span>Quality</span>
                  <CustomSelect
                    ariaLabel="Video quality"
                    value={videoForm.quality}
                    options={VIDEO_QUALITY_OPTIONS}
                    onChange={(value) => setVideoForm((current) => ({ ...current, quality: value }))}
                  />
                </div>
                <label className="field-control build-textarea-field" htmlFor="video-script">
                  <span>Script</span>
                  <textarea
                    id="video-script"
                    value={videoForm.scriptText}
                    onChange={(event) => setVideoForm((current) => ({ ...current, scriptText: event.target.value }))}
                    placeholder="Paste a script, or use the current Script tab text."
                  />
                </label>
                <label className="field-control build-textarea-field" htmlFor="video-design">
                  <span>Design.md or markdown instructions</span>
                  <textarea
                    id="video-design"
                    value={videoForm.designInstructions}
                    onChange={(event) => setVideoForm((current) => ({ ...current, designInstructions: event.target.value }))}
                    placeholder="Paste design.md, brand notes, visual style, motion rules, or scene constraints."
                  />
                </label>
                <label className="field-control" htmlFor="video-design-url">
                  <span>Design URL</span>
                  <input
                    id="video-design-url"
                    type="url"
                    value={videoForm.designUrl}
                    onChange={(event) => setVideoForm((current) => ({ ...current, designUrl: event.target.value }))}
                    placeholder="https://example.com/design.md"
                  />
                </label>
                <label className="field-control" htmlFor="video-design-upload">
                  <span>Upload design.md</span>
                  <input
                    id="video-design-upload"
                    type="file"
                    accept=".md,text/markdown,text/plain"
                    onChange={(event) => void loadVideoDesignFile(event.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="build-action-row">
                <button className="save-button" type="button" onClick={seedVideoFromCurrentScript}>
                  <Article size={17} weight="bold" />
                  Use Current Script
                </button>
                <button className="save-button" type="button" onClick={clearVideoForm}>
                  <Plus size={17} weight="bold" />
                  New Video Job
                </button>
                <button
                  className="save-button is-primary-action"
                  type="button"
                  onClick={createCurrentVideoJob}
                  disabled={isCreatingVideoJob || (!isAuthenticated && authState.isLoading)}
                >
                  <VideoCamera size={17} weight="bold" />
                  {isCreatingVideoJob ? "Queuing" : isAuthenticated ? "Generate Video" : "Log in to use"}
                </button>
              </div>
              {videoMessage ? <p className="library-message">{videoMessage}</p> : null}
            </section>

            <section className="settings-panel video-setup-panel" aria-label="Video setup and instructions">
              <button
                className="video-setup-toggle"
                type="button"
                onClick={() => setIsVideoSetupOpen((current) => !current)}
                aria-expanded={isVideoSetupOpen}
              >
                <span>
                  <span className="eyebrow">Setup and how it works</span>
                  <strong>{isVideoSetupOpen ? "Hide video instructions" : "Show video instructions"}</strong>
                </span>
                <CaretDown size={18} weight="bold" />
              </button>
              {isVideoSetupOpen ? (
                <div className="video-setup-grid">
                  <article>
                    <h3>1. Add keys in Account</h3>
                    <p>Go to Account, then BYOK settings. Save one AI key: OpenAI, Claude, or OpenRouter. That key writes the video plan and composition instructions.</p>
                  </article>
                  <article>
                    <h3>2. Add HeyGen / HyperFrames</h3>
                    <p>Every Video job needs your own HeyGen API key. PromptDeck stores it as encrypted BYOK data and uses it for HyperFrames cloud rendering.</p>
                  </article>
                  <article>
                    <h3>3. Add Firecrawl for URLs</h3>
                    <p>Firecrawl is only required when you add a docs URL, page URL, markdown link, or design URL. Prompt-only and pasted-script jobs do not need Firecrawl.</p>
                  </article>
                  <article>
                    <h3>4. Add source and tone</h3>
                    <p>Use a prompt, URL, script, or design markdown. The Video tab uses your Script Voice Profiles from Account so the video follows your saved tone.</p>
                  </article>
                  <article>
                    <h3>5. Render with HyperFrames</h3>
                    <p>PromptDeck queues the job in Convex. HyperFrames cloud rendering uses the HeyGen key saved by that signed-in user.</p>
                  </article>
                  <article>
                    <h3>6. What Convex stores</h3>
                    <p>PromptDeck saves a private video job under your GitHub account. Raw provider keys stay encrypted in BYOK settings and are never shown back to the browser.</p>
                  </article>
                </div>
              ) : null}
            </section>

            <section className="settings-panel video-jobs-panel" aria-label="Recent video jobs">
              <div className="api-settings-header">
                <div>
                  <p className="eyebrow">Video jobs</p>
                  <h2>Your recent video jobs.</h2>
                  <p className="panel-copy">Jobs are private to your GitHub account. Done jobs can expose an output URL once the renderer reports one.</p>
                </div>
              </div>
              {isAuthenticated ? (
                <div className="video-job-list">
                  {videoJobs.length > 0 ? (
                    videoJobs.map((job) => (
                      <article className="video-job-card" key={job._id}>
                        <div>
                          <div className="build-item-heading">
                            <span className="build-kind-chip">
                              <VideoCamera size={14} weight="bold" />
                              {job.aspectRatio}
                            </span>
                            <span className="build-status-chip">{job.status}</span>
                          </div>
                          <h3>{job.title}</h3>
                          <p>{job.prompt || job.scriptText || job.sourceUrl || "No source text saved."}</p>
                          <div className="build-item-meta">
                            <span>{VIDEO_SOURCE_OPTIONS.find((option) => option.value === job.sourceType)?.label ?? job.sourceType}</span>
                            <span>{job.voiceProfileName ?? "Teleprompter Natural"}</span>
                            <span>Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="video-job-status">
                          <strong>{Math.round(job.progress)}%</strong>
                          <span>{job.message ?? "Waiting for worker."}</span>
                          {job.outputUrl ? (
                            <a href={job.outputUrl} target="_blank" rel="noreferrer">
                              Open output
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="editor-note">No video jobs yet. Add a source above, then generate a video job.</p>
                  )}
                </div>
              ) : (
                <div className="login-inline-panel">
                  <p>Log in to create and see your private video jobs. Signed-out users do not save video jobs in Convex.</p>
                  <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                    <GithubLogo size={17} weight="bold" />
                    Sign in with GitHub
                  </button>
                </div>
              )}
            </section>
            {pageFooter}
          </section>
          {tabs}
        </>
      ) : activeTab === "account" ? (
        <>
          <section className="account-view" aria-label="Account and setup">
            <div className="editor-header">
              <div>
                <p className="eyebrow">Account</p>
                <h1>Your profile and keys.</h1>
                <p className="panel-copy">Saved scripts, Build items, video jobs, custom Script Voice Profiles, and BYOK settings belong to your GitHub account.</p>
              </div>
              {!isAuthenticated ? (
                <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                  <GithubLogo size={17} weight="bold" />
                  Sign in
                </button>
              ) : null}
            </div>
            {isAuthenticated ? (
              <>
                <section className="account-profile-panel" aria-label="Profile">
                  <div className="account-profile-card">
                    {viewer?.image ? (
                      <img src={viewer.image} alt="" className="account-avatar" />
                    ) : (
                      <span className="account-avatar is-empty" aria-hidden="true">
                        <UserCircle size={30} weight="bold" />
                      </span>
                    )}
                    <div>
                      <strong>{viewer?.name ?? "GitHub user"}</strong>
                      <span>{viewer?.email ?? "Email not shared by GitHub"}</span>
                    </div>
                  </div>
                  <div className="account-status-grid" aria-label="Account feature status">
                    <span>
                      <strong>{savedScripts.length}</strong>
                      saved scripts
                    </span>
                    <span>
                      <strong>{buildItems.length}</strong>
                      Build items
                    </span>
                    <span>
                      <strong>{videoJobs.length}</strong>
                      video jobs
                    </span>
                    <span>
                      <strong>{savedScriptVoiceProfiles.length}</strong>
                      custom voices
                    </span>
                    <span>
                      <strong>{activeApiKeyStatuses.filter((key) => key.isConfigured).length}</strong>
                      BYOK keys
                    </span>
                  </div>
                </section>

                <section className="settings-panel ai-prompt-settings-panel" aria-label="Script generator prompt settings">
                  <div className="api-settings-header">
                    <div>
                      <p className="eyebrow">Script generator prompt</p>
                      <h2>Your default AI rules.</h2>
                      <p className="panel-copy">
                        Edit the default rules that guide generated scripts. Script Voice Profiles and one-off style notes still layer on top.
                      </p>
                    </div>
                    <div className="prompt-status-chip">
                      {aiPromptSettings?.hasCustomPrompt ? "Custom prompt active" : "App default active"}
                    </div>
                  </div>
                  <div className="ai-prompt-grid">
                    <label className="field-control ai-prompt-editor" htmlFor="ai-default-prompt">
                      <span>Default prompt</span>
                      <textarea
                        id="ai-default-prompt"
                        value={aiPromptDraft}
                        onChange={(event) => setAiPromptDraft(event.target.value)}
                        placeholder={aiPromptSettings?.defaultPrompt ?? "Loading default prompt..."}
                      />
                    </label>
                    <div className="ai-prompt-side">
                      <label className="field-control" htmlFor="ai-prompt-notes">
                        <span>Notes</span>
                        <textarea
                          id="ai-prompt-notes"
                          className="modal-textarea is-compact"
                          value={aiPromptNotes}
                          onChange={(event) => setAiPromptNotes(event.target.value)}
                          placeholder="Why this prompt works for you."
                        />
                      </label>
                      <label className="field-control" htmlFor="skill-source-url">
                        <span>Skill URL</span>
                        <input
                          id="skill-source-url"
                          type="url"
                          value={skillSourceUrl}
                          onChange={(event) => setSkillSourceUrl(event.target.value)}
                          placeholder="https://github.com/user/repo/blob/main/SKILL.md"
                        />
                      </label>
                      <button className="save-button" type="button" onClick={importSkillGuidance} disabled={isImportingSkill}>
                        <Sparkle size={17} weight="bold" />
                        {isImportingSkill ? "Importing" : "Import Skill"}
                      </button>
                      <p className="editor-note">
                        Skill URL import uses your Firecrawl key. You can also paste skill text below and save without importing.
                      </p>
                    </div>
                    <label className="field-control ai-prompt-editor is-skill" htmlFor="skill-markdown">
                      <span>Imported or pasted skill guidance</span>
                      <textarea
                        id="skill-markdown"
                        value={skillMarkdownDraft}
                        onChange={(event) => setSkillMarkdownDraft(event.target.value)}
                        placeholder="Paste SKILL.md guidance here, or import it from a URL."
                      />
                    </label>
                  </div>
                  <div className="build-action-row">
                    <button className="save-button is-primary-action" type="button" onClick={saveScriptGeneratorPrompt} disabled={isSavingAiPrompt}>
                      <FloppyDisk size={17} weight="bold" />
                      {isSavingAiPrompt ? "Saving" : "Save Prompt"}
                    </button>
                    <button className="save-button" type="button" onClick={copyScriptGeneratorPrompt}>
                      <Copy size={17} weight="bold" />
                      Copy Prompt
                    </button>
                    <button className="save-button" type="button" onClick={resetScriptGeneratorPrompt} disabled={isSavingAiPrompt}>
                      <ArrowCounterClockwise size={17} weight="bold" />
                      Reset Default
                    </button>
                  </div>
                  {aiPromptMessage ? <p className="library-message">{aiPromptMessage}</p> : null}
                </section>

                <section className="settings-panel voice-profile-editor account-voice-panel" aria-label="Script Voice Profile settings">
                  <div className="voice-profile-header">
                    <div>
                      <p className="eyebrow">Script voices</p>
                      <h2>Reusable writing tones.</h2>
                      <p className="panel-copy">
                        Create custom Script Voice Profiles here, then load them from the Generate Script modal dropdown.
                      </p>
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
                  <div className="custom-voice-library" aria-label="Saved custom Script Voice Profiles">
                    <div className="voice-profile-header">
                      <div>
                        <p className="eyebrow">Saved voices</p>
                        <h3>Your custom Script Voice Profiles</h3>
                      </div>
                      <span className="build-status-chip">{savedScriptVoiceProfiles.length} saved</span>
                    </div>
                    {savedScriptVoiceProfiles.length > 0 ? (
                      <div className="custom-voice-list">
                        {savedScriptVoiceProfiles.map((profile) => {
                          const voiceProfile: ScriptVoiceProfile = {
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
                            source: "custom",
                          };

                          return (
                            <article className="custom-voice-card" key={profile._id}>
                              <div>
                                <h4>{profile.name}</h4>
                                <p>{profile.tone}</p>
                                <span>{profile.audience || "No audience set"}</span>
                              </div>
                              <div className="custom-voice-card-actions">
                                <button className="tool-button" type="button" onClick={() => loadScriptVoiceIntoForm(voiceProfile)}>
                                  <PencilSimple size={16} weight="bold" />
                                  Load
                                </button>
                                <button
                                  className="danger-button"
                                  type="button"
                                  onClick={() => deleteCustomScriptVoiceById(profile._id, profile.name)}
                                  disabled={isDeletingScriptVoice}
                                >
                                  <Trash size={16} weight="bold" />
                                  Delete
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="editor-note">No custom voices saved yet. Save one above, then load it here or from the Generate Script modal.</p>
                    )}
                  </div>
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

                <section className="settings-panel account-defaults-panel" aria-label="Default script settings">
                  <div className="api-settings-header">
                    <div>
                      <p className="eyebrow">Default settings</p>
                      <h2>Default script settings</h2>
                      <p className="panel-copy">Save your preferred font, layout, speed, color, background, guide, and fit settings for future scripts.</p>
                    </div>
                    <button
                      className="save-button has-tooltip is-primary-action"
                      type="button"
                      onClick={saveCurrentDefaults}
                      disabled={isSavingDefaults}
                      title="Save current font, color, speed, layout, background, and fit settings as defaults"
                      data-tooltip="Save default settings"
                    >
                      <FloppyDisk size={17} weight="bold" />
                      {isSavingDefaults ? "Saving" : "Save Defaults"}
                    </button>
                  </div>
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
                  </div>
                  {settingsMessage ? <p className="library-message">{settingsMessage}</p> : null}
                </section>

                <div className="api-settings-panel" aria-label="Script generator settings">
                  <div className="api-settings-header">
                    <div>
                      <p className="eyebrow">BYOK settings</p>
                      <h2>Bring your own keys.</h2>
                      <p className="panel-copy">Save provider keys for AI scripts, video authoring, HyperFrames rendering, Firecrawl scraping, and narration voice. Raw keys are encrypted in Convex and never shown again.</p>
                    </div>
                  </div>
                  <div className="byok-requirements" aria-label="Provider setup requirements">
                    {BYOK_REQUIREMENTS.map((item) => {
                      const saved = apiKeyStatus?.keys.find((key) => key.service === item.service);

                      return (
                        <div className={saved?.isConfigured ? "byok-requirement is-configured" : "byok-requirement"} key={item.service}>
                          <div>
                            <strong>{item.label}</strong>
                            <span>{item.required}</span>
                          </div>
                          <p>{item.use}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="api-key-status-list" aria-label="API key status">
                    {activeApiKeyStatuses.map((key) => (
                      <span className={key.isConfigured ? "api-key-chip is-configured" : "api-key-chip"} key={key.service}>
                        {API_KEY_SERVICE_OPTIONS.find((option) => option.value === key.service)?.label ?? key.service}
                        {key.isConfigured ? " saved" : " missing"}
                      </span>
                    ))}
                  </div>
                  <div className="api-key-grid">
                    <div className="field-control">
                      <span>Service</span>
                      <CustomSelect
                        ariaLabel="API key service"
                        value={apiKeyService}
                        options={API_KEY_SERVICE_OPTIONS}
                        placement="up"
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
                      <div className="field-control">
                        <span>{API_KEY_HELP[apiKeyService].modelLabel}</span>
                        <CustomSelect
                          ariaLabel={`${API_KEY_HELP[apiKeyService].modelLabel} model`}
                          value={apiKeyModel}
                          options={apiKeyModelOptions.length ? apiKeyModelOptions : [{ value: "", label: API_KEY_HELP[apiKeyService].modelPlaceholder || "Default model" }]}
                          onChange={setApiKeyModel}
                        />
                        <input
                          id="api-key-model"
                          type="text"
                          value={apiKeyModel}
                          onChange={(event) => setApiKeyModel(event.target.value)}
                          placeholder={API_KEY_HELP[apiKeyService].modelPlaceholder || "Or paste another model ID"}
                        />
                        <p className="field-hint">Optional. Pick a current model or paste another model ID. If blank, PromptDeck uses a safe default for that provider.</p>
                      </div>
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
                            placeholder="https://www.promptdeck.app"
                          />
                        </label>
                        <label className="field-control" htmlFor="api-key-app-name">
                          <span>{API_KEY_HELP[apiKeyService].appLabel}</span>
                          <input
                            id="api-key-app-name"
                            type="text"
                            value={apiKeyAppName}
                            onChange={(event) => setApiKeyAppName(event.target.value)}
                            placeholder="PromptDeck"
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
                  {apiKeyMessage ? <p className="library-message">{apiKeyMessage}</p> : null}
                </div>

                <section className="account-profile-panel account-access-panel" aria-label="Account access">
                  <div>
                    <p className="eyebrow">Account access</p>
                    <h2>Sign out or delete account.</h2>
                  </div>
                  <p className="modal-copy">
                    This account owns your saved scripts, folders, Build items, video jobs, custom Script Voice Profiles, and encrypted BYOK settings.
                  </p>
                  {accountMessage ? <p className="library-message">{accountMessage}</p> : null}
                  {isDeleteAccountConfirmOpen ? (
                    <div className="account-delete-confirm" role="alert" aria-label="Delete account confirmation">
                      <p>Delete this account and its saved PromptDeck data? This removes scripts, folders, Build items, video jobs, custom voices, saved keys, and profile data.</p>
                      <div className="modal-actions">
                        <button className="save-button" type="button" onClick={() => setIsDeleteAccountConfirmOpen(false)} disabled={isDeletingAccount}>
                          Cancel
                        </button>
                        <button className="danger-button" type="button" onClick={deleteSignedInAccount} disabled={isDeletingAccount}>
                          <Trash size={17} weight="bold" />
                          {isDeletingAccount ? "Deleting" : "Delete account"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="modal-actions">
                      <button className="save-button" type="button" onClick={() => void signOutFromAccount()}>
                        <SignOut size={17} weight="bold" />
                        Sign out
                      </button>
                      <button className="danger-button" type="button" onClick={() => setIsDeleteAccountConfirmOpen(true)}>
                        <Trash size={17} weight="bold" />
                        Delete account
                      </button>
                    </div>
                  )}
                </section>
              </>
            ) : (
              <section className="account-profile-panel" aria-label="Signed out account">
                <p className="panel-copy">You can still paste, write, preview, and read scripts without an account. Sign in to save your library, custom voices, and BYOK provider keys.</p>
                <button className="save-button is-primary-action" type="button" onClick={signInWithGitHub}>
                  <GithubLogo size={17} weight="bold" />
                  Sign in with GitHub
                </button>
              </section>
            )}
            {pageFooter}
          </section>
          {tabs}
        </>
      ) : (
        <>
          <section className="settings-view" aria-label="About and app documentation">
            <section className="settings-panel app-docs-panel" aria-label="App documentation">
              <div>
                <p className="eyebrow">App docs</p>
                <h1>How PromptDeck works.</h1>
              </div>
              <p className="about-copy">
                PromptDeck has six main areas: read in Prompter, write in Script, generate in Build, queue video jobs in Video, review docs in About, and manage profile keys and defaults in Account.
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
            <section className="settings-panel about-shortcuts-panel" aria-label="About and keyboard shortcuts">
              <div>
                <p className="eyebrow">About and shortcuts</p>
                <h2>Shortcut-ready prompting.</h2>
              </div>
              <div className="shortcut-list" aria-label="Keyboard shortcuts">
                {SHORTCUTS.map(([keys, action]) => (
                  <div className="shortcut-row" key={keys}>
                    <kbd>{keys}</kbd>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="settings-panel about-panel" aria-label="About">
              <div>
                <p className="eyebrow">About</p>
                <h2>About</h2>
              </div>
              <p className="about-copy">
                PromptDeck is an open source browser teleprompter for writing, organizing, generating, and reading scripts with fewer distractions.
              </p>
              <p className="about-copy">
                Source code:{" "}
                <a href="https://github.com/waynesutton/teleprompter" target="_blank" rel="noreferrer">
                  github.com/waynesutton/teleprompter
                </a>
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
              <div>
                <p className="eyebrow">Stack</p>
                <h2>Stack</h2>
              </div>
              <p className="about-copy">
                PromptDeck is built with Codex and Convex. The app uses React, Vite, TypeScript, Phosphor Icons, Convex Auth, Convex functions,
                Convex database tables, and Convex static hosting.
              </p>
              <p className="about-copy">
                Codex setup reference:{" "}
                <a href="https://docs.convex.dev/ai/using-codex" target="_blank" rel="noreferrer">
                  docs.convex.dev/ai/using-codex
                </a>
              </p>
              <div className="stack-showcase" aria-label="PromptDeck stack and BYOK options">
                <div className="stack-showcase-header">
                  <div>
                    <p className="eyebrow">Stack snapshot</p>
                    <h3>Browser-first scripts, private data, bring-your-own keys.</h3>
                  </div>
                  <span>BYOK ready</span>
                </div>
                <div className="stack-layer-grid">
                  {STACK_SHOWCASE.map((item) => (
                    <article className="stack-layer-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.copy}</p>
                    </article>
                  ))}
                </div>
                <div className="stack-byok-strip" aria-label="Bring your own key options">
                  <span className="stack-byok-label">BYOK</span>
                  {STACK_BYOK_OPTIONS.map(([name, use]) => (
                    <span className="stack-byok-pill" key={name}>
                      <strong>{name}</strong>
                      <small>{use}</small>
                    </span>
                  ))}
                </div>
              </div>
              <div className="about-table-wrap">
                <table className="about-table">
                  <thead>
                    <tr>
                      <th>Layer</th>
                      <th>What PromptDeck uses</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Frontend</td>
                      <td>React 19, Vite 7, TypeScript, Phosphor Icons, Inter, Inter Tight, JetBrains Mono, Lexend, and OpenDyslexic.</td>
                    </tr>
                    <tr>
                      <td>Backend</td>
                      <td>Convex queries, mutations, actions, schema validation, and per-user data ownership.</td>
                    </tr>
                    <tr>
                      <td>Auth</td>
                      <td>Convex Auth with GitHub login for private scripts, Build items, video jobs, defaults, BYOK settings, and custom Script Voice Profiles.</td>
                    </tr>
                    <tr>
                      <td>Convex components</td>
                      <td>Active: <code>@convex-dev/static-hosting</code>.</td>
                    </tr>
                    <tr>
                      <td>AI and media</td>
                      <td>BYOK setup for OpenAI, Claude, OpenRouter, Firecrawl, ElevenLabs, and user-owned HeyGen / HyperFrames video rendering.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            {pageFooter}
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
      {legalModal ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLegalModal(null);
            }
          }}
        >
          <section
            className="shortcut-modal legal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">PromptDeck</p>
                <h2 id="legal-modal-title">{legalModal === "privacy" ? "Privacy Policy" : "Terms of Service"}</h2>
              </div>
              <button
                className="icon-button has-tooltip"
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close legal modal"
                title="Close legal modal"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p className="modal-copy">Last updated: June 14, 2026. PromptDeck is made by waynesutton.ai and hosted at www.promptdeck.app.</p>
            <div className="legal-content">
              {(legalModal === "privacy" ? PRIVACY_SECTIONS : TERMS_SECTIONS).map(([title, copy]) => (
                <section className="legal-section" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </section>
              ))}
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
                <h2 id="new-script-title">Clear this script?</h2>
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
              Starting a new script clears the editor and detaches it from any saved library item. Save first if you want to keep this draft.
            </p>
            <div className="modal-actions">
              <button className="save-button" type="button" onClick={() => setIsNewScriptDialogOpen(false)} disabled={isSavingScript}>
                Cancel
              </button>
              <button className="danger-button" type="button" onClick={startNewScriptWithoutSaving} disabled={isSavingScript}>
                Clear Script
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
              closeAiGenerator();
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
                onClick={closeAiGenerator}
                aria-label="Close script generator"
                title="Close script generator"
                data-tooltip="Close"
                autoFocus
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <p id="ai-generator-copy" className="modal-copy">
              The generated script stays here until you copy it, save it, or send it to Script.
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
                <button
                  className="tool-button voice-manage-button"
                  type="button"
                  onClick={() => {
                    setIsAiGeneratorOpen(false);
                    setActiveTab("account");
                  }}
                >
                  Manage voices in Account
                </button>
              </div>
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
            </div>
            {generatedScriptResult ? (
              <section className="generated-script-review ai-modal-wide" aria-label="Generated script review">
                <div className="voice-profile-header">
                  <div>
                    <p className="eyebrow">Generated script</p>
                    <h3>{generatedScriptResult.model}</h3>
                  </div>
                  <span className="build-status-chip">
                    {generatedScriptResult.usedUrl ? "URL context used" : "Source notes used"}
                  </span>
                </div>
                <pre>{generatedScriptResult.script}</pre>
                <div className="build-action-row">
                  <button className="save-button is-primary-action" type="button" onClick={sendGeneratedScriptToEditor}>
                    <PaperPlaneTilt size={17} weight="bold" />
                    Send to Script
                  </button>
                  <button className="save-button" type="button" onClick={copyGeneratedScript}>
                    <Copy size={17} weight="bold" />
                    Copy
                  </button>
                  <button className="save-button" type="button" onClick={exportGeneratedMarkdown}>
                    <DownloadSimple size={17} weight="bold" />
                    Save Markdown
                  </button>
                </div>
              </section>
            ) : null}
            {aiMessage ? <p className="library-message modal-message">{aiMessage}</p> : null}
            <div className="modal-actions">
              <button className="save-button" type="button" onClick={closeAiGenerator} disabled={isGeneratingScript}>
                {generatedScriptResult ? "Close" : "Cancel"}
              </button>
              <button
                className={generatedScriptResult ? "save-button" : "save-button is-primary-action"}
                type="button"
                onClick={generateScriptFromAi}
                disabled={isGeneratingScript}
              >
                {isGeneratingScript ? <span className="agent-spinner" aria-hidden="true" /> : <Sparkle size={17} weight="bold" />}
                {isGeneratingScript ? "Generating" : generatedScriptResult ? "Regenerate" : hasAiGenerationFailed ? "Try Again" : "Generate"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {isGeneratedScriptCloseConfirmOpen ? (
        <div
          className="modal-scrim"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              keepReviewingGeneratedScript();
            }
          }}
        >
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="generated-close-title"
            aria-describedby="generated-close-copy"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Generated script</p>
                <h2 id="generated-close-title">Close without using this script?</h2>
              </div>
            </div>
            <p id="generated-close-copy" className="modal-copy">
              Send it to Script, copy it, or save it as Markdown before closing if you want to keep this version.
            </p>
            <div className="modal-actions">
              <button className="save-button is-primary-action" type="button" onClick={keepReviewingGeneratedScript}>
                Keep reviewing
              </button>
              <button className="save-button" type="button" onClick={confirmCloseAiGenerator}>
                Close
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
