import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import {
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
  List,
  Microphone,
  Pause,
  PencilSimple,
  Play,
  Plus,
  Question,
  SlidersHorizontal,
  Sparkle,
  SquareHalfBottom,
  TextAlignCenter,
  Trash,
  X,
} from "@phosphor-icons/react";
import { api } from "../convex/_generated/api";

type PromptTab = "prompter" | "script" | "help";
type TextColor = "white" | "red" | "yellow" | "grey" | "darkgrey";
type PromptFont = "system" | "graphite" | "lexend" | "opendyslexic";
type LayoutMode = "left" | "centered";
type AiProvider = "auto" | "openai" | "claude" | "openrouter";
type AiLength = "short" | "long" | "open";
type SelectOption<Value extends string> = { value: Value; label: string };

type AiProviderStatus = {
  providers: Array<{ provider: Exclude<AiProvider, "auto">; label: string; model: string }>;
  hasFirecrawl: boolean;
};

type VoiceStatus = {
  isConfigured: boolean;
  provider: string;
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
const ABOUT_FEATURES = [
  ["Live prompting", "Run a clean browser teleprompter with paging, scroll speed, and fit controls."],
  ["Script editor", "Write, preview, format, save, load, export, and organize scripts."],
  ["Presentation defaults", "Save preferred font, color, layout, guide, and speed settings."],
  ["Keyboard control", "Use shortcuts for playback, tabs, pages, sizing, speed, help, and undo."],
  ["Optional tools", "AI script generation and voice controls appear when the site owner configures them."],
  ["Open source", "The project is open source at github.com/waynesutton/teleprompter."],
] as const;

const SHORTCUTS = [
  ["Space", "Start or pause"],
  ["S or Escape", "Stop and return to the top"],
  ["Command/Ctrl + ?", "Open keyboard shortcuts"],
  ["Command/Ctrl + 1", "Open Tab 1 Prompter"],
  ["Command/Ctrl + 2", "Open Tab 2 Script"],
  ["Command/Ctrl + 3", "Open Tab 3 Help"],
  ["Command/Ctrl + Z", "Undo the last script tool change on Tab 2"],
  ["B", "Show or hide the Tab 1 control bar"],
  ["R", "Reset scroll"],
  ["+ / =", "Increase text size"],
  ["-", "Decrease text size"],
  ["]", "Increase speed"],
  ["[", "Decrease speed"],
  ["PageDown or Right Arrow", "Next page"],
  ["PageUp or Left Arrow", "Previous page"],
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

const getFirstUrl = (input: string) => {
  const markdownUrl = input.match(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/i)?.[1];
  const plainUrl = input.match(/https?:\/\/[^\s)]+/i)?.[0];
  return (markdownUrl ?? plainUrl ?? "").replace(/[.,;!?]+$/, "");
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
  const savedPrompt = useQuery(api.teleprompter.getCurrent);
  const savedDefaultSettings = useQuery(api.teleprompter.getDefaultSettings);
  const savedScriptsQuery = useQuery(api.teleprompter.listSavedScripts);
  const getAiProviderStatus = useAction(api.aiScripts.getAiProviderStatus);
  const generateAiScript = useAction(api.aiScripts.generateScript);
  const getVoiceStatus = useAction(api.voice.getVoiceStatus);
  const saveSharedScript = useMutation(api.teleprompter.saveSharedScript);
  const saveDefaultSettings = useMutation(api.teleprompter.saveDefaultSettings);
  const deleteSharedScript = useMutation(api.teleprompter.deleteSharedScript);
  const [activeTab, setActiveTab] = useState<PromptTab>("prompter");
  const [draft, setDraft] = useState(DEFAULT_SCRIPT);
  const [draftUndoStack, setDraftUndoStack] = useState<string[]>([]);
  const [settings, setSettings] = useState<PromptSettings>(DEFAULT_SETTINGS);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isStageMeterVisible, setIsStageMeterVisible] = useState(true);
  const [isPrompterDockVisible, setIsPrompterDockVisible] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
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
  const [isNewScriptDialogOpen, setIsNewScriptDialogOpen] = useState(false);
  const [isScriptPreviewOpen, setIsScriptPreviewOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isAiSetupModalOpen, setIsAiSetupModalOpen] = useState(false);
  const [isCheckingAiSetup, setIsCheckingAiSetup] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [aiProviderStatus, setAiProviderStatus] = useState<AiProviderStatus | null>(null);
  const [aiProvider, setAiProvider] = useState<AiProvider>("auto");
  const [aiLength, setAiLength] = useState<AiLength>("short");
  const [aiModelOverride, setAiModelOverride] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiSetupMessage, setAiSetupMessage] = useState("These options are not setup. Contact the app creator to config.");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCheckingVoiceStatus, setIsCheckingVoiceStatus] = useState(false);
  const [isVoiceModeRequested, setIsVoiceModeRequested] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameAtRef = useRef<number | null>(null);
  const savedScripts = useMemo(() => savedScriptsQuery ?? [], [savedScriptsQuery]);
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
  const effectiveSpeed = settings.speed * settings.speedMultiplier;

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
    setSettings((current) => ({ ...current, scroll: 0 }));
  }, []);

  const goToPage = useCallback((pageIndex: number) => {
    setIsRunning(false);
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
    setSettings((current) => ({
      ...current,
      speed: clamp(current.speed + delta, 8, 160),
    }));
  }, []);

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
    if (!isRunning) {
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
  }, [isRunning, effectiveSpeed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcutHelpCombo = (event.metaKey || event.ctrlKey) && (event.key === "?" || (event.key === "/" && event.shiftKey));

      if (isShortcutHelpCombo) {
        event.preventDefault();
        setIsShortcutsModalOpen(true);
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
          "3": "help",
        };
        const nextTab = tabShortcuts[event.key];

        if (nextTab) {
          event.preventDefault();
          setActiveTab(nextTab);
          return;
        }

        if (event.key.toLowerCase() === "z" && activeTab === "script" && draftUndoStack.length > 0) {
          event.preventDefault();
          undoScriptDraftChange();
          return;
        }
      }

      if (event.target instanceof HTMLElement && ["TEXTAREA", "INPUT", "SELECT"].includes(event.target.tagName)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setIsRunning((current) => !current);
      }

      if (event.key === "Escape" || event.key.toLowerCase() === "s") {
        event.preventDefault();
        resetScroll();
      }

      if (event.key.toLowerCase() === "r") {
        resetScroll();
      }

      if (event.key.toLowerCase() === "b") {
        setIsPrompterDockVisible((current) => !current);
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeFontSize(4);
      }

      if (event.key === "-") {
        event.preventDefault();
        changeFontSize(-4);
      }

      if (event.key === "]") {
        event.preventDefault();
        changeSpeed(6);
      }

      if (event.key === "[") {
        event.preventDefault();
        changeSpeed(-6);
      }

      if (event.key === "PageDown" || event.key === "ArrowRight") {
        event.preventDefault();
        goToNextPage();
      }

      if (event.key === "PageUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    changeFontSize,
    changeSpeed,
    activeTab,
    draftUndoStack.length,
    goToNextPage,
    goToPreviousPage,
    isAiGeneratorOpen,
    isAiSetupModalOpen,
    isNewScriptDialogOpen,
    isShortcutsModalOpen,
    isVoiceModalOpen,
    resetScroll,
    undoScriptDraftChange,
  ]);

  const estimatedReadTime = useMemo(() => {
    const wordCount = currentScript.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 130));
    return `${minutes} min`;
  }, [currentScript]);

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
        setAiSetupMessage("These options are not setup. Contact the app creator to config.");
        setIsAiSetupModalOpen(true);
        return;
      }

      setIsAiGeneratorOpen(true);
    } finally {
      setIsCheckingAiSetup(false);
    }
  };

  const openVoiceModal = async () => {
    setIsCheckingVoiceStatus(true);

    try {
      const status = await getVoiceStatus();
      setVoiceStatus(status as VoiceStatus);
      setIsVoiceModalOpen(true);
    } finally {
      setIsCheckingVoiceStatus(false);
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
        length: aiLength,
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

  const loadSelectedScript = () => {
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
          <span>Tab 1 Prompter</span>
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
          <span>Tab 2 Script</span>
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
          <span>Tab 3 Help</span>
        </button>
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
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {currentScript.split("\n").map((line, index) => (
              <p key={`${currentPageIndex}-${index}`} className={line.trim().startsWith("[") ? "direction-line" : undefined}>
                {line ? renderInlineFormatting(line) : "\u00a0"}
              </p>
            ))}
          </div>

          {isPrompterDockVisible ? (
            <div className="prompter-bottom-stack">
              {isStageMeterVisible ? (
              <div className="stage-meter" aria-label="Prompter progress">
                <span>{estimatedReadTime}</span>
                <span>
                  Page {currentPageIndex + 1}/{pages.length}
                </span>
                <span>{Math.round(settings.scroll)}%</span>
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
                  onClick={() => setIsRunning((current) => !current)}
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
                <span>Scroll</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.scroll}
                  aria-label="Scroll position"
                  onChange={(event) => updateSetting("scroll", Number(event.target.value))}
                />
              </label>
              <div className="control-cluster view-cluster" aria-label="View controls">
                <button
                  className={settings.fitToWindow ? "icon-button has-tooltip is-active" : "icon-button has-tooltip"}
                  type="button"
                  aria-pressed={settings.fitToWindow}
                  title="Fit text to the window"
                  data-tooltip="Fit"
                  aria-label="Fit text to the window"
                  onClick={() => {
                    if (settings.fitToWindow) {
                      updateSetting("fitToWindow", false);
                      return;
                    }

                    fitTextToWindow();
                  }}
                >
                  <CornersOut size={16} weight="bold" />
                </button>
                <button
                  className={settings.layoutMode === "centered" ? "icon-button has-tooltip is-active" : "icon-button has-tooltip"}
                  type="button"
                  aria-pressed={settings.layoutMode === "centered"}
                  title="Center the text block while keeping text left aligned"
                  data-tooltip="Center"
                  aria-label="Center text block"
                  onClick={() => updateSetting("layoutMode", settings.layoutMode === "centered" ? "left" : "centered")}
                >
                  <TextAlignCenter size={16} weight="bold" />
                </button>
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
              <label className="range-control compact has-tooltip" title="Change base scroll speed" data-tooltip="Base speed">
                <span>Speed</span>
                <input
                  type="range"
                  min="8"
                  max="160"
                  value={settings.speed}
                  aria-label="Base speed"
                  onChange={(event) => updateSetting("speed", Number(event.target.value))}
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
                  className={settings.mirrored ? "icon-button has-tooltip is-active" : "icon-button has-tooltip"}
                  type="button"
                  onClick={() => updateSetting("mirrored", !settings.mirrored)}
                  aria-pressed={settings.mirrored}
                  aria-label="Mirror text"
                  title="Mirror text"
                  data-tooltip="Mirror"
                >
                  <FlipHorizontal size={17} weight="bold" />
                </button>
                <button
                  className={settings.guide ? "icon-button has-tooltip is-active" : "icon-button has-tooltip"}
                  type="button"
                  onClick={() => updateSetting("guide", !settings.guide)}
                  aria-pressed={settings.guide}
                  aria-label="Toggle reading guide"
                  title="Toggle reading guide"
                  data-tooltip="Guide"
                >
                  <SlidersHorizontal size={17} weight="bold" />
                </button>
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
              </div>
              <button
                className="icon-button help-dock-button has-tooltip"
                type="button"
                onClick={() => setIsShortcutsModalOpen(true)}
                aria-label="Open keyboard shortcuts"
                title="Open keyboard shortcuts"
                data-tooltip="Shortcuts"
              >
                <Question size={17} weight="bold" />
              </button>
              </div>
            </div>
          ) : null}
          <button
            className={isPrompterDockVisible ? "dock-toggle-button has-tooltip" : "dock-toggle-button has-tooltip is-hidden-state"}
            type="button"
            onClick={() => setIsPrompterDockVisible((current) => !current)}
            aria-pressed={!isPrompterDockVisible}
            aria-label={isPrompterDockVisible ? "Hide Tab 1 control bar" : "Show Tab 1 control bar"}
            title={isPrompterDockVisible ? "Hide Tab 1 control bar" : "Show Tab 1 control bar"}
            data-tooltip={isPrompterDockVisible ? "Hide bar" : "Show bar"}
          >
            <SquareHalfBottom size={18} weight="bold" />
          </button>
          {isPrompterDockVisible ? tabs : null}
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
            <div className="ai-generate-panel" aria-label="AI script generator">
              <div>
                <p className="eyebrow">Script generator</p>
                <h2>Turn a topic, notes, URL, or markdown link into a prompt-ready script.</h2>
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
            {aiMessage ? <p className="library-message">{aiMessage}</p> : null}
            <p className="editor-note">Use `---` on its own line to create pages. Selected color uses safe markdown-compatible span tags.</p>
            <div className="script-library" aria-label="Shared script library">
              <div>
                <p className="eyebrow">Shared library</p>
                <h2>Save and load scripts for all users.</h2>
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
      ) : (
        <>
          <section className="settings-view" aria-label="Help and settings">
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
                ? "Voice control is ready. It stays off until you turn it on for this session."
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
