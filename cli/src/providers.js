/**
 * Map of AI provider keys to their source (inside zip) and destination paths.
 * Source is relative to the extracted zip root (e.g. indexed-skill-spec-main/skills/).
 * Destination is relative to the user's project root (cwd).
 * Folder is the provider's config directory (used for auto-detection).
 */
export const PROVIDERS = {
  claudecode: {
    label: 'Claude Code',
    hint: '.claude/skills/',
    src: 'skills',
    dest: '.claude/skills',
    folder: '.claude/',
  },
  gemini: {
    label: 'Gemini CLI',
    hint: '.gemini/skills/',
    src: 'skills',
    dest: '.gemini/skills',
    folder: '.gemini/',
  },
  copilot: {
    label: 'GitHub Copilot',
    hint: '.github/skills/',
    src: 'skills',
    dest: '.github/skills',
    folder: '.github/',
  },
  cursor: {
    label: 'Cursor',
    hint: '.cursor/skills/',
    src: 'skills',
    dest: '.cursor/skills',
    folder: '.cursor/',
  },
  qwen: {
    label: 'Qwen',
    hint: '.qwen/skills/',
    src: 'skills',
    dest: '.qwen/skills',
    folder: '.qwen/',
  },
  opencode: {
    label: 'OpenCode',
    hint: '.opencode/skills/',
    src: 'skills',
    dest: '.opencode/skills',
    folder: '.opencode/',
  },
  codex: {
    label: 'Codex (OpenAI)',
    hint: '.codex/skills/',
    src: 'skills',
    dest: '.codex/skills',
    folder: '.codex/',
  },
  windsurf: {
    label: 'Windsurf',
    hint: '.windsurf/skills/',
    src: 'skills',
    dest: '.windsurf/skills',
    folder: '.windsurf/',
  },
  kilocode: {
    label: 'Kilocode',
    hint: '.kilocode/skills/',
    src: 'skills',
    dest: '.kilocode/skills',
    folder: '.kilocode/',
  },
  auggie: {
    label: 'Augment (Auggie)',
    hint: '.augment/skills/',
    src: 'skills',
    dest: '.augment/skills',
    folder: '.augment/',
  },
  codebuddy: {
    label: 'CodeBuddy',
    hint: '.codebuddy/skills/',
    src: 'skills',
    dest: '.codebuddy/skills',
    folder: '.codebuddy/',
  },
  qodercli: {
    label: 'Qoder CLI',
    hint: '.qoder/skills/',
    src: 'skills',
    dest: '.qoder/skills',
    folder: '.qoder/',
  },
  roo: {
    label: 'Roo Code',
    hint: '.roo/skills/',
    src: 'skills',
    dest: '.roo/skills',
    folder: '.roo/',
  },
  kiro: {
    label: 'Kiro',
    hint: '.kiro/skills/',
    src: 'skills',
    dest: '.kiro/skills',
    folder: '.kiro/',
  },
  amp: {
    label: 'Amp',
    hint: '.agents/skills/',
    src: 'skills',
    dest: '.agents/skills',
    folder: '.agents/',
  },
  shai: {
    label: 'Shai',
    hint: '.shai/skills/',
    src: 'skills',
    dest: '.shai/skills',
    folder: '.shai/',
  },
  antigravity: {
    label: 'Antigravity (Google)',
    hint: '.agent/skills/',
    src: 'skills',
    dest: '.agent/skills',
    folder: '.agent/',
  },
  bob: {
    label: 'Bob',
    hint: '.bob/skills/',
    src: 'skills',
    dest: '.bob/skills',
    folder: '.bob/',
  },
};

/**
 * Alias map — common shorthand keys resolved to canonical PROVIDERS keys.
 */
export const ALIASES = {
  agy: 'antigravity',
  'kiro-cli': 'kiro',
};

/**
 * Resolve selected provider keys to provider objects.
 * Resolves aliases before looking up in PROVIDERS.
 * @param {string[]} keys
 * @returns {{ key: string, label: string, hint: string, src: string, dest: string, folder: string }[]}
 */
export function resolveSelected(keys) {
  return keys.map((key) => {
    const resolved = ALIASES[key] ?? key;
    const provider = PROVIDERS[resolved];
    if (!provider) {
      throw new Error(`Unknown provider key: "${resolved}"`);
    }
    return { key: resolved, ...provider };
  });
}
