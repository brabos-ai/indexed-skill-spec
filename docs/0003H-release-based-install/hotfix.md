# Hotfix: Installer downloads branch instead of latest release

> **ID:** 0003H
> **Branch:** hotfix/0003H-release-based-install
> **Created:** 2026-03-13 00:00
> **Priority:** High

---

## Problem Description

- **What is happening:** The CLI installer (`install` and `update` commands) always downloads assets from the hardcoded `main` branch instead of the latest GitHub release. Users get unreleased/unstable code and have no way to pin a specific version.
- **Expected behavior:** `install` should download the latest release by default, with `--version <tag>` to install a specific older release. `update` should show current → latest version and update accordingly.
- **Impact:** User-facing — all install/update operations affected
- **Affected area:** CLI — `github.js`, `installer.js`, `prompt.js`, `manifest.js`, `bin/idx-skill.js`

## Investigation

### Steps to Reproduce

1. Run `idx-skill install`
2. Observe download URL used: `archive/refs/heads/main.zip`
3. Expected URL: `archive/refs/tags/<latest-release>.zip`

### Root Cause Analysis

`installer.js` hardcodes `downloadBranchZip('main')` in both `install()` and `update()`.
`github.js` only has a `downloadBranchZip()` function — no GitHub Releases API integration.
`manifest.json` does not record the installed version.
`bin/idx-skill.js` has no `--version` flag.

## Solution

### Approach

Add GitHub Releases API support to `github.js` (fetch latest, fetch list, download by tag).
Add `version` field to manifest. Add `promptVersion()` to `prompt.js`. Update `installer.js` to
use releases by default and accept a version param. Parse `--version <tag>` in `bin/idx-skill.js`.

### Files Modified

- `cli/src/github.js` - Add `fetchLatestRelease()`, `fetchReleases()`, `downloadTagZip()`
- `cli/src/manifest.js` - Add `version` param to `writeManifest()`
- `cli/src/prompt.js` - Add `promptVersion(releases)`
- `cli/src/installer.js` - Use releases in `install()` and `update()`
- `cli/bin/idx-skill.js` - Parse `--version` flag, update help

### Changes Made

- `fetchLatestRelease()` calls `api.github.com/repos/{repo}/releases/latest`
- `fetchReleases(limit)` returns list of releases for version selection prompt
- `downloadTagZip(tag)` downloads `archive/refs/tags/{tag}.zip`
- `writeManifest` gains `version` parameter saved as `manifest.version`
- `promptVersion(releases)` shows clack `select` with latest pre-selected
- `install()` signature: `install(cwd, providerKeys, version)` — version skips prompt
- `update()` fetches latest, compares with `manifest.version`, shows `v1.x → v1.y`
- CLI flag `--version <tag>` parsed and forwarded to `install()`

## Verification

- [x] Bug no longer reproduces
- [x] Build passes — 81/81 tests passing
- [x] Related functionality still works (install, update, list, check all OK)
- [x] No regressions in adjacent code paths
- [x] Edge cases covered (already-up-to-date, release fetch failure, download failure)

## Notes

Based on brainstorm session 2026-03-13. Decisions: latest by default (no prompt), `--version` skips prompt, update shows from→to version, manifest stores version.
