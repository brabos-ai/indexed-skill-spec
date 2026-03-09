/**
 * Map of AI provider keys to their source (inside zip) and destination paths.
 * Source is relative to the extracted zip root (e.g. indexed-skill-spec-main/skills/).
 * Destination is relative to the user's project root (cwd).
 */
export const PROVIDERS = {
  claudecode: {
    label: 'Claude Code',
    hint: '.claude/skills/',
    src: 'skills',
    dest: '.claude/skills',
  },
  codex: {
    label: 'Codex (OpenAI)',
    hint: '.agent/skills/',
    src: 'skills',
    dest: '.agent/skills',
  },
  antigravity: {
    label: 'Google Antigravity',
    hint: '.agents/skills/',
    src: 'skills',
    dest: '.agents/skills',
  },
  opencode: {
    label: 'OpenCode',
    hint: '.opencode/skills/',
    src: 'skills',
    dest: '.opencode/skills',
  },
};

/**
 * Resolve selected provider keys to provider objects.
 * @param {string[]} keys
 * @returns {{ key: string, label: string, hint: string, src: string, dest: string }[]}
 */
export function resolveSelected(keys) {
  return keys.map((key) => ({ key, ...PROVIDERS[key] }));
}
