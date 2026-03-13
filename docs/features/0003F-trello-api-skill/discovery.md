# Discovery: Trello API Indexed Skill

> **Branch:** feature/0003F-trello-api-skill
> **Feature:** 0003F
> **Date:** 2026-03-13

---

## Codebase Analysis

### Existing Skill Structure

The `skills/` directory contains:

1. **Companion Skills (Tier 1):**
   - `skills/indexed-skill/SKILL.md` — Consumer skill: teaches agents how to detect and parse indexed skills
   - `skills/indexed-skill-creator/SKILL.md` — Creator skill: authoring guide for ISS-compliant skills

2. **Real-World Example (Tier 2):**
   - `skills/gemini-nano-banana/` — Direct template: SKILL.md with 7 INDEX entries, each pointing to a dedicated section file

3. **Observed Patterns:**
   - `indexed-skill: tier 2` in frontmatter is the agent detection key
   - INDEX entries: `@{filepath} | {topic} | {description}`
   - Section files contain only SECTION markers (no frontmatter)
   - Keywords are real API/product terminology
   - Content is synthesized for agent consumption, not verbatim docs

### ISS Tier 2 Pattern

```
skill-name/
├── SKILL.md                    # Frontmatter + INDEX only (≤ 30 lines)
└── sections/
    ├── {resource1}.md          # 3-10 SECTION blocks
    ├── {resource2}.md
    └── {resourceN}.md
```

### Source Material Assessment

- OpenAPI 3.0.0 spec at `docs/features/0003F-trello-api-skill/api-specs.json`
- Security schemes: APIKey (query param `key`) and APIToken (query param `token`)
- Major resource groups: Actions, Boards, Cards, Checklists, CustomFields, Emoji, Enterprises, Labels, Lists, Members, Notifications, Organizations, Plugins, Search, Tokens, Webhooks
- Natural section groupings: auth, boards, lists, cards, members, actions, search, webhooks

---

## Technical Context

### Infrastructure

- Skills in `skills/{skill-name}/` are installable via `idx-skill install`
- Destination across 18+ providers: `{provider-folder}/skills/trello-api/`
- JSON Schema validation at `schema/v0.1.json` validates frontmatter
- No CLI changes needed — 0001F already covers all 18 providers

### Dependencies

- ISS specification (README.md, examples/)
- Trello API spec (available locally at `api-specs.json`)
- `gemini-nano-banana` as direct structural template

### Integration Points

1. **Spec compliance:** `schema/v0.1.json` for frontmatter validation
2. **Agent consumption:** `indexed-skill/SKILL.md` defines the regex patterns agents use
3. **CLI distribution:** Already handled by 0001F's 18-provider infrastructure

---

## Files Mapping

### To Create

| File | Purpose |
|------|---------|
| `skills/trello-api/SKILL.md` | Tier 2 entry: frontmatter + INDEX (≤ 30 lines) |
| `skills/trello-api/sections/*.md` | Section files — names and grouping determined by /plan after reading api-specs.json |

### To Modify

- None — skill is fully standalone

---

## Technical Assumptions

| Assumption | Impact if Wrong | Mitigation |
|-----------|-----------------|-----------|
| api-specs.json covers full Trello REST API v1 | Coverage gaps in skill | Cross-check INDEX against spec paths |
| Tier 2 with 8 sections covers the surface | Missing major endpoint groups | Validate against spec resource groups before finalizing |
| Synthesized content preferred over verbatim | Verbatim bloats files, defeats ISS | Follow gemini-nano-banana pattern |
| Keywords use real Trello terms | Vague keywords break agent matching | Extract from actual spec paths and field names |

---

## Related Features

| Feature | Relation | Key Files | Impact |
|---------|----------|-----------|--------|
| 0002F-vercel-ai-sdk-skill | shares-pattern | `skills/vercel-ai-sdk/` | Direct structural reference — same ISS Tier 2 pattern, same synthesis strategy |
| 0001F-multi-provider-install | shares-domain | `cli/src/providers.js` | CLI infrastructure already supports skill installation to all 18 providers |

<!-- refs: 0002F, 0001F -->

---

## Summary for Planning

### Executive Summary

0003F creates a Tier 2 indexed skill for the Trello REST API: 1 root SKILL.md (INDEX only) + N section files covering the full API surface. Section count and grouping are determined during `/plan` by reading `api-specs.json`. Follows ISS v0.1 spec; `gemini-nano-banana` and `0002F-vercel-ai-sdk-skill` are structural references.

### Key Decisions

1. **Tier 2:** Justified by 8+ distinct resource groups
2. **Synthesized content:** Distill for agent efficiency
3. **Keywords from real API terms:** endpoint paths, resource names, field names
4. **CLI integration:** Already handled by 0001F — no changes needed

### Critical Files

| File | Why Critical |
|------|-------------|
| `skills/gemini-nano-banana/` | Direct structural template |
| `docs/features/0003F-trello-api-skill/api-specs.json` | Source of truth for all content |
| `skills/indexed-skill-creator/SKILL.md` | Authoring best practices |
| `schema/v0.1.json` | Frontmatter validation |
