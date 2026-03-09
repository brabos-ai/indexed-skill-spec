import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDERS, resolveSelected } from '../src/providers.js';

describe('PROVIDERS map', () => {
  it('has exactly 4 keys', () => {
    assert.equal(Object.keys(PROVIDERS).length, 4);
  });

  it('each provider has label, hint, src, and dest', () => {
    for (const [key, provider] of Object.entries(PROVIDERS)) {
      assert.ok(provider.label, `${key}: label missing or empty`);
      assert.ok(provider.hint, `${key}: hint missing or empty`);
      assert.ok(provider.src, `${key}: src missing or empty`);
      assert.ok(provider.dest, `${key}: dest missing or empty`);
    }
  });

  it('resolveSelected([claudecode]) returns correct dest', () => {
    const result = resolveSelected(['claudecode']);
    assert.equal(result.length, 1);
    assert.equal(result[0].dest, '.claude/skills');
  });

  it('resolveSelected([]) returns empty array', () => {
    const result = resolveSelected([]);
    assert.equal(result.length, 0);
  });

  it('all src values equal "skills"', () => {
    for (const [key, provider] of Object.entries(PROVIDERS)) {
      assert.equal(provider.src, 'skills', `${key}: expected src to be "skills"`);
    }
  });
});
