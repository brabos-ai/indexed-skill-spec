import { multiselect, confirm, isCancel } from '@clack/prompts';
import { PROVIDERS } from './providers.js';

/**
 * Show interactive multi-select for AI providers.
 * Returns the selected provider keys.
 * No providers pre-selected (no initialValues).
 * Throws with message 'USER_CANCEL' if user cancels.
 * @returns {Promise<string[]>}
 */
export async function promptProviders() {
  const options = Object.entries(PROVIDERS).map(([value, { label, hint }]) => ({
    value,
    label,
    hint,
  }));

  const selected = await multiselect({
    message: 'Select AI providers to install',
    options,
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
