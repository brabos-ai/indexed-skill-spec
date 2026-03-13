# Task: Trello API — Indexed Skill

> **Branch:** feature/0003F-trello-api-skill
> **Feature:** 0003F
> **Date:** 2026-03-13

---

## Objective

Transform the Trello REST API specification into an ISS Tier 2 indexed skill — official agent documentation for the Trello API that enables AI agents to surgically load only the relevant sections instead of ingesting thousands of lines.

## Business Context

- **Why:** The Trello REST API has a broad surface (boards, cards, lists, members, actions, webhooks, search) spread across many endpoints. Agents building automations or integrations need precise, agent-scannable documentation to avoid loading everything at once.
- **Problem:** No indexed skill exists for the Trello API. Agents can't efficiently navigate the API surface during development tasks.
- **Stakeholders:** Developers using AI agents (especially Claude Code) to build Trello integrations; the indexed-skill-spec community.

## Scope

### Included

- ISS Tier 2 indexed skill at `skills/trello-api/` — SKILL.md with frontmatter (`indexed-skill: tier 2`, `api-version: "v1"`) + INDEX + section files
- Content synthesized from the official Trello API spec (`docs/features/0003F-trello-api-skill/api-specs.json`)
- **Full surface coverage** — all 15+ resource groups: auth, boards, lists, cards, members, actions, checklists, labels, custom fields, search, webhooks, notifications, organizations, tokens, enterprises
- Content complete per section — no artificial line limits; the INDEX handles selective loading
- Auth section as anchor with `<!-- RELATED -->` markers in all other sections
- Pagination and optional fields (`fields`, `filter`, `limit`) documented as cross-cutting patterns with RELATED markers
- Webhooks: full coverage including creation, event types, payload structure, and HMAC signature validation

### Not Included

- Changes to `cli/src/providers.js` — skill is standalone (all 18 providers already supported via 0001F)
- Verbatim copy of the OpenAPI spec — content is synthesized/distilled for agents
- Trello Power-Ups SDK (separate surface)
- `docs/submit-to-trello.md` — not in scope for this feature

## Source Material

The skill content MUST be synthesized from:
- `docs/features/0003F-trello-api-skill/api-specs.json` — OpenAPI 3.0.0 spec for Trello REST API v1

## Business Rules

### Validations

- SKILL.md MUST have `indexed-skill: tier 2` in YAML frontmatter
- SKILL.md MUST have `api-version: "v1"` in frontmatter
- Every section file MUST use `<!-- SECTION:{id} | keywords: {kw1,kw2} | {title} -->` / `<!-- /SECTION:{id} -->` markers
- INDEX entries MUST follow format: `@sections/{file}.md | {topic} | {description}`
- Keywords MUST be real Trello API terms (endpoint paths, resource names, field names)
- Content MUST be complete — no artificial line limits; include all endpoints, params, and examples needed for full understanding
- SKILL.md INDEX MUST be ≤ 30 lines
- Auth section MUST have `<!-- RELATED -->` markers pointing to it from every other section
- Pagination/fields pattern MUST be documented once (in a dedicated section or auth.md) and referenced via RELATED markers elsewhere
- Webhooks MUST cover: creation, available events, payload structure, and HMAC validation

### Flows

**Happy Path — single resource:**
1. Agent detects `indexed-skill: tier 2` in SKILL.md frontmatter
2. Agent reads INDEX (≤ 30 lines) → matches topic to section file
3. Agent scans section file SECTION markers → matches keywords
4. Agent reads only matched line range (~80-200 lines)
5. Agent has precise context to complete task

**Error — topic not found:**
1. Agent's keyword doesn't match any INDEX entry
2. Agent reads SKILL.md description for general orientation
3. Agent follows `<!-- RELATED -->` references

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Tier | Tier 2 (multi-file) | Broad API surface across 15+ resource groups |
| Coverage | Full surface (all resource groups) | Complete skill is more useful; INDEX handles selective loading |
| Content depth | Complete — no line limits | Indexed skill design means agents load only what they need; content must be authoritative |
| Auth RELATED markers | Required in all sections | Auth params (key/token) are mandatory for every endpoint |
| Pagination pattern | Centralized + RELATED | Avoids repetition; agents navigate via markers |
| Webhooks | Full coverage (events, payload, HMAC) | Core automation pattern in Trello integrations |
| Content source | api-specs.json (MANDATORY) | No hallucinated content |
| CLI integration | Out of scope | 0001F already covers all 18 providers |
| Keywords taxonomy | Real Trello API terms | Required for reliable agent matching |
| Version pin | `api-version: "v1"` | Prevents silent staleness |
| Submission guide | Out of scope | Standalone skill only; no submit-to-trello.md |

## Edge Cases

| Name | Description | Strategy |
|------|-------------|----------|
| Multi-resource task | Agent needs boards + cards together | Both files indexed; RELATED markers guide navigation |
| Auth confusion | API key vs token usage unclear | Dedicated auth section with clear distinctions |
| Rate limiting | Exceeds Trello API limits | Rate limit section with retry guidance |

## Acceptance Criteria

- [ ] AC01: `skills/trello-api/SKILL.md` has `indexed-skill: tier 2` + `api-version: "v1"` in frontmatter
- [ ] AC02: INDEX covers all section files with accurate topic labels and descriptions
- [ ] AC03: Each section file has correct SECTION open/close markers with keywords
- [ ] AC04: Keywords are real Trello API terms (verified against api-specs.json)
- [ ] AC05: SKILL.md INDEX is ≤ 30 lines
- [ ] AC06: Content is synthesized from api-specs.json (not hallucinated)
- [ ] AC07: Auth section covers API key + token auth, OAuth flow, and URL construction with credentials
- [ ] AC08: Every non-auth section has `<!-- RELATED: sections/auth.md#... -->` marker
- [ ] AC09: Pagination and optional fields (`fields`, `filter`, `limit`) documented with RELATED markers
- [ ] AC10: Webhooks section covers creation, event types, payload structure, HMAC validation
- [ ] AC11: All 15+ resource groups from api-specs.json are covered with no major gaps

## Spec (Token-Efficient)

```
Output: skills/trello-api/
  SKILL.md             → tier 2, api-version: v1, INDEX (≤30 lines)
  sections/            → structure and file names determined by /plan based on api-specs.json

Source: docs/features/0003F-trello-api-skill/api-specs.json
  MANDATORY: all resource groups must be read before defining section structure

Content rules:
  - Complete content per section — no artificial line limits
  - Auth credentials (key+token) are required by every endpoint → auth section is anchor
  - Pagination and optional fields are cross-cutting → document once, reference via RELATED
  - Webhooks require full treatment: creation, events, payload, HMAC validation
```

## Next Steps

Ready for `/plan` to define the skill file structure based on the api-specs.json.

Key guidance:
1. `/plan` MUST read `api-specs.json` to determine section structure
2. Read `skills/gemini-nano-banana/` as the ISS Tier 2 structural template
3. Read `skills/indexed-skill-creator/SKILL.md` for authoring best practices
4. Validate frontmatter against `schema/v0.1.json`
