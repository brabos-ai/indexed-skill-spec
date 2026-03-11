# Past Features Analysis: 0002F

## Related Features

| Feature | Relation | Key Files | Impact on 0002F |
|---------|----------|-----------|-----------------|
| **0001F: Multi-Provider Install** | **shares-domain** | `cli/src/providers.js`, `cli/bin/idx-skill.js`, `cli/src/installer.js` | 0001F establishes the CLI infrastructure that installs skill bundles to all 18 providers. 0002F creates the skill content; 0001F ensures it reaches all provider directories. 0002F must output a skill directory that passes `idx-skill install` validation. |

## Key Patterns to Follow

### 1. Skill Directory Structure
Pattern from `gemini-nano-banana` example (proven structure):
```
skills/vercel-ai-sdk/
├── SKILL.md              # Tier 2 entry point with YAML frontmatter + INDEX
└── sections/
    ├── foundations.md
    ├── core.md
    ├── ui.md
    ├── agents.md
    ├── getting-started.md
    ├── advanced.md
    ├── reference.md
    └── troubleshooting.md
```

### 2. SKILL.md Frontmatter Pattern
```yaml
---
name: vercel-ai-sdk
description: >
  [2-3 sentence summary for agents]
indexed-skill: tier 2
---
```
- `name:` must match filesystem folder name
- `indexed-skill: tier 2` is the detection key for agents
- INDEX block ≤ 30 lines

### 3. Section File Pattern
```markdown
<!-- SECTION:section-id | keywords: comma,separated,keywords | Display Title -->
## Display Title
[Content: 80–200 lines per section]
<!-- /SECTION:section-id -->
```

### 4. INDEX Format (exact)
```markdown
<!-- INDEX
@sections/foundations.md | foundations | description
@sections/core.md | core-apis | description
-->
```

## Key Decisions That Constrain 0002F

| Decision (from 0001F) | Impact on 0002F |
|----------------------|-----------------|
| Skill dest: `{folder}skills/` uniform across all providers | Skill installs to `.claude/skills/vercel-ai-sdk/`, `.gemini/skills/vercel-ai-sdk/`, etc. Must be self-contained. |
| Auto-detection via `fs.existsSync` | Skill install is predictable. No provider-specific variants needed. |
| Data-only approach (PROVIDERS map) | CLI is conservative. Skill structure must be resilient to minor CLI updates. |

## What to Reuse

- **Tier 2 SKILL.md structure** from `examples/tier2-example/SKILL.md`
- **SECTION marker syntax** from `gemini-nano-banana` sections
- **INDEX format** — exact match required for agent detection
- **Keywords taxonomy** — use real Vercel AI SDK API names as keywords (`generateText`, `useChat`, `streamText`, etc.)

## Summary

0002F relies on 0001F's CLI infrastructure for delivery and follows `gemini-nano-banana`'s directory structure as the proven Tier 2 pattern. The key challenge is content synthesis: distilling 90+ Vercel AI SDK .mdx docs into ~8 focused, agent-scannable section files.
