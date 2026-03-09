---
name: indexed-skill-creator
description: >
  How to create skills following the Indexed Skills Specification (ISS v0.1).
  Use when the user explicitly asks to create an indexed skill, or when
  converting documentation with clearly separable topics (e.g., API docs,
  platform guides) into a skill. Do NOT use for skills that need to be
  read as a whole to be effective.
---
# Indexed Skill Creator

Guide for authoring indexed skills — skills whose content can be consumed
surgically by section, rather than loaded in full.

## When to Use Indexed Skills

Not every skill should be indexed. Indexed skills work best when:

- **Content has clearly separable topics** — each section stands on its own
  and can be consumed independently (e.g., API documentation where each
  endpoint is self-contained, platform guides with distinct subsystems).
- **An agent rarely needs the full content** — most tasks only require
  1-2 sections out of many.

Do NOT index a skill when:

- **The content must be read as a whole** — workflows, step-by-step guides,
  or skills where context from earlier sections is required to understand
  later ones.
- **The skill is small enough to load entirely** — if the full skill is
  under ~100 lines, indexing adds overhead without benefit.
- **Sections are tightly coupled** — if most tasks require reading 3+
  sections together, indexing provides little savings.

Good candidates: API documentation, platform reference guides, configuration
references, troubleshooting databases, multi-service infrastructure docs.

Bad candidates: onboarding tutorials, coding style guides, workflow
orchestration skills, skills with sequential dependencies.

## Choosing a Tier

- **Tier 1** — Content fits in a single file. Typically under ~300 lines
  with 2-5 independent sections. Use when topics are few but each is
  substantial enough to benefit from selective reading.
- **Tier 2** — Content spans multiple files or covers many topics. Each
  file groups related sections together (e.g., all auth sections in one
  file, all billing sections in another).

Rule of thumb: more than 5-6 sections or content that naturally splits
into distinct files means Tier 2.

## Creating a Tier 1 Skill

Structure your `SKILL.md` with these parts in order:

1. **YAML frontmatter** with `indexed-skill: tier 1`:
   ```yaml
   ---
   name: my-skill
   description: >
     Brief description of what this skill covers.
   indexed-skill: tier 1
   ---
   ```
2. **Brief description** (2-4 lines) after the heading.
3. **INDEX block** listing all sections:
   ```
   <!-- INDEX
   @{section-id} | {topic} | {description}
   -->
   ```
4. **SECTION blocks** wrapping each content section:
   ```
   <!-- SECTION:{id} | keywords: {kw1,kw2,...} | {description} -->
   ## Section Title
   ...content...
   <!-- /SECTION:{id} -->
   ```

Each section ID in the INDEX must match exactly one SECTION block.

## Creating a Tier 2 Skill

**SKILL.md** contains frontmatter with `indexed-skill: tier 2`, a brief
description, and an INDEX pointing to files:

```
<!-- INDEX
@sections/auth.md | authentication | OAuth2, JWT, API Key setup
@sections/billing.md | billing | Stripe integration, plans, webhooks
-->
```

**Section files** (e.g., `sections/auth.md`) contain SECTION blocks only —
no frontmatter needed:

```
<!-- SECTION:auth-overview | keywords: auth,login,oauth | Auth overview -->
## Authentication Overview
...content...
<!-- /SECTION:auth-overview -->
```

Multiple SECTION blocks can live in a single section file.

## Writing Good Keywords

- **Format**: lowercase, comma-separated, no spaces after commas
  (e.g., `auth,login,oauth,sso`).
- **Include synonyms and abbreviations**: users may search "auth",
  "authentication", or "login" — list all variants.
- **Think like the user**: include terms developers would search for, not
  just internal jargon.
- **Count**: 3-8 keywords per section. Fewer risks missed matches; more
  than 8 adds noise.

Example: `keywords: jwt,token,refresh,access,bearer,auth,verify`

## Section Sizing

- **Ideal range**: 20-80 lines per section.
- **Upper limit**: sections over ~100 lines should be split.
- **Cohesion**: each section covers one concept. Topic switch = split point.
- **Minimum**: under 10 lines is too granular — merge with a related section.

## Naming Conventions

**Section IDs** — Use `{topic}-{subtopic}` in kebab-case:
- Examples: `auth-jwt`, `auth-oauth`, `billing-webhooks`, `deploy-docker`
- Keep IDs short but descriptive.

**File paths (Tier 2)** — Place files under `sections/` with topic names:
- Examples: `sections/auth.md`, `sections/billing.md`, `sections/deploy.md`
- Group related sections in the same file (e.g., `auth-overview` and
  `auth-jwt` both live in `sections/auth.md`).
