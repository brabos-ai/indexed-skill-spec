# Review: F0001-indexed-skill-cli

> **Date:** 2026-03-09 | **Branch:** feature/F0001-indexed-skill-cli

---

## Quality Gate Report

| Gate | Status | Details |
|------|--------|---------|
| Build | PASSED | `npm test` — 20/20 tests pass, 0 failures |
| Spec Compliance | PASSED | 55/55 items COMPLIANT |
| Code Review Score | PASSED | 9.5/10 |
| Product Validation | PASSED | RF: 12/12, RN: 4/4 |
| Startup Test | SKIPPED | CLI package — no IoC/DI |
| **Overall** | **PASSED** | **Ready for merge** |

> Reviewed at: 2026-03-09
> Reviewed by: /add-review (model: claude-opus-4-6)

---

## Spec Compliance Audit

**Source:** Spec Checklist (plan.md `## Spec Checklist`)
**Total items:** 55
**SPEC_AUDIT_STATUS: COMPLIANT (55/55)**

### Files (13/13 COMPLIANT)

| File | Status |
|------|--------|
| `cli/package.json` | COMPLIANT |
| `cli/bin/idx-skill.js` | COMPLIANT |
| `cli/src/providers.js` | COMPLIANT |
| `cli/src/github.js` | COMPLIANT |
| `cli/src/manifest.js` | COMPLIANT |
| `cli/src/gitignore.js` | COMPLIANT |
| `cli/src/prompt.js` | COMPLIANT |
| `cli/src/installer.js` | COMPLIANT |
| `cli/test/providers.test.js` | COMPLIANT |
| `cli/test/gitignore.test.js` | COMPLIANT |
| `cli/test/manifest.test.js` | COMPLIANT |
| `.github/workflows/ci.yml` | COMPLIANT |
| `.github/workflows/release.yml` | COMPLIANT |

### Commands (3/3 COMPLIANT)

| Command | Found at | Status |
|---------|----------|--------|
| `install` (default) | bin/idx-skill.js:39,42 | COMPLIANT |
| `update` | bin/idx-skill.js:44 | COMPLIANT |
| `list` | bin/idx-skill.js:46 | COMPLIANT |

### Functions (17/17 COMPLIANT)

| Function | File:Line | Status |
|----------|-----------|--------|
| `resolveSelected(keys)` | providers.js:38 | COMPLIANT |
| `downloadBranchZip(branch?, repo?)` | github.js:12 | COMPLIANT |
| `writeManifest(cwd, providers, files)` | manifest.js:27 | COMPLIANT |
| `readManifest(cwd)` | manifest.js:57 | COMPLIANT |
| `writeGitignoreBlock(cwd, dirs)` | gitignore.js:44 | COMPLIANT |
| `hasBlock(cwd)` | gitignore.js:30 | COMPLIANT |
| `getInstalledDirs(selectedKeys)` | gitignore.js:14 | COMPLIANT |
| `promptProviders()` | prompt.js:11 | COMPLIANT |
| `promptGitignore()` | prompt.js:37 | COMPLIANT |
| `install(cwd)` | installer.js:54 | COMPLIANT |
| `update(cwd)` | installer.js:118 | COMPLIANT |
| `list(cwd)` | installer.js:170 | COMPLIANT |
| `copyFromZip(...)` (internal) | installer.js:23 | COMPLIANT |
| `main()` | bin/idx-skill.js:21 | COMPLIANT |
| `PROVIDERS` (export const) | providers.js:6 | COMPLIANT |
| `BLOCK_START` (export const) | gitignore.js:5 | COMPLIANT |
| `BLOCK_END` (export const) | gitignore.js:6 | COMPLIANT |

### Test Cases (20/20 COMPLIANT)

| Suite | Tests | Status |
|-------|-------|--------|
| providers.test.js | 5/5 | COMPLIANT |
| gitignore.test.js | 8/8 | COMPLIANT |
| manifest.test.js | 7/7 | COMPLIANT |

### GitHub Actions (2/2 COMPLIANT)

| Workflow | Checks | Status |
|----------|--------|--------|
| ci.yml | Triggers, matrix [18,20,22], working-dir, steps | COMPLIANT |
| release.yml | Tags v*, id-token:write, Node 20, registry-url, --provenance, NPM_TOKEN | COMPLIANT |

### RF/RN Cross-Reference (16/16 COMPLIANT)

| ID | Requirement | Covered by | Status |
|----|-------------|-----------|--------|
| RF01 | Interactive install with 4 providers | bin + prompt + installer | COMPLIANT |
| RF02 | claudecode → `.claude/skills/` | providers.js:11 | COMPLIANT |
| RF03 | codex → `.agent/skills/` | providers.js:17 | COMPLIANT |
| RF04 | antigravity → `.agents/skills/` | providers.js:23 | COMPLIANT |
| RF05 | opencode → `.opencode/skills/` | providers.js:29 | COMPLIANT |
| RF06 | `.gitignore` block on confirm | gitignore.js + installer.js:104 | COMPLIANT |
| RF07 | Manifest written on install | manifest.js + installer.js:109 | COMPLIANT |
| RF08 | `update` re-installs from manifest | installer.js:150 | COMPLIANT |
| RF09 | `list` shows providers, dirs, date | installer.js:177-190 | COMPLIANT |
| RF10 | Tests pass Node 18/20/22 | ci.yml matrix + 20/20 local | COMPLIANT |
| RF11 | CI on PR + push main | ci.yml:3-6 | COMPLIANT |
| RF12 | Release --provenance on v* | release.yml:35 | COMPLIANT |
| RN01 | No providers → graceful cancel | installer.js:59-62 | COMPLIANT |
| RN02 | No gitignore duplicates | gitignore.js:58-63 | COMPLIANT |
| RN03 | Update without manifest → error | installer.js:120-122 | COMPLIANT |
| RN04 | GitHub unreachable → clear error | github.js:58-59 | COMPLIANT |

---

## Code Review Summary

**Files Reviewed:** 13 (8 source + 3 test + 2 workflow)

### Issues Found and Fixed During Review

| # | File | Severity | Issue | Fix Applied |
|---|------|----------|-------|-------------|
| 1 | installer.js:183-188 | Medium | `list()` used hardcoded `PROVIDERS_MAP` inline instead of importing `PROVIDERS` — stale data risk if provider dests change | Replaced with `PROVIDERS[key]?.dest` using existing import |
| 2 | installer.js:90-97 | Medium | Missing "already installed" warning from about.md: "Provider ja instalado no install: sobrescrever com log de aviso" | Added `fs.existsSync(destDir)` check with `log.warn()` before overwrite |

### Code Quality Notes (Low — not fixed, acceptable)

- `bin/idx-skill.js:54` — `USER_CANCEL` checked via string comparison on `err.message`. Standard CLI pattern, no class hierarchy needed.

### Security Review

- No injection risks: no dynamic shell, no SQL, no path traversal beyond controlled `path.join(cwd, ...)`
- No sensitive data exposure — no credentials logged or stored
- adm-zip extraction filtered by known prefix — no zip-slip risk
- `node:https` redirect handling: no infinite loop guard, but acceptable for known GitHub URL
- No hardcoded tokens

### TDD Test Coverage Assessment

| Module | Has Tests | Coverage | Notes |
|--------|-----------|----------|-------|
| providers.js | Yes (5) | Full | All exports tested with edge cases |
| gitignore.js | Yes (8) | Full | Create, duplicate, hasBlock, getInstalledDirs |
| manifest.js | Yes (7) | Full | Write, read, null, hashes SHA-256, ISO date |
| installer.js | No | None | Requires mocking (network, AdmZip, prompts) |
| github.js | No | None | Requires network mocking |
| prompt.js | No | None | Requires @clack/prompts mocking |
| bin/idx-skill.js | No | None | CLI entry point |

**TDD Verdict:** Pure utility modules (providers, gitignore, manifest) have comprehensive spec-driven tests — 20 tests covering all 20 spec assertions from plan.md. Orchestration/integration layer (installer, github, prompt, bin) has no unit tests. This is a common pattern for CLIs — integration testing via manual or E2E is typical, but unit-level coverage for these modules would strengthen confidence.

### Severity Summary

- Critical: 0
- High: 0
- Medium: 2 (both fixed)
- Low: 1 (noted, acceptable)

**CODE_SCORE: 9.5/10**

---

## Product Validation

### RF Implemented: 12/12

All functional requirements verified with file:line references.

### RN Implemented: 4/4

All business rules verified with file:line references.

### Edge Cases (from about.md)

| Edge Case | Implementation | Status |
|-----------|---------------|--------|
| Provider already installed | installer.js:93-95 warn + overwrite | COMPLIANT (fixed in review) |
| GitHub inaccessible | github.js:58-59 | COMPLIANT |
| No provider selected | installer.js:59-62 | COMPLIANT |
| `.gitignore` already has block | gitignore.js:58-63 | COMPLIANT |
| `update` without prior install | installer.js:120-122 | COMPLIANT |
| `skills/` empty in ZIP | installer.js:96-98 per-provider warning | COMPLIANT |

### Prerequisites: OK

- Dependencies declared in package.json
- package-lock.json present
- Node >=18.0.0 in engines
- ESM type declared
- Shebang correct
- Publish scope correct (files field)

**PRODUCT_STATUS: PASSED**
