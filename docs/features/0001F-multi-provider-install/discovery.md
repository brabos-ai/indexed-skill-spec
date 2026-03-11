# Discovery: Multi-Provider Install Support

> **Branch:** feature/0001F-multi-provider-install
> **Feature:** 0001F
> **Date:** 2026-03-09

---

## Codebase Analysis

### Related Files
- `cli/src/providers.js` — PROVIDERS map (4 providers, 2 incorrect paths), `resolveSelected()`
- `cli/src/installer.js` — `install()`, `update()`, `list()`, `copyFromZip()`
- `cli/src/prompt.js` — `promptProviders()` multi-select, `promptGitignore()`
- `cli/src/gitignore.js` — `getInstalledDirs()`, `writeGitignoreBlock()`
- `cli/src/manifest.js` — `writeManifest()`, `readManifest()` — no changes needed
- `cli/src/github.js` — `downloadBranchZip()` — no changes needed
- `cli/bin/idx-skill.js` — CLI entry point, command routing

### Similar Features
- `spec-kit` AGENT_CONFIG in `C:\github\terceiros\spec-kit\src\specify_cli\__init__.py` — reference for all provider folder paths

### Patterns
- PROVIDERS is pure data (no logic) → adding entries is zero-risk
- `copyFromZip()` is fully generic — no changes needed for new providers
- `promptProviders()` auto-generates options from PROVIDERS entries — no extra work per new provider
- clack `multiselect` supports `initialValues: string[]` → pre-selection is built-in

## Technical Context

### Current PROVIDERS map (with bugs)

```js
claudecode  .claude/skills/    ✅ correct
codex       .agent/skills/     ❌ should be .codex/skills/
antigravity .agents/skills/    ❌ should be .agent/skills/  (spec-kit: agy = .agent/)
opencode    .opencode/skills/  ✅ correct
```

**Note:** spec-kit uses `.agents/` for Amp (not Antigravity). Antigravity uses `.agent/`.

### Full reference — spec-kit AGENT_CONFIG folder paths

| Key | folder | Correct idx-skill dest |
|-----|--------|------------------------|
| claude | `.claude/` | `.claude/skills/` |
| gemini | `.gemini/` | `.gemini/skills/` |
| copilot | `.github/` | `.github/skills/` |
| cursor-agent | `.cursor/` | `.cursor/skills/` |
| qwen | `.qwen/` | `.qwen/skills/` |
| opencode | `.opencode/` | `.opencode/skills/` |
| codex | `.codex/` | `.codex/skills/` |
| windsurf | `.windsurf/` | `.windsurf/skills/` |
| kilocode | `.kilocode/` | `.kilocode/skills/` |
| auggie | `.augment/` | `.augment/skills/` |
| codebuddy | `.codebuddy/` | `.codebuddy/skills/` |
| qodercli | `.qoder/` | `.qoder/skills/` |
| roo | `.roo/` | `.roo/skills/` |
| kiro-cli | `.kiro/` | `.kiro/skills/` |
| amp | `.agents/` | `.agents/skills/` |
| shai | `.shai/` | `.shai/skills/` |
| agy (antigravity) | `.agent/` | `.agent/skills/` |
| bob | `.bob/` | `.bob/skills/` |

### Infrastructure
- Node.js ESM (`.js` with `"type": "module"`)
- `@clack/prompts` v0.10.0 — multiselect, confirm, spinner, log, intro, outro
- `adm-zip` v0.5.10 — zip extraction
- No build step — source = distribution

### Integration Points
- `install()` calls `promptProviders()` → needs `cwd` parameter added
- `promptProviders()` needs to detect provider folders using `fs.existsSync`
- `bin/idx-skill.js` needs to parse `--provider` flags and route to `check()` command
- `installer.js` needs a new `check(cwd)` export

## Files Mapping

### To Modify

**`cli/src/providers.js`** — Core change
- Expand PROVIDERS from 4 to 18 entries
- Fix `codex` dest: `.agent/skills/` → `.codex/skills/`
- Fix `antigravity` dest: `.agents/skills/` → `.agent/skills/`
- Add `folder` field per provider (used for auto-detection)
- Export `ALIASES` map
- Update `resolveSelected()` to handle aliases

**`cli/src/prompt.js`**
- Add `cwd` parameter to `promptProviders(cwd)`
- Detect existing provider folders via `fs.existsSync(path.join(cwd, provider.folder))`
- Pass detected keys as `initialValues` to `multiselect()`

**`cli/src/installer.js`**
- `install(cwd, providerKeys?)` — if `providerKeys` provided, skip `promptProviders()`
- Add `check(cwd)` function — iterate PROVIDERS, check folder, print status table
- `update()` — check for OLD_WRONG_PATHS (`.agent/skills/` for codex, `.agents/skills/` for antigravity) and log.warn migration notice

**`cli/bin/idx-skill.js`**
- Parse `--provider` flags (loop through args, collect values, resolve aliases, deduplicate)
- If `--provider` present: call `install(cwd, resolvedKeys)` bypassing prompts
- Add `check` command routing → `check(cwd)`
- Update help text

**`cli/src/gitignore.js`** (minor)
- `getInstalledDirs()` currently returns hardcoded paths — verify it uses `PROVIDERS[key].dest` correctly; update if needed

### To Create
- Nothing new — pure extension of existing files

## Technical Assumptions

| Assumption | Impact if Wrong |
|------------|-----------------|
| All providers use `{folder}skills/` subdir | Skills install to path agent doesn't read |
| clack `multiselect` `initialValues` accepts string[] | Auto-detection feature needs different approach |
| `fs.existsSync(folder)` reliably detects provider presence | May pre-select providers not in use |
| Alias resolution before PROVIDERS lookup is sufficient | User passes unknown alias → same error as unknown key |

## References

### Files Consulted
- `cli/src/providers.js`
- `cli/src/installer.js`
- `cli/src/prompt.js`
- `cli/bin/idx-skill.js`
- `cli/src/gitignore.js`
- `C:\github\terceiros\spec-kit\src\specify_cli\__init__.py` — AGENT_CONFIG (full provider map reference)

### Related Features
None (first feature — 0001F)

<!-- refs: none -->

## Summary for Planning

### Executive Summary
Pure data expansion in `providers.js` (4→18 entries, 2 bug fixes) + minor logic changes in 3 files: auto-detection pre-selection in `prompt.js`, `--provider` flag parsing + `check` command in `bin/idx-skill.js`, and migration warning in `installer.js`. No architectural changes required.

### Key Decisions
- `{folder}skills/` uniform destination — no per-provider subdir complexity
- `folder` field added to each provider entry — enables auto-detection without separate config
- ALIASES exported from `providers.js` — single source of truth for key normalization

### Critical Files
- `cli/src/providers.js` — all 18 provider entries + ALIASES + `folder` field
- `cli/bin/idx-skill.js` — `--provider` flag parsing + `check` command routing
