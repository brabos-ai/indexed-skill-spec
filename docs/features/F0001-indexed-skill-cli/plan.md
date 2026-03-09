# Plan: F0001-indexed-skill-cli

## Overview

CLI `idx-skill` published to npm that installs skills from `xmaiconx/indexed-skill-spec` into the correct provider directories of any consuming project. Interactive multiselect for providers, `.gitignore` block management, manifest tracking, and three commands: `install`, `update`, `list`. Always downloads from `main` branch — no version management.

---

## CLI Package Structure

```
cli/
  bin/idx-skill.js
  src/
    providers.js
    github.js
    manifest.js
    gitignore.js
    prompt.js
    installer.js
  test/
    providers.test.js
    gitignore.test.js
    manifest.test.js
  package.json
```

---

## package.json Spec

| Field | Value |
|-------|-------|
| name | `idx-skill` |
| version | `0.1.0` |
| type | `module` |
| bin | `{ "idx-skill": "./bin/idx-skill.js" }` |
| engines | `{ "node": ">=18.0.0" }` |
| files | `["bin", "src", "README.md"]` |
| test script | `node --test` |
| dependencies | `@clack/prompts ^0.10.0`, `adm-zip ^0.5.10` |
| devDependencies | none |
| license | MIT |
| repository | `git+https://github.com/xmaiconx/indexed-skill-spec.git` |

---

## src/providers.js

### PROVIDERS Map

| Key | Label | Hint | src | dest |
|-----|-------|------|-----|------|
| `claudecode` | Claude Code | `.claude/skills/` | `skills` | `.claude/skills` |
| `codex` | Codex (OpenAI) | `.agent/skills/` | `skills` | `.agent/skills` |
| `antigravity` | Google Antigravity | `.agents/skills/` | `skills` | `.agents/skills` |
| `opencode` | OpenCode | `.opencode/skills/` | `skills` | `.opencode/skills` |

### Functions

| Function | Signature | Returns |
|----------|-----------|---------|
| `resolveSelected` | `(keys: string[]) => { key, label, src, dest, hint }[]` | Selected provider objects |

---

## src/github.js

### Functions

| Function | Signature | Returns |
|----------|-----------|---------|
| `downloadBranchZip` | `(branch?: string, repo?: string) => Promise<Buffer>` | ZIP buffer |

- `REPO` constant: `'xmaiconx/indexed-skill-spec'`
- `branch` defaults to `'main'`
- Download URL: `https://github.com/{repo}/archive/refs/heads/{branch}.zip`
- Error: network failure → `'Could not reach GitHub. Check your connection.'`
- Error: 404 → `'Branch {branch} not found.'`
- Header: `User-Agent: idx-skill`

---

## src/manifest.js

### Manifest Schema (`.indexed-skill/manifest.json`)

```json
{
  "installedAt": "ISO8601",
  "providers": ["claudecode"],
  "files": ["relative/path/file.md"],
  "hashes": { "relative/path/file.md": "sha256hex" }
}
```

### Functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `writeManifest` | `(cwd, providers, files) => void` | Write `.indexed-skill/manifest.json`; computes SHA-256 hashes per file |
| `readManifest` | `(cwd) => object \| null` | Read manifest; returns `null` if not found |

---

## src/gitignore.js

### Constants

| Constant | Value |
|----------|-------|
| `BLOCK_START` | `# idx-skill - managed by idx-skill` |
| `BLOCK_END` | `# END idx-skill` |

### Functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `writeGitignoreBlock` | `(cwd, dirs) => void` | Write/replace managed block in `.gitignore`; creates file if absent; no-duplicate logic |
| `hasBlock` | `(cwd) => boolean` | Returns `true` if managed block exists |
| `getInstalledDirs` | `(selectedKeys) => string[]` | Returns provider `dest` dirs with trailing `/`; always includes `.indexed-skill/` |

---

## src/prompt.js

### Functions

| Function | Signature | Returns |
|----------|-----------|---------|
| `promptProviders` | `() => Promise<string[]>` | Selected provider keys; throws `USER_CANCEL` if cancelled |
| `promptGitignore` | `() => Promise<boolean>` | `true` by default (opt-out); throws `USER_CANCEL` if cancelled |

- `promptProviders` uses `@clack/prompts multiselect`; no `initialValues` (nothing pre-selected)
- `required: false` — user can proceed with empty selection (handled in installer)

---

## src/installer.js

### install(cwd) flow

1. `intro('idx-skill - Install')`
2. `promptProviders()` → `selectedKeys`; if empty → `log.warn` + `outro('No providers selected. Installation cancelled.')` + return
3. `promptGitignore()` → `addToGitignore`
4. Spinner: `downloadBranchZip('main')` → `zipBuffer`
5. `new AdmZip(zipBuffer)` → extract `zipRoot` (e.g. `indexed-skill-spec-main`)
6. For each provider: `copyFromZip(zip, zipRoot, provider.src, destDir, cwd)` — `srcPrefix = 'skills'`
7. If `addToGitignore`: `writeGitignoreBlock(cwd, getInstalledDirs(selectedKeys))`; `log.success('.gitignore updated.')`
8. `writeManifest(cwd, selectedKeys, allFiles)`
9. `outro('Installed successfully')`

### update(cwd) flow

1. `readManifest(cwd)` → if null → `log.error('No installation found. Run idx-skill install first.')` + return
2. `intro('idx-skill - Update')`
3. Spinner: `downloadBranchZip('main')`
4. Extract + overwrite files for providers in manifest
5. `writeManifest(cwd, manifest.providers, newFiles)` (new `installedAt`)
6. `outro('Updated successfully')`

### list(cwd) flow

1. `readManifest(cwd)` → if null → `log.error('No installation found.')` + return
2. Print table: providers, dest dirs, `installedAt`, file count
3. No `intro`/`outro` needed

### copyFromZip (internal)

| Param | Description |
|-------|-------------|
| `zip` | AdmZip instance |
| `zipRoot` | e.g. `indexed-skill-spec-main` |
| `srcPrefix` | e.g. `skills` |
| `destDir` | absolute destination path |
| `cwd` | project root |

Returns `string[]` of relative file paths copied.

---

## bin/idx-skill.js

### parseArgs routing

| Arg | Handler |
|-----|---------|
| `install` (default, no arg) | `install(cwd)` |
| `update` | `update(cwd)` |
| `list` | `list(cwd)` |
| `--help` / `-h` | print usage |
| `--version` / `-v` | print package version |

- Uses `node:util parseArgs` or manual `process.argv[2]` check
- `cwd = process.cwd()`
- Wraps call in try/catch: `USER_CANCEL` → silent exit 0; other errors → `log.error(msg)` + exit 1

---

## test/providers.test.js

| Test | Assertion |
|------|-----------|
| PROVIDERS has exactly 4 keys | `Object.keys(PROVIDERS).length === 4` |
| Each provider has label, hint, src, dest | all fields defined and non-empty |
| `resolveSelected(['claudecode'])` returns correct dest | `.dest === '.claude/skills'` |
| `resolveSelected([])` returns empty array | length 0 |
| All `src` values equal `'skills'` | every provider shares same src |

---

## test/gitignore.test.js

| Test | Assertion |
|------|-----------|
| `writeGitignoreBlock` creates `.gitignore` if missing | file exists after call |
| Written block contains `BLOCK_START` and `BLOCK_END` | strings present in file |
| Written block contains provider dest dirs | dir strings present |
| Calling twice does not duplicate block | only one `BLOCK_START` in file |
| `hasBlock` returns `false` for empty `.gitignore` | false |
| `hasBlock` returns `true` after `writeGitignoreBlock` | true |
| `getInstalledDirs` always includes `.indexed-skill/` | present in result |
| `getInstalledDirs(['claudecode'])` includes `.claude/skills/` | present |

---

## test/manifest.test.js

| Test | Assertion |
|------|-----------|
| `writeManifest` creates `.indexed-skill/manifest.json` | file exists |
| Manifest has `installedAt` ISO string | valid date |
| Manifest `providers` matches input | deep equal |
| Manifest `files` matches input | deep equal |
| Manifest `hashes` has SHA-256 hex per file | format `[a-f0-9]{64}` |
| `readManifest` returns null when file missing | null |
| `readManifest` returns parsed object after write | object with providers |

---

## .github/workflows/ci.yml Spec

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test-cli:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [18, 20, 22]
    defaults:
      run:
        working-directory: cli
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
          cache-dependency-path: cli/package-lock.json
      - run: npm ci
      - run: npm test
```

---

## .github/workflows/release.yml Spec

```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
    defaults:
      run:
        working-directory: cli
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
          cache: npm
          cache-dependency-path: cli/package-lock.json
      - run: npm ci
      - run: npm test
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Main Flow

1. User runs `npx idx-skill` or `idx-skill install`
2. `bin/idx-skill.js` → `install(process.cwd())`
3. `promptProviders()` → user picks 1–4 providers
4. `promptGitignore()` → user confirms (default yes)
5. `downloadBranchZip('main')` → ZIP buffer from GitHub
6. Extract ZIP root prefix → `indexed-skill-spec-main`
7. For each provider: copy `skills/` tree to provider `dest`
8. Write `.gitignore` block if confirmed
9. Write `.indexed-skill/manifest.json`
10. Print success

---

## Implementation Order

1. `cli/package.json` — package definition
2. `src/providers.js` — PROVIDERS map + resolveSelected
3. `src/github.js` — downloadBranchZip
4. `src/manifest.js` — writeManifest, readManifest
5. `src/gitignore.js` — writeGitignoreBlock, hasBlock, getInstalledDirs
6. `src/prompt.js` — promptProviders, promptGitignore
7. `src/installer.js` — install, update, list, copyFromZip (internal)
8. `bin/idx-skill.js` — parseArgs routing
9. `test/providers.test.js`, `test/gitignore.test.js`, `test/manifest.test.js`
10. `.github/workflows/ci.yml`, `.github/workflows/release.yml`

---

## Requirements Coverage

| ID | Requirement | Covered? | Area | Tasks |
|----|-------------|----------|------|-------|
| RF01 | `npx idx-skill` starts interactive install with 4 providers | ✅ | bin + prompt | 1.8, 1.6 |
| RF02 | claudecode installs to `.claude/skills/` | ✅ | providers + installer | 1.2, 1.7 |
| RF03 | codex installs to `.agent/skills/` | ✅ | providers + installer | 1.2, 1.7 |
| RF04 | antigravity installs to `.agents/skills/` | ✅ | providers + installer | 1.2, 1.7 |
| RF05 | opencode installs to `.opencode/skills/` | ✅ | providers + installer | 1.2, 1.7 |
| RF06 | `.gitignore` updated with block when confirmed | ✅ | gitignore | 1.5, 1.7 |
| RF07 | `.indexed-skill/manifest.json` written on install | ✅ | manifest | 1.4, 1.7 |
| RF08 | `idx-skill update` re-installs from manifest providers | ✅ | installer | 1.7 |
| RF09 | `idx-skill list` displays providers, dirs, date | ✅ | installer | 1.7 |
| RF10 | `npm test` passes on Node 18, 20, 22 | ✅ | test + ci | 1.9, 1.10 |
| RF11 | CI runs on PR and push to main | ✅ | ci.yml | 1.10 |
| RF12 | Release publishes to npm with `--provenance` on `v*` tags | ✅ | release.yml | 1.11 |
| RN01 | No providers selected → cancel gracefully | ✅ | installer | 1.7 |
| RN02 | No duplicates in `.gitignore` block | ✅ | gitignore | 1.5 |
| RN03 | `update` without manifest → error message | ✅ | installer | 1.7 |
| RN04 | GitHub unreachable → clear error | ✅ | github | 1.3 |

**Status:** ✅ 100% covered

---

## Quick Reference

| Pattern | Reference |
|---------|-----------|
| PROVIDERS map | `C:/github/xmaiconx/code-addiction/cli/src/providers.js` |
| ZIP download | `C:/github/xmaiconx/code-addiction/cli/src/github.js` |
| copyFromZip + installer | `C:/github/xmaiconx/code-addiction/cli/src/installer.js` |
| @clack/prompts usage | `C:/github/xmaiconx/code-addiction/cli/src/prompt.js` |
| gitignore block pattern | `C:/github/xmaiconx/code-addiction/cli/src/gitignore.js` |
| CI workflow | `C:/github/xmaiconx/code-addiction/.github/workflows/ci.yml` |
| Release workflow | `C:/github/xmaiconx/code-addiction/.github/workflows/release.yml` |

---

## Spec Checklist

### Files to Create (13 total)

- [ ] `cli/package.json`
- [ ] `cli/bin/idx-skill.js`
- [ ] `cli/src/providers.js`
- [ ] `cli/src/github.js`
- [ ] `cli/src/manifest.js`
- [ ] `cli/src/gitignore.js`
- [ ] `cli/src/prompt.js`
- [ ] `cli/src/installer.js`
- [ ] `cli/test/providers.test.js`
- [ ] `cli/test/gitignore.test.js`
- [ ] `cli/test/manifest.test.js`
- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/release.yml`

### Commands (3 total)

- [ ] `idx-skill install` (default when no arg)
- [ ] `idx-skill update`
- [ ] `idx-skill list`

### Functions (17 total)

**src/providers.js**
- [ ] `resolveSelected(keys)` → `{ key, label, src, dest, hint }[]`

**src/github.js**
- [ ] `downloadBranchZip(branch?, repo?)` → `Promise<Buffer>`

**src/manifest.js**
- [ ] `writeManifest(cwd, providers, files)` → `void`
- [ ] `readManifest(cwd)` → `object | null`

**src/gitignore.js**
- [ ] `writeGitignoreBlock(cwd, dirs)` → `void`
- [ ] `hasBlock(cwd)` → `boolean`
- [ ] `getInstalledDirs(selectedKeys)` → `string[]`

**src/prompt.js**
- [ ] `promptProviders()` → `Promise<string[]>`
- [ ] `promptGitignore()` → `Promise<boolean>`

**src/installer.js**
- [ ] `install(cwd)` → `Promise<void>`
- [ ] `update(cwd)` → `Promise<void>`
- [ ] `list(cwd)` → `void`
- [ ] `copyFromZip(zip, zipRoot, srcPrefix, destDir, cwd)` → `string[]` (internal)

**bin/idx-skill.js**
- [ ] `main()` — parseArgs, route to install/update/list, error handling

### Test Cases (20 total)

**providers.test.js** (5)
- [ ] PROVIDERS has 4 keys
- [ ] Each provider has required fields
- [ ] `resolveSelected(['claudecode'])` returns correct dest
- [ ] `resolveSelected([])` returns empty array
- [ ] All `src` values equal `'skills'`

**gitignore.test.js** (8)
- [ ] Creates `.gitignore` if missing
- [ ] Block contains BLOCK_START and BLOCK_END
- [ ] Block contains provider dirs
- [ ] Calling twice does not duplicate block
- [ ] `hasBlock` returns false for empty file
- [ ] `hasBlock` returns true after write
- [ ] `getInstalledDirs` always includes `.indexed-skill/`
- [ ] `getInstalledDirs(['claudecode'])` includes `.claude/skills/`

**manifest.test.js** (7)
- [ ] `writeManifest` creates `.indexed-skill/manifest.json`
- [ ] Manifest has valid ISO `installedAt`
- [ ] Manifest `providers` matches input
- [ ] Manifest `files` matches input
- [ ] Manifest `hashes` has SHA-256 hex per file
- [ ] `readManifest` returns null when missing
- [ ] `readManifest` returns parsed object after write

### GitHub Actions (2 workflows)

**ci.yml**
- [ ] Triggers: `pull_request` + `push: branches: [main]`
- [ ] Matrix: `node-version: [18, 20, 22]`
- [ ] `working-directory: cli`
- [ ] Steps: checkout → setup-node (cache) → `npm ci` → `npm test`

**release.yml**
- [ ] Triggers: `push: tags: ['v*']`
- [ ] Permission: `id-token: write` (for provenance)
- [ ] Node 20, `registry-url: https://registry.npmjs.org`
- [ ] Steps: checkout → setup-node → `npm ci` → `npm test` → `npm publish --provenance --access public`
- [ ] Env: `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`
