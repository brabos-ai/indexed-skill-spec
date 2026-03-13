/**
 * Tests for prompt.js — promptProviders(cwd) and promptGitignore()
 *
 * IMPORTANT: mock.module() must be registered BEFORE any dynamic import of
 * prompt.js. We use top-level await here so the mock is in place before the
 * module is first imported.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { mock } from 'node:test';

// ─── Shared test directory ────────────────────────────────────────────────────

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-prompt-'));

// ─── Mock @clack/prompts BEFORE importing prompt.js ──────────────────────────

// We need a mutable delegate so individual tests can change the behaviour.
// capturedOpts captures what multiselect receives (for inspecting initialValues).
const clackState = {
  multiselectResult: ['claudecode'],
  confirmResult: true,
  isCancelResult: false,
};

let capturedMultiselectOpts = null;

await mock.module('@clack/prompts', {
  namedExports: {
    multiselect: async (opts) => {
      capturedMultiselectOpts = opts;
      return clackState.multiselectResult;
    },
    confirm: async (_opts) => clackState.confirmResult,
    isCancel: (_val) => clackState.isCancelResult,
    log: {
      info: (_msg) => {},
      warn: (_msg) => {},
      error: (_msg) => {},
      success: (_msg) => {},
    },
  },
});

// ─── Import prompt.js AFTER mocks ────────────────────────────────────────────

const { promptProviders, promptGitignore } = await import('../src/prompt.js');

// ─── promptProviders ──────────────────────────────────────────────────────────

describe('promptProviders()', () => {
  it('returns an array of selected provider keys', async () => {
    clackState.multiselectResult = ['claudecode'];
    clackState.isCancelResult = false;

    const result = await promptProviders(tmpDir);
    assert.ok(Array.isArray(result), 'result should be an array');
    assert.deepEqual(result, ['claudecode']);
  });

  it('returns an empty array when user selects nothing', async () => {
    clackState.multiselectResult = [];
    clackState.isCancelResult = false;

    const result = await promptProviders(tmpDir);
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 0);
  });

  it('returns multiple selected keys when user selects several providers', async () => {
    clackState.multiselectResult = ['claudecode', 'codex'];
    clackState.isCancelResult = false;

    const result = await promptProviders(tmpDir);
    assert.deepEqual(result, ['claudecode', 'codex']);
  });

  it('throws USER_CANCEL when isCancel returns true', async () => {
    const cancelSymbol = Symbol('cancel');
    clackState.multiselectResult = cancelSymbol;
    clackState.isCancelResult = true;

    await assert.rejects(
      () => promptProviders(tmpDir),
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

  it('passes empty initialValues when no provider folders exist in cwd', async () => {
    const emptyDir = fs.mkdtempSync(path.join(tmpDir, 'empty-'));
    clackState.multiselectResult = [];
    clackState.isCancelResult = false;

    await promptProviders(emptyDir);

    assert.ok(Array.isArray(capturedMultiselectOpts?.initialValues), 'initialValues should be an array');
    assert.equal(capturedMultiselectOpts.initialValues.length, 0, 'no pre-selections when no folders exist');
  });

  it('pre-selects provider whose config folder exists in cwd', async () => {
    const detectionDir = fs.mkdtempSync(path.join(tmpDir, 'detect-'));
    fs.mkdirSync(path.join(detectionDir, '.claude'));

    clackState.multiselectResult = ['claudecode'];
    clackState.isCancelResult = false;

    await promptProviders(detectionDir);

    assert.ok(Array.isArray(capturedMultiselectOpts?.initialValues), 'initialValues should be an array');
    assert.ok(
      capturedMultiselectOpts.initialValues.includes('claudecode'),
      'claudecode should be pre-selected when .claude/ folder exists'
    );
  });

  it('pre-selects multiple providers when multiple folders exist', async () => {
    const multiDir = fs.mkdtempSync(path.join(tmpDir, 'multi-'));
    fs.mkdirSync(path.join(multiDir, '.claude'));
    fs.mkdirSync(path.join(multiDir, '.gemini'));

    clackState.multiselectResult = ['claudecode', 'gemini'];
    clackState.isCancelResult = false;

    await promptProviders(multiDir);

    assert.ok(capturedMultiselectOpts.initialValues.includes('claudecode'), 'claudecode pre-selected');
    assert.ok(capturedMultiselectOpts.initialValues.includes('gemini'), 'gemini pre-selected');
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
