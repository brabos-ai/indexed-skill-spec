/**
 * Tests for github.js — downloadBranchZip
 *
 * IMPORTANT: mock.module() must be called BEFORE the first import of the module
 * under test. We use top-level await to register the mock before any dynamic
 * import of github.js. All imports of github.js are done inside individual it()
 * callbacks via dynamic import so the mock intercepts them.
 */

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

// ─── Shared configurable fake handler ────────────────────────────────────────
//
// One mock registration, one delegate object — tests swap out the handler.

const httpsHandler = {
  get: null,
};

function fakeResponse({ statusCode, location } = {}) {
  const listeners = {};
  const res = {
    statusCode,
    headers: location ? { location } : {},
    resume() {},
    on(event, cb) {
      listeners[event] = cb;
      return res;
    },
    _emit(event, ...args) {
      if (listeners[event]) listeners[event](...args);
    },
  };
  return res;
}

// Register mock BEFORE any dynamic import of github.js
await mock.module('node:https', {
  namedExports: {
    get(url, opts, cb) {
      // If no handler is set, fall through to a 404-style rejection to keep
      // the "module exports" tests working (they suppress the rejection).
      if (!httpsHandler.get) {
        process.nextTick(() => {
          const req = { on: () => ({}) };
          // Do nothing — let the promise hang; tests that call this path
          // must either not await or explicitly catch.
          return req;
        });
        return { on: () => ({}) };
      }
      return httpsHandler.get(url, opts, cb);
    },
  },
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('github.js — downloadBranchZip', () => {
  describe('module exports', () => {
    it('exports downloadBranchZip as a function', async () => {
      const mod = await import('../src/github.js');
      assert.equal(typeof mod.downloadBranchZip, 'function');
    });

    it('exports fetchLatestRelease as a function', async () => {
      const mod = await import('../src/github.js');
      assert.equal(typeof mod.fetchLatestRelease, 'function');
    });

    it('exports fetchReleases as a function', async () => {
      const mod = await import('../src/github.js');
      assert.equal(typeof mod.fetchReleases, 'function');
    });

    it('exports downloadTagZip as a function', async () => {
      const mod = await import('../src/github.js');
      assert.equal(typeof mod.downloadTagZip, 'function');
    });

    it('downloadBranchZip returns a Promise', async () => {
      const mod = await import('../src/github.js');
      httpsHandler.get = (_url, _opts, _cb) => {
        // Return a minimal request that never fires — we only care about the
        // Promise being returned, not its resolution.
        return { on: () => ({}) };
      };
      const result = mod.downloadBranchZip('test-branch');
      assert.ok(result instanceof Promise, 'should return a Promise');
      result.catch(() => {});
    });
  });

  describe('error handling', () => {
    it('rejects with "not found" message when https returns 404', async () => {
      httpsHandler.get = (_url, _opts, cb) => {
        const res = fakeResponse({ statusCode: 404 });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => res._emit('end'));
        });
        return { on: () => ({}) };
      };

      const { downloadBranchZip } = await import('../src/github.js');
      await assert.rejects(
        () => downloadBranchZip('no-such-branch'),
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(
            err.message.toLowerCase().includes('not found'),
            `expected "not found" in message, got: "${err.message}"`
          );
          return true;
        }
      );
    });

    it('rejects with "Download failed" message on 500 status', async () => {
      httpsHandler.get = (_url, _opts, cb) => {
        const res = fakeResponse({ statusCode: 500 });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => res._emit('end'));
        });
        return { on: () => ({}) };
      };

      const { downloadBranchZip } = await import('../src/github.js');
      await assert.rejects(
        () => downloadBranchZip('main'),
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(
            err.message.includes('Download failed'),
            `expected "Download failed" in message, got: "${err.message}"`
          );
          return true;
        }
      );
    });

    it('rejects with "Could not reach GitHub" on request-level error', async () => {
      httpsHandler.get = (_url, _opts, _cb) => {
        const req = {
          _cb: null,
          on(event, cb) {
            if (event === 'error') this._cb = cb;
            return this;
          },
        };
        process.nextTick(() => {
          if (req._cb) req._cb(new Error('ENOTFOUND'));
        });
        return req;
      };

      const { downloadBranchZip } = await import('../src/github.js');
      await assert.rejects(
        () => downloadBranchZip('main'),
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(
            err.message.includes('Could not reach GitHub'),
            `expected "Could not reach GitHub" in message, got: "${err.message}"`
          );
          return true;
        }
      );
    });
  });

  describe('success path', () => {
    it('resolves with a Buffer containing the response data on 200 OK', async () => {
      const fakeZipBytes = Buffer.from('PK\x03\x04fake-zip-content');

      httpsHandler.get = (_url, _opts, cb) => {
        const res = fakeResponse({ statusCode: 200 });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => {
            res._emit('data', fakeZipBytes);
            res._emit('end');
          });
        });
        return { on: () => ({}) };
      };

      const { downloadBranchZip } = await import('../src/github.js');
      const result = await downloadBranchZip('main');
      assert.ok(Buffer.isBuffer(result), 'result should be a Buffer');
      assert.deepEqual(result, fakeZipBytes);
    });

    it('follows a 3xx redirect to the Location URL', async () => {
      const fakeZipBytes = Buffer.from('redirected-zip-content');
      let callCount = 0;

      httpsHandler.get = (_url, _opts, cb) => {
        callCount++;
        if (callCount === 1) {
          const res = fakeResponse({ statusCode: 302, location: 'https://example.com/final.zip' });
          process.nextTick(() => {
            cb(res);
            process.nextTick(() => res._emit('end'));
          });
        } else {
          const res = fakeResponse({ statusCode: 200 });
          process.nextTick(() => {
            cb(res);
            process.nextTick(() => {
              res._emit('data', fakeZipBytes);
              res._emit('end');
            });
          });
        }
        return { on: () => ({}) };
      };

      const { downloadBranchZip } = await import('../src/github.js');
      const result = await downloadBranchZip('main');
      assert.ok(Buffer.isBuffer(result), 'result should be a Buffer after redirect');
      assert.equal(callCount, 2, 'should make exactly 2 https.get calls (initial + redirect)');
      assert.deepEqual(result, fakeZipBytes);
    });
  });
});

// ─── fetchLatestRelease ───────────────────────────────────────────────────────

describe('github.js — fetchLatestRelease', () => {
  it('resolves with parsed JSON on 200 OK', async () => {
    const fakeRelease = { tag_name: 'v1.2.0', name: 'Release 1.2.0' };

    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 200 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => {
          res._emit('data', Buffer.from(JSON.stringify(fakeRelease)));
          res._emit('end');
        });
      });
      return { on: () => ({}) };
    };

    const { fetchLatestRelease } = await import('../src/github.js');
    const result = await fetchLatestRelease();
    assert.deepEqual(result, fakeRelease);
  });

  it('rejects with "Release not found" on 404', async () => {
    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 404 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => res._emit('end'));
      });
      return { on: () => ({}) };
    };

    const { fetchLatestRelease } = await import('../src/github.js');
    await assert.rejects(
      () => fetchLatestRelease(),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('not found'), `expected "not found", got: "${err.message}"`);
        return true;
      }
    );
  });

  it('rejects with "GitHub API error" on 500', async () => {
    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 500 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => res._emit('end'));
      });
      return { on: () => ({}) };
    };

    const { fetchLatestRelease } = await import('../src/github.js');
    await assert.rejects(
      () => fetchLatestRelease(),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('GitHub API error'), `expected "GitHub API error", got: "${err.message}"`);
        return true;
      }
    );
  });

  it('rejects with "Could not reach GitHub" on request-level error', async () => {
    httpsHandler.get = (_url, _opts, _cb) => {
      const req = {
        _cb: null,
        on(event, cb) {
          if (event === 'error') this._cb = cb;
          return this;
        },
      };
      process.nextTick(() => {
        if (req._cb) req._cb(new Error('ENOTFOUND'));
      });
      return req;
    };

    const { fetchLatestRelease } = await import('../src/github.js');
    await assert.rejects(
      () => fetchLatestRelease(),
      (err) => {
        assert.ok(err.message.includes('Could not reach GitHub'));
        return true;
      }
    );
  });

  it('follows a 3xx redirect', async () => {
    const fakeRelease = { tag_name: 'v2.0.0', name: 'v2.0.0' };
    let callCount = 0;

    httpsHandler.get = (_url, _opts, cb) => {
      callCount++;
      if (callCount === 1) {
        const res = fakeResponse({ statusCode: 301, location: 'https://api.github.com/repos/foo/releases/latest' });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => res._emit('end'));
        });
      } else {
        const res = fakeResponse({ statusCode: 200 });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => {
            res._emit('data', Buffer.from(JSON.stringify(fakeRelease)));
            res._emit('end');
          });
        });
      }
      return { on: () => ({}) };
    };

    const { fetchLatestRelease } = await import('../src/github.js');
    const result = await fetchLatestRelease();
    assert.equal(callCount, 2);
    assert.deepEqual(result, fakeRelease);
  });
});

// ─── fetchReleases ────────────────────────────────────────────────────────────

describe('github.js — fetchReleases', () => {
  it('resolves with array of releases on 200 OK', async () => {
    const fakeReleases = [
      { tag_name: 'v2.0.0', name: 'v2.0.0' },
      { tag_name: 'v1.0.0', name: 'v1.0.0' },
    ];

    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 200 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => {
          res._emit('data', Buffer.from(JSON.stringify(fakeReleases)));
          res._emit('end');
        });
      });
      return { on: () => ({}) };
    };

    const { fetchReleases } = await import('../src/github.js');
    const result = await fetchReleases();
    assert.deepEqual(result, fakeReleases);
  });

  it('rejects with "GitHub API error" on non-200 status', async () => {
    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 403 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => res._emit('end'));
      });
      return { on: () => ({}) };
    };

    const { fetchReleases } = await import('../src/github.js');
    await assert.rejects(
      () => fetchReleases(),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes('GitHub API error'));
        return true;
      }
    );
  });
});

// ─── downloadTagZip ───────────────────────────────────────────────────────────

describe('github.js — downloadTagZip', () => {
  it('resolves with a Buffer on 200 OK', async () => {
    const fakeZip = Buffer.from('PK\x03\x04fake-tag-zip');

    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 200 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => {
          res._emit('data', fakeZip);
          res._emit('end');
        });
      });
      return { on: () => ({}) };
    };

    const { downloadTagZip } = await import('../src/github.js');
    const result = await downloadTagZip('v1.2.0');
    assert.ok(Buffer.isBuffer(result));
    assert.deepEqual(result, fakeZip);
  });

  it('rejects with "not found" message on 404', async () => {
    httpsHandler.get = (_url, _opts, cb) => {
      const res = fakeResponse({ statusCode: 404 });
      process.nextTick(() => {
        cb(res);
        process.nextTick(() => res._emit('end'));
      });
      return { on: () => ({}) };
    };

    const { downloadTagZip } = await import('../src/github.js');
    await assert.rejects(
      () => downloadTagZip('v999.0.0'),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.toLowerCase().includes('not found'));
        return true;
      }
    );
  });

  it('follows redirect to final zip URL', async () => {
    const fakeZip = Buffer.from('final-tag-zip');
    let callCount = 0;

    httpsHandler.get = (_url, _opts, cb) => {
      callCount++;
      if (callCount === 1) {
        const res = fakeResponse({ statusCode: 302, location: 'https://codeload.github.com/final.zip' });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => res._emit('end'));
        });
      } else {
        const res = fakeResponse({ statusCode: 200 });
        process.nextTick(() => {
          cb(res);
          process.nextTick(() => {
            res._emit('data', fakeZip);
            res._emit('end');
          });
        });
      }
      return { on: () => ({}) };
    };

    const { downloadTagZip } = await import('../src/github.js');
    const result = await downloadTagZip('v1.0.0');
    assert.equal(callCount, 2);
    assert.deepEqual(result, fakeZip);
  });
});
