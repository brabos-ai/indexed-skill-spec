import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeGitignoreBlock, hasBlock, getInstalledDirs, BLOCK_START, BLOCK_END } from '../src/gitignore.js';

describe('gitignore', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-gitignore-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writeGitignoreBlock creates .gitignore if missing', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    const gitignorePath = path.join(dir, '.gitignore');

    assert.ok(!fs.existsSync(gitignorePath), '.gitignore should not exist before');
    writeGitignoreBlock(dir, ['.indexed-skill/']);
    assert.ok(fs.existsSync(gitignorePath), '.gitignore should exist after');
  });

  it('written block contains BLOCK_START and BLOCK_END', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    writeGitignoreBlock(dir, ['.indexed-skill/']);
    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
    assert.ok(content.includes(BLOCK_START), 'BLOCK_START not found');
    assert.ok(content.includes(BLOCK_END), 'BLOCK_END not found');
  });

  it('written block contains provider dest dirs', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    const dirs = ['.indexed-skill/', '.claude/skills/'];
    writeGitignoreBlock(dir, dirs);
    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
    for (const d of dirs) {
      assert.ok(content.includes(d), `"${d}" not found in .gitignore`);
    }
  });

  it('calling twice does not duplicate block', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    const dirs = ['.indexed-skill/', '.claude/skills/'];
    writeGitignoreBlock(dir, dirs);
    writeGitignoreBlock(dir, dirs);
    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8');
    const count = content.split(BLOCK_START).length - 1;
    assert.equal(count, 1, `BLOCK_START appears ${count} times, expected 1`);
  });

  it('hasBlock returns false for empty .gitignore', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    fs.writeFileSync(path.join(dir, '.gitignore'), '', 'utf8');
    assert.equal(hasBlock(dir), false);
  });

  it('hasBlock returns true after writeGitignoreBlock', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    writeGitignoreBlock(dir, ['.indexed-skill/']);
    assert.equal(hasBlock(dir), true);
  });

  it('getInstalledDirs always includes .indexed-skill/', () => {
    const result = getInstalledDirs([]);
    assert.ok(result.includes('.indexed-skill/'), '.indexed-skill/ not in result');
  });

  it('getInstalledDirs([claudecode]) includes .claude/skills/', () => {
    const result = getInstalledDirs(['claudecode']);
    assert.ok(result.includes('.claude/skills/'), '.claude/skills/ not in result');
  });
});
