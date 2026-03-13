# Review: 0003H-release-based-install

> **Date:** 2026-03-13 | **Branch:** hotfix/0003H-release-based-install

## Quality Gate Report

| Gate | Status | Details |
|------|--------|---------|
| Build | ✅ PASSED | 103/103 tests passing |
| Spec Compliance | ✅ PASSED | 8/8 items compliant |
| Code Review Score | ✅ PASSED | 9/10 |
| Product Validation | ✅ PASSED | All acceptance criteria met |
| Startup Test | ⚠️ SKIPPED | CLI project — no server/app init |
| **Overall** | **✅ PASSED** | **Ready for merge** |

> Reviewed at: 2026-03-13
> Reviewed by: /add-review

---

## Spec Compliance Audit

**Source:** hotfix.md Solution section
**Total items:** 8

| Item | Expected | Found at | Status |
|------|----------|----------|--------|
| `fetchLatestRelease()` | API call to releases/latest | `github.js:10` | ✅ COMPLIANT |
| `fetchReleases(limit)` | Returns list of releases | `github.js:21` | ✅ COMPLIANT |
| `downloadTagZip(tag)` | Downloads refs/tags/{tag}.zip | `github.js:32` | ✅ COMPLIANT |
| `writeManifest(version)` | Saves version field to manifest | `manifest.js:39` | ✅ COMPLIANT |
| `promptVersion(releases)` | clack select with latest pre-selected | `prompt.js:55` | ✅ COMPLIANT |
| `install(cwd, providerKeys, version)` | version param skips prompt | `installer.js:59` | ✅ COMPLIANT |
| `update()` | Shows current→latest, short-circuits if same | `installer.js:155` | ✅ COMPLIANT |
| `--version <tag>` CLI flag | Parsed and forwarded to install() | `bin/idx-skill.js:73` | ✅ COMPLIANT |

**COMPLIANT:** 8/8
**SPEC_AUDIT_STATUS:** ✅ COMPLIANT

---

## Code Review Summary

**Files Reviewed:** 5 source + 4 test files

### Issues Found and Fixed

| File | Line | Severity | Issue | Fix Applied |
|------|------|----------|-------|-------------|
| `installer.js` | 80-100 | 🟡 High | Non-interactive mode (`--provider`) was calling `promptVersion()` instead of fetching latest silently, breaking the non-interactive contract established by the gitignore pattern | Split into `fetchLatestRelease` (non-interactive) vs `fetchReleases + promptVersion` (interactive) |
| `installer-mocked.test.js` | — | 🟠 Medium | Missing test asserting non-interactive vs interactive version resolution path | Added `'non-interactive mode (providerKeys) uses fetchLatestRelease silently instead of showing version prompt'` |

### No Issues Found
- `github.js` — Clean implementation. `fetchJson` reuses redirect logic correctly.
- `manifest.js` — Minimal, correct change.
- `prompt.js` — `promptVersion` follows same pattern as existing prompts.
- `bin/idx-skill.js` — Flag conflict (`--version` vs `-v`) correctly resolved.

**Severity Summary:**
- 🔴 Critical: 0
- 🟡 High: 1 fixed
- 🟠 Medium: 1 fixed
- 🟢 Low: 0

**Score:** 9/10

---

## Product Validation

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Install downloads latest release by default | `fetchReleases() → promptVersion()` in interactive mode | ✅ |
| `--version <tag>` skips prompt | `version` param check in `install()` | ✅ |
| `update` shows current → latest version | `log.info(\`Updating: ${currentVersion} → ${latestTag}\`)` | ✅ |
| Manifest stores installed version | `manifest.version` field via `writeManifest(..., resolvedTag)` | ✅ |
| `--provider` non-interactive uses latest silently | `fetchLatestRelease()` path (fixed in review) | ✅ |
| `update` short-circuits when already on latest | `if (currentVersion === latestTag) return` | ✅ |

**Product Status:** ✅ PASSED
