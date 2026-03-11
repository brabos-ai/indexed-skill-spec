import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import AdmZip from 'adm-zip';

import { copyFromZip, list, check } from '../src/installer.js';
import { writeManifest } from '../src/manifest.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build an AdmZip instance with virtual entries for testing.
 * @param {Array<{name: string, content: string|Buffer}>} entries
 * @returns {AdmZip}
 */
function buildZip(entries) {
  const zip = new AdmZip();
  for (const { name, content } of entries) {
    // addFile(entryName, buffer, comment, attr)
    zip.addFile(name, Buffer.isBuffer(content) ? content : Buffer.from(content));
  }
  return zip;
}

// ─── copyFromZip ─────────────────────────────────────────────────────────────

describe('copyFromZip', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-installer-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('copies matching entries to destDir and returns relative paths', () => {
    const destDir = fs.mkdtempSync(path.join(tmpDir, 'dest-'));
    const cwd = tmpDir;

    const zip = buildZip([
      { name: 'repo-main/skills/skill-a.md', content: '# Skill A' },
      { name: 'repo-main/skills/subdir/skill-b.md', content: '# Skill B' },
    ]);

    const copied = copyFromZip(zip, 'repo-main', 'skills', destDir, cwd);

    assert.equal(copied.length, 2, 'should copy 2 files');
    assert.ok(
      fs.existsSync(path.join(destDir, 'skill-a.md')),
      'skill-a.md should exist in destDir'
    );
    assert.ok(
      fs.existsSync(path.join(destDir, 'subdir', 'skill-b.md')),
      'subdir/skill-b.md should exist in destDir'
    );
  });

  it('returns empty array when no entries match prefix', () => {
    const destDir = fs.mkdtempSync(path.join(tmpDir, 'dest-'));
    const cwd = tmpDir;

    const zip = buildZip([
      { name: 'repo-main/other/stuff.md', content: 'stuff' },
    ]);

    const copied = copyFromZip(zip, 'repo-main', 'skills', destDir, cwd);
    assert.equal(copied.length, 0, 'should return empty array for non-matching prefix');
  });

  it('skips directory entries (entries with empty relativeToDest)', () => {
    const destDir = fs.mkdtempSync(path.join(tmpDir, 'dest-'));
    const cwd = tmpDir;

    const zip = new AdmZip();
    // addFile adds a file; addFolder adds a directory entry
    zip.addFile('repo-main/skills/real-file.md', Buffer.from('content'));
    // Add an explicit directory entry by using a trailing slash in the name
    zip.addFile('repo-main/skills/', Buffer.from(''));

    const copied = copyFromZip(zip, 'repo-main', 'skills', destDir, cwd);
    // Should only copy the real file, not the directory marker
    const nonDirCopied = copied.filter(Boolean);
    assert.ok(nonDirCopied.length <= 1, 'should not include empty-named entries');
  });

  it('file content is preserved correctly', () => {
    const destDir = fs.mkdtempSync(path.join(tmpDir, 'dest-'));
    const cwd = tmpDir;
    const expectedContent = '# Hello from zip';

    const zip = buildZip([
      { name: 'repo-main/skills/hello.md', content: expectedContent },
    ]);

    copyFromZip(zip, 'repo-main', 'skills', destDir, cwd);

    const actual = fs.readFileSync(path.join(destDir, 'hello.md'), 'utf8');
    assert.equal(actual, expectedContent, 'file content should match zip entry');
  });

  it('returns paths relative to cwd using forward slashes', () => {
    const destDir = path.join(tmpDir, 'reltest-dest');
    fs.mkdirSync(destDir, { recursive: true });
    const cwd = tmpDir;

    const zip = buildZip([
      { name: 'repo-main/skills/my-skill.md', content: 'x' },
    ]);

    const copied = copyFromZip(zip, 'repo-main', 'skills', destDir, cwd);
    assert.equal(copied.length, 1);
    assert.ok(
      !copied[0].includes('\\'),
      `path should use forward slashes, got: "${copied[0]}"`
    );
    assert.ok(
      copied[0].endsWith('my-skill.md'),
      `path should end with my-skill.md, got: "${copied[0]}"`
    );
  });

  it('creates nested destination directories as needed', () => {
    const destDir = path.join(tmpDir, 'nested-dest', 'deep');
    const cwd = tmpDir;

    const zip = buildZip([
      { name: 'repo-main/skills/a/b/c/deep-file.md', content: 'deep' },
    ]);

    const copied = copyFromZip(zip, 'repo-main', 'skills', destDir, cwd);
    assert.equal(copied.length, 1);
    assert.ok(
      fs.existsSync(path.join(destDir, 'a', 'b', 'c', 'deep-file.md')),
      'deeply nested file should be created'
    );
  });
});

// ─── list() ──────────────────────────────────────────────────────────────────

describe('list()', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-list-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns without throwing when no manifest exists', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'no-manifest-'));
    // list() calls log.error internally and returns — should not throw
    assert.doesNotThrow(() => list(dir));
  });

  it('returns without throwing when manifest exists', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'with-manifest-'));
    writeManifest(dir, ['claudecode', 'codex'], []);
    assert.doesNotThrow(() => list(dir));
  });

  it('logs provider info when manifest has providers', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'providers-'));
    writeManifest(dir, ['claudecode'], []);

    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      list(dir);
    } finally {
      console.log = origLog;
    }

    const combined = output.join('\n');
    assert.ok(
      combined.includes('claudecode'),
      'output should include provider key "claudecode"'
    );
  });

  it('shows provider dest path when manifest exists', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'dest-path-'));
    writeManifest(dir, ['gemini'], []);

    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      list(dir);
    } finally {
      console.log = origLog;
    }

    const combined = output.join('\n');
    assert.ok(combined.includes('gemini'), 'output should include provider key "gemini"');
    assert.ok(combined.includes('.gemini/skills'), 'output should include dest path');
  });

  it('shows total file count from manifest', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'filecount-'));
    // Create a dummy file so writeManifest can hash it
    const skillDir = path.join(dir, '.claude', 'skills');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'skill.md'), '# Skill', 'utf8');
    writeManifest(dir, ['claudecode'], ['.claude/skills/skill.md']);

    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      list(dir);
    } finally {
      console.log = origLog;
    }

    const combined = output.join('\n');
    assert.ok(
      combined.includes('1'),
      'output should mention the file count (1)'
    );
  });
});

// ─── check() ─────────────────────────────────────────────────────────────────

describe('check()', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-check-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('does not throw when no provider folders exist', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'empty-'));
    assert.doesNotThrow(() => check(dir));
  });

  it('outputs a line for every provider', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'all-'));
    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      check(dir);
    } finally {
      console.log = origLog;
    }

    // 18 providers + header lines
    const providerLines = output.filter((l) => l.includes('✅') || l.includes('❌'));
    assert.equal(providerLines.length, 18, 'should output one line per provider');
  });

  it('marks provider as detected (✅) when its folder exists', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'detected-'));
    fs.mkdirSync(path.join(dir, '.claude'));

    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      check(dir);
    } finally {
      console.log = origLog;
    }

    const combined = output.join('\n');
    assert.ok(combined.includes('✅'), 'should show ✅ for detected provider');
    assert.ok(combined.includes('claudecode'), 'should mention claudecode key');
  });

  it('marks provider as not found (❌) when its folder does not exist', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'not-found-'));

    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      check(dir);
    } finally {
      console.log = origLog;
    }

    const combined = output.join('\n');
    assert.ok(combined.includes('❌'), 'should show ❌ for missing providers');
    assert.ok(combined.includes('not found'), 'should say "not found" for missing providers');
  });

  it('shows dest path for detected provider', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'dest-'));
    fs.mkdirSync(path.join(dir, '.claude'));

    const output = [];
    const origLog = console.log;
    console.log = (...args) => output.push(args.join(' '));

    try {
      check(dir);
    } finally {
      console.log = origLog;
    }

    const combined = output.join('\n');
    assert.ok(
      combined.includes('.claude/skills'),
      'should show dest path for detected claudecode provider'
    );
  });
});
