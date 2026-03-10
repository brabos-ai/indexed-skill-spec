# Task: Multi-Provider Install Support

> **Branch:** feature/0001F-multi-provider-install
> **Feature:** 0001F
> **Date:** 2026-03-09

---

## Objective

Expand the `idx-skill` CLI to support installation of indexed skills across all major AI provider directories, with interactive provider selection, auto-detection of installed tools, and a `check` command.

## Business Context

- **Why:** The CLI currently supports only 4 providers (claudecode, codex, antigravity, opencode) — two with incorrect destination paths. Users of Gemini, Cursor, Copilot, Windsurf, Kiro, Amp, and 10+ other agents cannot install indexed skills without manual path lookup.
- **Problem:** Discovery friction + incorrect paths in existing installs → users fail silently or install to wrong directories.
- **Stakeholders:** Developers using any AI coding agent who want indexed skills available as skills in their agent's configuration directory.

## Scope

### Included
- Expand `PROVIDERS` map to 18 providers with correct destination paths (full spec-kit parity)
- Fix existing incorrect paths: `codex` (`.agent/` → `.codex/`) and `antigravity` (`.agents/` → `.agent/`)
- Migration warning when old wrong paths are detected during update
- Auto-detection: scan cwd for existing provider folders and pre-select them in interactive prompt
- `--provider <key>` flag (repeatable) for non-interactive install: `idx-skill install --provider claude --provider gemini`
- `idx-skill check` command — list which providers are detected in current directory
- `ALIASES` map for common shorthand keys (e.g., `agy` → `antigravity`, `kiro` → `kiro-cli`)
- All providers include `hint` field showing destination path in interactive prompt

### Not Included
- Checking if provider CLI is installed globally (system tool detection)
- `update --provider` selective update flag (later)
- Provider-specific skill filtering (all providers get all skills)
- Publishing/uploading skills

## Business Rules

### Validations
- If `--provider` is used with unknown key (not in PROVIDERS or ALIASES), show error + list valid keys
- If provider folder already has files, warn and offer overwrite (preserve existing behavior)
- If no providers selected in interactive mode, abort with message (preserve existing behavior)

### Flows

**Happy Path (interactive):**
1. User runs `idx-skill install`
2. CLI scans cwd for existing provider folders → detects which are present
3. Multi-select shows all 18 providers, pre-selecting detected ones
4. User confirms/adjusts selection
5. CLI downloads zip, copies skills to each selected provider's `{folder}skills/` path
6. `.gitignore` updated, manifest saved

**Happy Path (non-interactive):**
1. User runs `idx-skill install --provider claude --provider gemini`
2. CLI validates both keys (including ALIASES resolution)
3. Downloads + installs to correct paths
4. Done — no interactive prompts shown

**Happy Path (check):**
1. User runs `idx-skill check`
2. CLI scans cwd for each known provider folder
3. Prints table: `✅ .claude/  → claudecode`, `❌ .gemini/ not found`, etc.

**Error:**
1. Unknown `--provider` key → `"Unknown provider: foo. Valid providers: claude, gemini, ..."` + exit 1

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Provider destination | `{folder}skills/` uniform for all | Indexed skills are skill specs, not built-in commands; consistent subdir regardless of provider conventions |
| Auto-detection | Check `fs.existsSync(cwd + folder)` per provider | Non-invasive; pre-selects without forcing |
| Alias resolution | ALIASES map resolved before PROVIDERS lookup | Same pattern as spec-kit, prevents "unknown provider" frustration |
| Path fix strategy | Fix in PROVIDERS data + warn on update if old path found | Data-only fix; migration notice guides users |
| New providers added | Full spec-kit parity (18 providers) | Zero-risk pure data expansion; eliminates future "add X" requests |

## Edge Cases

| Name | Description | Strategy |
|------|-------------|----------|
| Old wrong path exists | User already installed codex to `.agent/skills/` | Warn during `update` that old path exists, suggest manual cleanup |
| Alias used with --provider | User passes `--provider agy` | Resolve through ALIASES before PROVIDERS lookup |
| Multiple `--provider` with duplicate | `--provider claude --provider claude` | Deduplicate silently |
| Provider folder exists but empty | `.gemini/` exists but empty | Still pre-select (folder presence = user has the agent) |

## Acceptance Criteria

- [ ] `PROVIDERS` map has 18 entries, all with correct `dest` paths
- [ ] `codex` dest is `.codex/skills/`, `antigravity` dest is `.agent/skills/`
- [ ] `ALIASES` resolves `agy → antigravity`, `kiro-cli → kiro` (and any other common aliases)
- [ ] `promptProviders(cwd)` pre-selects providers whose folders exist in `cwd`
- [ ] `idx-skill install --provider claude` installs without prompts
- [ ] `idx-skill install --provider claude --provider gemini` installs both
- [ ] Unknown `--provider` key prints error with valid provider list
- [ ] `idx-skill check` prints detected/not-detected status for all providers
- [ ] `idx-skill update` shows migration warning if old wrong paths are found
- [ ] All existing `install`, `update`, `list` flows still work unchanged

## Spec (Token-Efficient)

```
PROVIDERS shape (per entry):
  { label: string, hint: string, src: string, dest: string, folder: string }

Full PROVIDERS map (18 entries):
  claudecode  → .claude/skills/
  gemini      → .gemini/skills/
  copilot     → .github/skills/
  cursor      → .cursor/skills/
  qwen        → .qwen/skills/
  opencode    → .opencode/skills/
  codex       → .codex/skills/
  windsurf    → .windsurf/skills/
  kilocode    → .kilocode/skills/
  auggie      → .augment/skills/
  codebuddy   → .codebuddy/skills/
  qodercli    → .qoder/skills/
  roo         → .roo/skills/
  kiro        → .kiro/skills/
  amp         → .agents/skills/
  shai        → .shai/skills/
  antigravity → .agent/skills/
  bob         → .bob/skills/

ALIASES map:
  agy   → antigravity
  kiro-cli → kiro

bin/idx-skill.js changes:
  - Parse --provider flags (collect array, deduplicate, resolve aliases)
  - If --provider present: skip prompts, call install(cwd, providerKeys)
  - Add `check` command → calls check(cwd)

installer.js changes:
  - install(cwd, providerKeys?) — if providerKeys provided, skip promptProviders()
  - check(cwd) — iterate PROVIDERS, check folder existence, print table
  - update(): check for OLD_WRONG_PATHS (codex → .agent/, antigravity → .agents/) and warn

prompt.js changes:
  - promptProviders(cwd) — detect existing folders, pass as initialValues to multiselect()
```

## Next Steps

→ `/add-plan` for technical planning
→ `/add-dev` to implement directly (changes are contained to 3 files)
