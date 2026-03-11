import fs from 'node:fs';
import path from 'node:path';
import { multiselect, confirm, isCancel } from '@clack/prompts';
import { PROVIDERS } from './providers.js';

/**
 * Show interactive multi-select for AI providers.
 * Auto-detects providers whose config folders exist in cwd and pre-selects them.
 * Returns the selected provider keys.
 * Throws with message 'USER_CANCEL' if user cancels.
 * @param {string} cwd  project root
 * @returns {Promise<string[]>}
 */
export async function promptProviders(cwd) {
  const detected = Object.entries(PROVIDERS)
    .filter(([, p]) => fs.existsSync(path.join(cwd, p.folder)))
    .map(([key]) => key);

  const options = Object.entries(PROVIDERS).map(([value, { label, hint }]) => ({
    value,
    label,
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
