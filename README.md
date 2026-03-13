# Indexed Skills Specification (ISS) v0.1

> An open standard for surgical context loading in AI Agent Skills.

---

## Quick Install

Install the `idx-skill` CLI and add indexed skills to your AI agent project in seconds.

**Requires Node.js >= 18.**

```bash
# One-off (no install required)
npx idx-skill install

# Or install globally
npm install -g idx-skill
idx-skill install
```

The interactive prompt detects which AI providers are configured in your project (`.claude/`, `.gemini/`, `.cursor/`, etc.) and lets you pick where to install.

### Non-interactive install

```bash
# Install for a specific provider
npx idx-skill install --provider claudecode

# Install for multiple providers at once
npx idx-skill install --provider claudecode --provider gemini
```

### Supported providers

| Key | Provider | Install path |
|-----|----------|--------------|
| `claudecode` | Claude Code | `.claude/skills/` |
| `gemini` | Gemini CLI | `.gemini/skills/` |
| `copilot` | GitHub Copilot | `.github/skills/` |
| `cursor` | Cursor | `.cursor/skills/` |
| `opencode` | OpenCode | `.opencode/skills/` |
| `windsurf` | Windsurf | `.windsurf/skills/` |
| `codex` | Codex (OpenAI) | `.codex/skills/` |
| `roo` | Roo Code | `.roo/skills/` |
| `kiro` | Kiro | `.kiro/skills/` |
| `amp` | Amp | `.agents/skills/` |
| `auggie` | Augment | `.augment/skills/` |
| `kilocode` | Kilocode | `.kilocode/skills/` |
| `qwen` | Qwen | `.qwen/skills/` |
| `codebuddy` | CodeBuddy | `.codebuddy/skills/` |
| `qodercli` | Qoder CLI | `.qoder/skills/` |
| `shai` | Shai | `.shai/skills/` |
| `antigravity` | Antigravity (Google) | `.agent/skills/` |
| `bob` | Bob | `.bob/skills/` |

---

## CLI Reference

```
Usage: idx-skill [command] [options]

Commands:
  install   Install indexed skills (default)
  update    Update installed skills
  list      List installed skills
  check     Show which AI providers are detected in current directory
  lint      Validate indexed skill structure
  doctor    Diagnose indexed skill issues with suggestions

Options:
  --provider <key>   Install for a specific provider (repeatable, skips prompts)
  --json             Output JSON for lint/doctor
  -h, --help         Show help
  -v, --version      Show version
```

### Examples

```bash
# Interactive install (auto-detects providers)
npx idx-skill install

# Install for Claude Code only (no prompts)
npx idx-skill install --provider claudecode

# Update installed skills to latest version
npx idx-skill update

# See what AI providers are detected in the current directory
npx idx-skill check

# List installed skills
npx idx-skill list

# Validate an indexed skill's structure (errors only)
npx idx-skill lint skills/my-skill

# Full diagnostic report with warnings and suggestions
npx idx-skill doctor skills/my-skill

# Machine-readable JSON output for CI pipelines
npx idx-skill lint skills/my-skill --json
```

---

## The Problem

Current Agent Skills follow a two-level progressive disclosure model:

```
Level 1: YAML frontmatter   ->  ~5 lines   (always loaded)
Level 2: SKILL.md body       ->  up to 3000+ lines (all or nothing)
```

If a skill contains 3000 lines and the agent only needs 80 lines about authentication, it still loads **all 3000 lines**. This wastes context window capacity, increases latency, and drives up cost.

**What ISS proposes:** a tier-based inline indexing system that lets agents load only the sections they need, without external index files or extra tooling.

```
Level 1: YAML frontmatter     ->  ~10 lines  (detection)
Level 2: Inline INDEX block    ->  ~20 lines  (topic selection)
Level 3: Targeted SECTION      ->  ~80 lines  (execution)
Total: ~110 lines loaded, not 3000
```

---

## Solution Overview

ISS adds lightweight inline markers directly inside Markdown files. There are no external JSON indexes or databases. Everything lives in standard Markdown comments that are invisible to human readers but machine-parseable by agents.

| Tier | Use Case | Structure |
|------|----------|-----------|
| **Tier 1** | Small-to-medium skills (single file) | INDEX and SECTION markers all in one `SKILL.md` |
| **Tier 2** | Large skills (multiple files) | INDEX in `SKILL.md` pointing to files; SECTION markers in each file |

---

## Detection

An agent detects an indexed skill by reading the YAML frontmatter and looking for the `indexed-skill` field:

```yaml
---
name: my-skill
indexed-skill: tier 1
---
```

```yaml
---
name: my-large-skill
indexed-skill: tier 2
---
```

If the field is absent, the skill is not indexed and should be consumed normally. This makes ISS fully backward-compatible with existing Agent Skills.

---

## Tier 1 -- Single File

Everything lives in a single `SKILL.md`. The file contains:

1. YAML frontmatter with `indexed-skill: tier 1`
2. An `<!-- INDEX -->` block mapping section IDs to topics
3. `<!-- SECTION -->` / `<!-- /SECTION -->` markers wrapping each content block

### Example

```markdown
---
name: my-skill
indexed-skill: tier 1
---
# My Skill

Brief description of what this skill does.

<!-- INDEX
@auth-overview | authentication | OAuth2, JWT, API Key setup
@auth-jwt | jwt | Token generation and validation
@billing | billing | Stripe integration and webhooks
-->

<!-- SECTION:auth-overview | keywords: auth,login,oauth | Authentication methods overview -->
## Authentication Overview

OAuth2 is the primary authentication method...
(content here)

<!-- RELATED: #auth-jwt -->

<!-- /SECTION:auth-overview -->

<!-- SECTION:auth-jwt | keywords: jwt,token,bearer,refresh | JWT token generation and validation -->
## JWT Implementation

To generate a JWT token...
(content here)

<!-- RELATED: #auth-overview -->

<!-- /SECTION:auth-jwt -->

<!-- SECTION:billing | keywords: billing,stripe,payment,webhook | Stripe integration and webhooks -->
## Billing

Stripe is used for all payment processing...
(content here)

<!-- /SECTION:billing -->
```

### How it works

- The **INDEX block** gives the agent a lightweight map of all available sections without reading the full content.
- Each **SECTION marker** wraps a self-contained block of content that can be read independently.
- The agent matches the user's intent against index entries (by topic and description), then reads only the matching sections.

---

## Tier 2 -- Multiple Files

For large skills, content is split across multiple files. `SKILL.md` contains only the frontmatter, description, and a file-level INDEX. Each referenced file contains its own SECTION markers.

### SKILL.md

```markdown
---
name: my-large-skill
indexed-skill: tier 2
---
# My Large Skill

Brief description of what this skill covers.

<!-- INDEX
@sections/auth.md | authentication | OAuth2, JWT, API Key setup and validation
@sections/billing.md | billing | Stripe integration, plans, webhooks
-->
```

### sections/auth.md

```markdown
<!-- SECTION:auth-overview | keywords: auth,login,oauth | Authentication methods overview -->
## Authentication Overview

OAuth2 is the primary authentication method...
(content here)

<!-- /SECTION:auth-overview -->

<!-- SECTION:auth-jwt | keywords: jwt,token,bearer,refresh | JWT token generation and validation -->
## JWT Implementation

To generate a JWT token...
(content here)

<!-- RELATED: sections/billing.md#billing-webhooks -->

<!-- /SECTION:auth-jwt -->
```

### sections/billing.md

```markdown
<!-- SECTION:billing-overview | keywords: billing,stripe,payment | Stripe integration overview -->
## Billing Overview

All payments are processed through Stripe...
(content here)

<!-- /SECTION:billing-overview -->

<!-- SECTION:billing-webhooks | keywords: webhook,event,stripe | Webhook setup and handling -->
## Webhooks

Configure Stripe webhooks to receive payment events...
(content here)

<!-- /SECTION:billing-webhooks -->
```

### How it works

- The agent reads `SKILL.md` and its file-level INDEX to identify which files are relevant.
- It then reads only the relevant file(s) and scans their SECTION markers to find the exact content needed.
- This two-step narrowing keeps context loading minimal even for very large skills.

---

## Marker Format

### Index entries

Format: `@{target} | {topic} | {description}`

- **Tier 1:** target is a section ID (e.g., `@auth-overview`)
- **Tier 2:** target is a file path relative to the skill root (e.g., `@sections/auth.md`)

Index entries are wrapped in an INDEX block:

```markdown
<!-- INDEX
@target1 | topic1 | Description of first entry
@target2 | topic2 | Description of second entry
-->
```

### Section markers

**Open:** `<!-- SECTION:{id} | keywords: {kw1,kw2,...} | {description} -->`

**Close:** `<!-- /SECTION:{id} -->`

The `id` must be unique within the file. Keywords are comma-separated, no spaces after commas. The description is a short human-readable summary.

### Related markers

Use RELATED markers to link sections with strong conceptual dependencies.
They are optional but recommended when a reader may need adjacent context to
complete the task.

**Same file:** `<!-- RELATED: #section-id -->`

**Other file:** `<!-- RELATED: path/to/file.md#section-id -->`

Place RELATED markers immediately before the section close marker. Use one
RELATED marker per reference.

---

## Regex Patterns

Agents should use these patterns to parse ISS markers:

| Marker | Regex |
|--------|-------|
| Index entry | `@(.+?) \| (.+?) \| (.+)` |
| Section open | `<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->` |
| Section close | `<!-- /SECTION:(\S+) -->` |
| Related ref | `<!-- RELATED: (.+?) -->` |

---

## Agent Consumption Algorithm

### Tier 1

```
1. Read SKILL.md frontmatter
   -> Detect `indexed-skill: tier 1`

2. Grep for `<!-- INDEX` in SKILL.md
   -> Parse all `@id | topic | description` entries

3. Match relevant sections
   -> Compare user intent against topic and description fields

4. For each matched section ID:
   a. Grep `<!-- SECTION:id -->` -> get start line
   b. Grep `<!-- /SECTION:id -->` -> get end line
   c. Read only that line range from SKILL.md

5. Check for `<!-- RELATED: ... -->` markers
   -> `#section-id` stays in the same file
   -> `path/file.md#section-id` loads the referenced file
   -> Follow only if the current section is insufficient
   -> Do not revisit sections already read
```

### Tier 2

```
1. Read SKILL.md frontmatter
   -> Detect `indexed-skill: tier 2`

2. Grep for `<!-- INDEX` in SKILL.md
   -> Parse all `@filepath | topic | description` entries
   -> Identify relevant file(s) by topic and description

3. In each relevant file, grep for `<!-- SECTION:` markers
   -> List all sections with their keywords and descriptions

4. Match relevant sections
   -> Compare user intent against keywords and descriptions

5. For each matched section:
   a. Grep `<!-- SECTION:id -->` -> get start line
   b. Grep `<!-- /SECTION:id -->` -> get end line
   c. Read only that line range from the target file

6. Check for `<!-- RELATED: ... -->` markers
   -> `#section-id` stays in the current file
   -> `path/file.md#section-id` loads another file
   -> Follow only if the current section is insufficient
   -> Do not revisit sections already read
```

### Key principles

- **Never load full files.** Always use the index first, then read targeted line ranges.
- **Prefer grep over full reads.** Grep for markers to find line numbers, then read only the needed range.
- **Expand if needed.** If the first section does not resolve the task, follow RELATED markers selectively.
- **Avoid loops.** Keep a set of visited section targets and do not follow the same RELATED target twice in one traversal.

---

## Ecosystem

ISS ships two companion skills that teach agents how to work with indexed skills:

| Skill | Purpose |
|-------|---------|
| `indexed-skill/SKILL.md` | Teaches agents how to **consume** indexed skills (detection, parsing, targeted reading) |
| `indexed-skill-creator/SKILL.md` | Teaches agents how to **create** indexed skills (structuring content, writing markers, validation) |

Both skills are themselves indexed, serving as living examples of the specification.

---

## Repository Structure

```
indexed-skill-spec/
├── README.md                              # This specification document
├── cli/                                   # idx-skill CLI (npx idx-skill)
│   ├── bin/idx-skill.js                   # Entry point
│   └── src/                              # installer, providers, doctor, lint
├── examples/
│   ├── tier1-example/
│   │   └── SKILL.md                       # Complete Tier 1 example
│   └── tier2-example/
│       ├── SKILL.md                       # Tier 2 entry point
│       └── sections/
│           ├── auth.md                    # Section file example
│           └── billing.md                 # Section file example
├── skills/
│   ├── indexed-skill/
│   │   └── SKILL.md                       # Consumer skill
│   └── indexed-skill-creator/
│       └── SKILL.md                       # Creator skill
└── schema/
    └── v0.1.json                          # JSON Schema for validation
```

---

## Compatibility

ISS is **fully backward-compatible** with the existing Agent Skills specification:

- `SKILL.md` still uses standard YAML frontmatter
- The `indexed-skill` field is optional metadata; agents that do not understand it simply ignore it
- INDEX and SECTION markers are HTML comments, invisible to standard Markdown renderers
- RELATED markers are optional HTML comments; agents that ignore them still get valid indexed skills
- Skills without `indexed-skill` in their frontmatter continue to work as before

---

*Indexed Skills Specification (ISS) v0.1 -- Open proposal for community contribution.*
*Inspired by: Agent Skills (Anthropic), llms.txt (Jeremy Howard/Answer.AI), database indexing techniques.*
