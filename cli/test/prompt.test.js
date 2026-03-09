/**
 * Tests for prompt.js — promptProviders() and promptGitignore()
 *
 * IMPORTANT: mock.module() must be registered BEFORE any dynamic import of
 * prompt.js. We use top-level await here so the mock is in place before the
 * module is first imported.
 */

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

// ─── Mock @clack/prompts BEFORE importing prompt.js ──────────────────────────

// We need a mutable delegate so individual tests can change the behaviour.
const clackState = {
  multiselectResult: ['claudecode'],
  confirmResult: true,
  isCancelResult: false,
};

await mock.module('@clack/prompts', {
  namedExports: {
    multiselect: async (_opts) => clackState.multiselectResult,
    confirm: async (_opts) => clackState.confirmResult,
    isCancel: (_val) => clackState.isCancelResult,
  },
});

// ─── Import prompt.js AFTER mocks ────────────────────────────────────────────

const { promptProviders, promptGitignore } = await import('../src/prompt.js');

// ─── promptProviders ──────────────────────────────────────────────────────────

describe('promptProviders()', () => {
  it('returns an array of selected provider keys', async () => {
    clackState.multiselectResult = ['claudecode'];
    clackState.isCancelResult = false;

    const result = await promptProviders();
    assert.ok(Array.isArray(result), 'result should be an array');
    assert.deepEqual(result, ['claudecode']);
  });

  it('returns an empty array when user selects nothing', async () => {
    clackState.multiselectResult = [];
    clackState.isCancelResult = false;

    const result = await promptProviders();
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 0);
  });

  it('returns multiple selected keys when user selects several providers', async () => {
    clackState.multiselectResult = ['claudecode', 'codex'];
    clackState.isCancelResult = false;

    const result = await promptProviders();
    assert.deepEqual(result, ['claudecode', 'codex']);
  });

  it('throws USER_CANCEL when isCancel returns true', async () => {
    // The cancel symbol can be any value; what matters is that isCancel returns true.
    const cancelSymbol = Symbol('cancel');
    clackState.multiselectResult = cancelSymbol;
    clackState.isCancelResult = true;

    await assert.rejects(
      () => promptProviders(),
      (err) => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'USER_CANCEL');
        return true;
      }
    );

    // Reset to non-cancel state for subsequent tests
    clackState.multiselectResult = ['claudecode'];
    clackState.isCancelResult = false;
  });
});

// ─── promptGitignore ──────────────────────────────────────────────────────────

describe('promptGitignore()', () => {
  it('returns true when user confirms', async () => {
    clackState.confirmResult = true;
    clackState.isCancelResult = false;

    const result = await promptGitignore();
    assert.equal(typeof result, 'boolean');
    assert.equal(result, true);
  });

  it('returns false when user declines', async () => {
    clackState.confirmResult = false;
    clackState.isCancelResult = false;

    const result = await promptGitignore();
    assert.equal(typeof result, 'boolean');
    assert.equal(result, false);
  });

  it('throws USER_CANCEL when isCancel returns true', async () => {
    const cancelSymbol = Symbol('cancel');
    clackState.confirmResult = cancelSymbol;
    clackState.isCancelResult = true;

    await assert.rejects(
      () => promptGitignore(),
      (err) => {
        assert.ok(err instanceof Error);
        assert.equal(err.message, 'USER_CANCEL');
        return true;
      }
    );

    // Reset to non-cancel state for subsequent tests
    clackState.confirmResult = true;
    clackState.isCancelResult = false;
  });
});
