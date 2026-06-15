type GenerationLength = "short" | "long" | "open";

type ScriptVoiceProfile = {
  name: string;
  audience: string;
  tone: string;
  pacing: string;
  bannedWords: string;
  preferredPhrases: string;
  examples: string;
  structure: string;
  defaultLength: GenerationLength;
};

export const MAX_SKILL_CONTEXT_CHARS = 8000;

export const DEFAULT_SCRIPT_SYSTEM_PROMPT = `You write teleprompter scripts for one specific viewer.

Rules:
- Solve one clear problem for that viewer.
- Use spoken, camera-ready language.
- Keep sentences easy to read out loud.
- Avoid hype and AI-style phrasing.
- Do not use these words: delve, intricate, pivotal, comprehensive, multifaceted, facilitate, encompass, underscore, testament, notably, crucial, realm, landscape, moreover, furthermore, additionally, specifically, importantly, consequently, therefore, thus, myriad, plethora, nuanced, holistic, leverage, synergy, seamless, empower, innovative, transformative, robust, dynamic, cutting-edge, next-gen, revolutionary, breakthrough, game changer, supercharge, unlock, groundbreaking, AI-powered.
- Output only the script body.
- Do not wrap the script in code fences.
- Use --- page breaks when helpful.
- Use short bracketed direction notes sparingly, like [pause].`;

export const trimSkillContext = (value: string) => {
  const trimmed = value.trim();

  if (trimmed.length <= MAX_SKILL_CONTEXT_CHARS) {
    return trimmed;
  }

  return `${trimmed.slice(0, MAX_SKILL_CONTEXT_CHARS)}\n\n[Skill context truncated for length]`;
};

export const getLengthInstruction = (length: GenerationLength) => {
  if (length === "short") {
    return "Target roughly 180 to 390 words for a 1 to 3 minute spoken script.";
  }

  if (length === "long") {
    return "Target roughly 650 to 850 words for a 5 minute or longer spoken script.";
  }

  return "Choose the right length for the source and topic. Do not pad.";
};

export const getScriptVoicePrompt = (profile: ScriptVoiceProfile | undefined) => {
  if (!profile) {
    return "Script voice: Teleprompter Natural. Use a clear, direct, human voice.";
  }

  return `Script voice: ${profile.name}
Audience: ${profile.audience || "One specific viewer who needs a useful spoken script."}
Tone: ${profile.tone || "Clear, direct, human, and teleprompter-friendly."}
Pacing: ${profile.pacing || "Short spoken sentences with natural transitions."}
Banned words or phrases: ${profile.bannedWords || "No extra banned words beyond the global list."}
Preferred phrases or moves: ${profile.preferredPhrases || "Use plain phrasing and specific examples."}
Example source or imported notes: ${profile.examples || "No examples provided."}
Script structure: ${profile.structure || "Open with a useful hook, explain the point, then close cleanly."}`;
};

export const buildScriptGeneratorSystemPrompt = ({
  basePrompt,
  instructions,
  length,
  profile,
  skillMarkdown,
}: {
  basePrompt?: string;
  instructions: string;
  length: GenerationLength;
  profile: ScriptVoiceProfile | undefined;
  skillMarkdown?: string;
}) => `${basePrompt?.trim() || DEFAULT_SCRIPT_SYSTEM_PROMPT}

Length:
${getLengthInstruction(length)}

${getScriptVoicePrompt(profile)}

${skillMarkdown?.trim() ? `Imported skill guidance:\n${trimSkillContext(skillMarkdown)}` : "Imported skill guidance: None."}

User style notes:
${instructions.trim() || "Use a clear, direct, human voice."}`;
