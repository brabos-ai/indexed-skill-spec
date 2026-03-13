# Related Work Items

> **Updated:** 2026-03-13

---

## Features

| ID | Title | Relationship |
|-------|-------|--------------|
| 0001F | multi-provider-install | Direct dependency — this hotfix extends the CLI installer and bin routing introduced in 0001F |

## Hotfixes

| ID | Title | Status |
|-------|-------|--------|
| 0003H | release-based-install | Active |

## Refactors

_None_

## Other References

### External Documentation
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)

---

## Timeline

- **0001F** introduced the CLI installer, `--provider` flag, and `github.js`
- **0003H** adds GitHub Releases support on top of 0001F — `install` now downloads releases instead of branch zips, and `update` shows version diffs
