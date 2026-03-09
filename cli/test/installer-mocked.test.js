/**
 * Tests for installer.js install() and update() flows.
 *
 * IMPORTANT: mock.module() must be registered BEFORE any dynamic import of
 * installer.js. We use top-level await here so all mocks are in place before
 * the module is first imported.
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import AdmZip from 'adm-zip';

// ─── Mock @clack/prompts to avoid terminal I/O ────────────────────────────────

await mock.module('@clack/prompts', {
  namedExports: {
    intro: () => {},
    outro: () => {},
    spinner: () => ({ start: () => {}, stop: () => {} }),
    log: { warn: () => {}, success: () => {}, error: () => {} },
    isCancel: () => false,
  },
});

// ─── Controllable fake for prompt.js ─────────────────────────────────────────

const promptState = { providers: ['claudecode'], gitignore: false };

await mock.module('../src/prompt.js', {
  namedExports: {
    promptProviders: async () => promptState.providers,
    promptGitignore: async () => promptState.gitignore,
  },
});

// ─── Controllable fake for github.js ─────────────────────────────────────────

const githubState = { buffer: null, shouldFail: false };

await mock.module('../src/github.js', {
  namedExports: {
    downloadBranchZip: async () => {
      if (githubState.shouldFail) {
        throw new Error('Could not reach GitHub. Check your connection.');
      }
      return githubState.buffer;
    },
  },
});

// ─── Import installer AFTER mocks are registered ─────────────────────────────

const { install, update } = await import('../src/installer.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a real AdmZip buffer with the given entries.
 * Entry keys are the full zip paths; values are file contents.
 * @param {Record<string, string>} entries
 * @returns {Buffer}
 */
function buildZipBuffer(entries) {
  const zip = new AdmZip();
  for (const [name, content] of Object.entries(entries)) {
    zip.addFile(name, Buffer.from(content));
  }
  return zip.toBuffer();
}

// ─── install() tests ──────────────────────────────────────────────────────────

describe('install()', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-install-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    // Reset state to defaults after all install() tests
    promptState.providers = ['claudecode'];
    promptState.gitignore = false;
    githubState.buffer = null;
    githubState.shouldFail = false;
  });

  it('returns early without error when no providers are selected', async () => {
    promptState.providers = [];
    promptState.gitignore = false;
    githubState.shouldFail = false;

    const dir = fs.mkdtempSync(path.join(tmpDir, 'no-providers-'));
    await assert.doesNotReject(() => install(dir));

    // No manifest should be written since we bailed out early
    const manifestPath = path.join(dir, '.indexed-skill', 'manifest.json');
    assert.ok(!fs.existsSync(manifestPath), 'manifest should not be written when no providers selected');
  });

  it('handles downloadBranchZip failure gracefully (no throw)', async () => {
    promptState.providers = ['claudecode'];
    promptState.gitignore = false;
    githubState.shouldFail = true;

    const dir = fs.mkdtempSync(path.join(tmpDir, 'dl-fail-'));
    await assert.doesNotReject(() => install(dir));

    // No manifest should be written since download failed
    const manifestPath = path.join(dir, '.indexed-skill', 'manifest.json');
    assert.ok(!fs.existsSync(manifestPath), 'manifest should not be written after download failure');
  });

  it('installs skills from zip and writes manifest (gitignore=false)', async () => {
    promptState.providers = ['claudecode'];
    promptState.gitignore = false;
    githubState.shouldFail = false;
    githubState.buffer = buildZipBuffer({
      'indexed-skill-spec-main/skills/my-skill/SKILL.md': '# My Skill',
      'indexed-skill-spec-main/skills/other-skill.md': '# Other',
    });

    const dir = fs.mkdtempSync(path.join(tmpDir, 'install-ok-'));
    await assert.doesNotReject(() => install(dir));

    // Manifest must exist
    const manifestPath = path.join(dir, '.indexed-skill', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json should be created');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.deepEqual(manifest.providers, ['claudecode']);
    assert.ok(manifest.files.length >= 1, 'at least one file should be recorded in manifest');

    // .gitignore should NOT be touched
    const gitignorePath = path.join(dir, '.gitignore');
    assert.ok(!fs.existsSync(gitignorePath), '.gitignore should not be created when gitignore=false');
  });

  it('writes .gitignore block when gitignore=true', async () => {
    promptState.providers = ['claudecode'];
    promptState.gitignore = true;
    githubState.shouldFail = false;
    githubState.buffer = buildZipBuffer({
      'indexed-skill-spec-main/skills/skill-x.md': '# Skill X',
    });

    const dir = fs.mkdtempSync(path.join(tmpDir, 'install-gitignore-'));
    await assert.doesNotReject(() => install(dir));

    const gitignorePath = path.join(dir, '.gitignore');
    assert.ok(fs.existsSync(gitignorePath), '.gitignore should be created when gitignore=true');

    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert.ok(
      content.includes('.claude/skills') || content.includes('indexed-skill'),
      '.gitignore should contain a relevant entry'
    );
  });
});

// ─── update() tests ───────────────────────────────────────────────────────────

describe('update()', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-update-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    githubState.buffer = null;
    githubState.shouldFail = false;
  });

  it('returns early without throwing when no manifest exists', async () => {
    githubState.shouldFail = false;

    const dir = fs.mkdtempSync(path.join(tmpDir, 'no-manifest-'));
    await assert.doesNotReject(() => update(dir));
  });

  it('handles downloadBranchZip failure gracefully during update (no throw)', async () => {
    githubState.shouldFail = false;
    githubState.buffer = buildZipBuffer({
      'indexed-skill-spec-main/skills/skill-a.md': '# Skill A',
    });

    // First install to create a manifest
    promptState.providers = ['claudecode'];
    promptState.gitignore = false;
    const dir = fs.mkdtempSync(path.join(tmpDir, 'update-dl-fail-'));
    await install(dir);

    // Now simulate download failure on update
    githubState.shouldFail = true;
    await assert.doesNotReject(() => update(dir));
  });

  it('re-installs from manifest providers and updates manifest', async () => {
    githubState.shouldFail = false;
    githubState.buffer = buildZipBuffer({
      'indexed-skill-spec-main/skills/skill-a.md': '# Skill A',
    });

    // First install to create a manifest
    promptState.providers = ['claudecode'];
    promptState.gitignore = false;
    const dir = fs.mkdtempSync(path.join(tmpDir, 'update-ok-'));
    await install(dir);

    // Verify manifest was written by install
    const manifestPath = path.join(dir, '.indexed-skill', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest must exist before update');
    const beforeManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Now build a slightly different zip for the update
    githubState.buffer = buildZipBuffer({
      'indexed-skill-spec-main/skills/skill-b.md': '# Skill B (updated)',
      'indexed-skill-spec-main/skills/skill-c.md': '# Skill C (new)',
    });

    await assert.doesNotReject(() => update(dir));

    // Manifest should have been re-written
    const afterManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.deepEqual(afterManifest.providers, beforeManifest.providers, 'providers should be preserved');
    assert.ok(
      afterManifest.installedAt >= beforeManifest.installedAt,
      'installedAt timestamp should be refreshed or equal'
    );
    assert.ok(afterManifest.files.length >= 1, 'updated manifest should record files');
  });
});
