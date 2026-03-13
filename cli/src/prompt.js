import fs from 'node:fs';
import path from 'node:path';
import { multiselect, confirm, select, isCancel, log } from '@clack/prompts';
import { PROVIDERS } from './providers.js';

/**
 * Show interactive multi-select for AI providers.
 * Auto-detects providers whose config folders exist in cwd and pre-selects them.
 * Detected providers are listed first; the rest follow alphabetically.
 * Returns the selected provider keys.
 * Throws with message 'USER_CANCEL' if user cancels.
 * @param {string} cwd  project root
 * @returns {Promise<string[]>}
 */
export async function promptProviders(cwd) {
  const detected = Object.entries(PROVIDERS)
    .filter(([, p]) => fs.existsSync(path.join(cwd, p.folder)))
    .map(([key]) => key);

  const detectedSet = new Set(detected);
  const total = Object.keys(PROVIDERS).length;

  if (detected.length > 0) {
    log.info(`Auto-detected ${detected.length} provider(s) in this directory (pre-selected).`);
  }
  log.info(`${total} providers available — use ↑↓ to scroll, space to select, 'a' to toggle all.`);

  // Detected providers first, then the rest sorted alphabetically by label
  const detectedEntries = Object.entries(PROVIDERS).filter(([key]) => detectedSet.has(key));
  const otherEntries = Object.entries(PROVIDERS)
    .filter(([key]) => !detectedSet.has(key))
    .sort(([, a], [, b]) => a.label.localeCompare(b.label));

  const options = [...detectedEntries, ...otherEntries].map(([value, { label, hint }]) => ({
    value,
    label: detectedSet.has(value) ? `${label} ✓` : label,
    hint,
  }));

  const selected = await multiselect({
    message: 'Select AI providers to install',
    options,
    initialValues: detected,
    required: false,
  });

  if (isCancel(selected)) {
    throw new Error('USER_CANCEL');
  }

  return selected;
}

/**
 * Show interactive version selector with latest pre-selected.
 * Returns the selected tag string.
 * Throws with message 'USER_CANCEL' if user cancels.
 * @param {Array<{tag_name: string, name: string}>} releases  ordered latest-first
 * @returns {Promise<string>}
 */
export async function promptVersion(releases) {
  const options = releases.map((r, i) => ({
    value: r.tag_name,
    label: i === 0 ? `${r.tag_name} (latest)` : r.tag_name,
    hint: r.name || undefined,
  }));

  const selected = await select({
    message: 'Select version to install',
    options,
  });

  if (isCancel(selected)) {
    throw new Error('USER_CANCEL');
  }

  return selected;
}

/**
 * Ask user whether to add installed directories to .gitignore.
 * Returns boolean. Defaults to true (opt-out model).
 * Throws with message 'USER_CANCEL' if user cancels.
 * @returns {Promise<boolean>}
 */
export async function promptGitignore() {
  const result = await confirm({
    message: 'Add installed directories to .gitignore?',
    initialValue: true,
  });

  if (isCancel(result)) {
    throw new Error('USER_CANCEL');
  }

  return result;
}
