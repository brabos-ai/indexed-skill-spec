# Review: 0001F-multi-provider-install

> **Date:** 2026-03-10 | **Branch:** feature/0001F-multi-provider-install

## Quality Gate Report

| Gate | Status | Details |
|------|--------|---------|
| Build | ✅ PASSED | No build step — source = distribution |
| Spec Compliance | ✅ PASSED | 12/12 items compliant |
| Code Review Score | ✅ PASSED | 10/10 |
| Product Validation | ✅ PASSED | All 10 ACs implemented |
| Startup Test | ⚠️ SKIPPED | CLI tool — no server startup |
| **Overall** | **✅ PASSED** | **Ready for merge** |

> Reviewed at: 2026-03-10T15:25:00Z
> Reviewed by: /add-review (model: claude-sonnet-4-6)

---

## Spec Compliance Audit

**Source:** Prose extraction (no plan.md)
**Total items:** 12

| Item | Type | Expected | Found at | Status |
|------|------|----------|----------|--------|
| PROVIDERS: 18 entries w/ label/hint/src/dest/folder | Data | 18 entries | providers.js:7-134 | ✅ COMPLIANT |
| codex dest: `.codex/skills` | Bug fix | `.codex/skills` | providers.js:54 | ✅ COMPLIANT |
| antigravity dest: `.agent/skills` | Bug fix | `.agent/skills` | providers.js:124 | ✅ COMPLIANT |
| ALIASES: `agy → antigravity` | Data | `agy → antigravity` | providers.js:140 | ✅ COMPLIANT |
| ALIASES: `kiro-cli → kiro` | Data | `kiro-cli → kiro` | providers.js:141 | ✅ COMPLIANT |
| `--provider` flag parsing + dedup | CLI | Collect, resolve aliases, deduplicate | bin/idx-skill.js:50-64 | ✅ COMPLIANT |
| `check` command routing | CLI | `check(cwd)` dispatch | bin/idx-skill.js:75-76 | ✅ COMPLIANT |
| `install(cwd, providerKeys?)` skip prompts | Function | Skip prompts if providerKeys provided | installer.js:63 | ✅ COMPLIANT |
| `check(cwd)` detection table | Function | Print ✅/❌ per provider | installer.js:222-236 | ✅ COMPLIANT |
| `update()` migration warning | Function | Warn for OLD_WRONG_PATHS | installer.js:142-150 | ✅ COMPLIANT |
| `promptProviders(cwd)` auto-detect | Function | Detect folders, pass as initialValues | prompt.js:14-36 | ✅ COMPLIANT |
| Unknown `--provider` error + exit 1 | Validation | Error message + exit 1 | bin/idx-skill.js:54-58 | ✅ COMPLIANT |

**COMPLIANT:** 12/12
**SPEC_AUDIT_STATUS:** ✅ COMPLIANT

---

## Code Review Summary

**Files Reviewed:** 9 (providers.js, prompt.js, installer.js, bin/idx-skill.js, gitignore.js, manifest.js, providers.test.js, prompt.test.js, installer.test.js, installer-mocked.test.js)

**Issues Found & Fixed:**

| File | Line | Severity | Issue | Fix |
|------|------|----------|-------|-----|
| bin/idx-skill.js | 24-25 | 🟠 Medium | Help examples used `--provider claude` (invalid key) | Changed to `--provider claudecode` |
| bin/idx-skill.js | 42 | 🟢 Low | `const require` shadows TS global type → false "never read" warning | Renamed to `const req` |
| installer.js | 63, 75 | 🟡 High | `if (providerKeys)` truthy for `[]`, bypassing prompts with empty array | Changed to `if (providerKeys && providerKeys.length > 0)` |
| providers.js | 150-157 | 🟡 High | `resolveSelected()` silently spread `undefined` for unknown keys → cryptic TypeError downstream | Added explicit `throw new Error('Unknown provider key: "..."')` guard |
| about.md | 91 | 🟢 Low | AC03 alias direction inverted (`kiro → kiro-cli` should be `kiro-cli → kiro`) | Corrected spec text |
| providers.test.js | new | 🟠 Medium | No test for `resolveSelected()` unknown key throw path | Added test |
| installer-mocked.test.js | new | 🟠 Medium | No test for `install(cwd, [])` edge case | Added test |

**Severity Summary:**
- 🔴 Critical: 0
- 🟡 High: 2 fixed
- 🟠 Medium: 3 fixed
- 🟢 Low: 2 fixed

**Test Results:** 78/78 passing (76 original + 2 new)

---

## Product Validation

| AC | Description | Status |
|----|-------------|--------|
| AC01 | PROVIDERS map has 18 entries, all with correct dest paths | ✅ |
| AC02 | codex dest `.codex/skills/`, antigravity dest `.agent/skills/` | ✅ |
| AC03 | ALIASES resolves `agy → antigravity`, `kiro-cli → kiro` | ✅ |
| AC04 | `promptProviders(cwd)` pre-selects providers whose folders exist | ✅ |
| AC05 | `idx-skill install --provider claudecode` installs without prompts | ✅ |
| AC06 | `idx-skill install --provider claudecode --provider gemini` installs both | ✅ |
| AC07 | Unknown `--provider` key prints error with valid provider list | ✅ |
| AC08 | `idx-skill check` prints detected/not-detected status for all providers | ✅ |
| AC09 | `idx-skill update` shows migration warning if old wrong paths found | ✅ |
| AC10 | All existing `install`, `update`, `list` flows still work unchanged | ✅ |

**Product Status:** ✅ PASSED
