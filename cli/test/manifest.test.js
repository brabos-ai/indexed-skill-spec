import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeManifest, readManifest } from '../src/manifest.js';

describe('manifest', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'idx-skill-manifest-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writeManifest creates .indexed-skill/manifest.json', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    writeManifest(dir, ['claudecode'], []);
    const manifestPath = path.join(dir, '.indexed-skill', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json should exist');
  });

  it('manifest has installedAt as a valid ISO string', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    writeManifest(dir, ['claudecode'], []);
    const manifest = readManifest(dir);
    assert.ok(manifest.installedAt, 'installedAt should be defined');
    const date = new Date(manifest.installedAt);
    assert.ok(!isNaN(date.getTime()), `installedAt "${manifest.installedAt}" is not a valid date`);
  });

  it('manifest providers matches input', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    const providers = ['claudecode', 'codex'];
    writeManifest(dir, providers, []);
    const manifest = readManifest(dir);
    assert.deepEqual(manifest.providers, providers);
  });

  it('manifest files matches input', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    // Create dummy files so hashes can be computed
    fs.mkdirSync(path.join(dir, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'sub', 'file.md'), 'hello', 'utf8');
    const files = ['sub/file.md'];
    writeManifest(dir, ['claudecode'], files);
    const manifest = readManifest(dir);
    assert.deepEqual(manifest.files, files);
  });

  it('manifest hashes has SHA-256 hex per file', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    fs.mkdirSync(path.join(dir, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'sub', 'skill.md'), 'content', 'utf8');
    const files = ['sub/skill.md'];
    writeManifest(dir, ['claudecode'], files);
    const manifest = readManifest(dir);
    assert.ok(manifest.hashes, 'hashes should be defined');
    const hash = manifest.hashes['sub/skill.md'];
    assert.ok(hash, 'hash for sub/skill.md should exist');
    assert.match(hash, /^[a-f0-9]{64}$/, `hash "${hash}" is not a valid SHA-256 hex`);
  });

  it('readManifest returns null when file is missing', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    const result = readManifest(dir);
    assert.equal(result, null);
  });

  it('readManifest returns parsed object after write', () => {
    const dir = fs.mkdtempSync(path.join(tmpDir, 'test-'));
    const providers = ['antigravity'];
    writeManifest(dir, providers, []);
    const manifest = readManifest(dir);
    assert.ok(manifest !== null, 'manifest should not be null');
    assert.ok(typeof manifest === 'object', 'manifest should be an object');
    assert.deepEqual(manifest.providers, providers);
  });
});
