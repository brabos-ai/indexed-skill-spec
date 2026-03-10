import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDERS, ALIASES, resolveSelected } from '../src/providers.js';

describe('PROVIDERS map', () => {
  it('has exactly 18 keys', () => {
    assert.equal(Object.keys(PROVIDERS).length, 18);
  });

  it('each provider has label, hint, src, dest, and folder', () => {
    for (const [key, provider] of Object.entries(PROVIDERS)) {
      assert.ok(provider.label, `${key}: label missing or empty`);
      assert.ok(provider.hint, `${key}: hint missing or empty`);
      assert.ok(provider.src, `${key}: src missing or empty`);
      assert.ok(provider.dest, `${key}: dest missing or empty`);
      assert.ok(provider.folder, `${key}: folder missing or empty`);
    }
  });

  it('all src values equal "skills"', () => {
    for (const [key, provider] of Object.entries(PROVIDERS)) {
      assert.equal(provider.src, 'skills', `${key}: expected src to be "skills"`);
    }
  });

  it('claudecode dest is .claude/skills', () => {
    assert.equal(PROVIDERS.claudecode.dest, '.claude/skills');
    assert.equal(PROVIDERS.claudecode.folder, '.claude/');
  });

  it('codex dest is .codex/skills (not .agent/skills)', () => {
    assert.equal(PROVIDERS.codex.dest, '.codex/skills');
    assert.equal(PROVIDERS.codex.folder, '.codex/');
  });

  it('antigravity dest is .agent/skills (not .agents/skills)', () => {
    assert.equal(PROVIDERS.antigravity.dest, '.agent/skills');
    assert.equal(PROVIDERS.antigravity.folder, '.agent/');
  });

  it('amp dest is .agents/skills', () => {
    assert.equal(PROVIDERS.amp.dest, '.agents/skills');
    assert.equal(PROVIDERS.amp.folder, '.agents/');
  });

  it('contains all expected provider keys', () => {
    const expected = [
      'claudecode', 'gemini', 'copilot', 'cursor', 'qwen', 'opencode',
      'codex', 'windsurf', 'kilocode', 'auggie', 'codebuddy', 'qodercli',
      'roo', 'kiro', 'amp', 'shai', 'antigravity', 'bob',
    ];
    for (const key of expected) {
      assert.ok(PROVIDERS[key], `${key} should be in PROVIDERS`);
    }
  });

  it('all folder values end with /', () => {
    for (const [key, provider] of Object.entries(PROVIDERS)) {
      assert.ok(
        provider.folder.endsWith('/'),
        `${key}: folder "${provider.folder}" should end with /`
      );
    }
  });
});

describe('ALIASES map', () => {
  it('is exported', () => {
    assert.ok(ALIASES !== undefined);
    assert.equal(typeof ALIASES, 'object');
  });

  it('agy resolves to antigravity', () => {
    assert.equal(ALIASES['agy'], 'antigravity');
  });

  it('kiro-cli resolves to kiro', () => {
    assert.equal(ALIASES['kiro-cli'], 'kiro');
  });
});

describe('resolveSelected()', () => {
  it('resolves canonical key correctly', () => {
    const result = resolveSelected(['claudecode']);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'claudecode');
    assert.equal(result[0].dest, '.claude/skills');
  });

  it('resolves alias "agy" to antigravity', () => {
    const result = resolveSelected(['agy']);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'antigravity');
    assert.equal(result[0].dest, '.agent/skills');
  });

  it('resolves alias "kiro-cli" to kiro', () => {
    const result = resolveSelected(['kiro-cli']);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'kiro');
    assert.equal(result[0].dest, '.kiro/skills');
  });

  it('resolves multiple keys including aliases', () => {
    const result = resolveSelected(['claudecode', 'agy', 'kiro-cli']);
    assert.equal(result.length, 3);
    assert.equal(result[0].key, 'claudecode');
    assert.equal(result[1].key, 'antigravity');
    assert.equal(result[2].key, 'kiro');
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(resolveSelected([]), []);
  });

  it('throws for unknown provider key', () => {
    assert.throws(
      () => resolveSelected(['nonexistent-provider']),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('nonexistent-provider'));
        return true;
      }
    );
  });
});
