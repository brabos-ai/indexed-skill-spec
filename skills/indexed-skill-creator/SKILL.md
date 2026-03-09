---
name: indexed-skill-creator
description: >
  Teaches AI agents how to create skills following the Indexed Skills
  Specification (ISS v0.1). Use when asked to create or convert a skill
  to the indexed format.
---
# Indexed Skill Creator

Guide for authoring indexed skills. Covers tier selection, structure, markers,
keywords, sizing, and naming conventions.

<!-- INDEX
@choose-tier | tier-selection | Decision criteria for choosing Tier 1 vs Tier 2
@create-tier1 | tier-1 | How to create a single-file Tier 1 indexed skill
@create-tier2 | tier-2 | How to create a multi-file Tier 2 indexed skill
@keywords | keywords | Guidelines for writing effective section keywords
@section-sizing | sizing | Recommended section sizes and when to split
@naming | naming | Naming conventions for section IDs and file paths
-->

<!-- SECTION:choose-tier | keywords: tier,choose,decision,single,multi,size,lines | Decision criteria for choosing Tier 1 vs Tier 2 -->
## Choosing a Tier

- **Tier 1** — Skill fits in a single file, total content under ~300 lines.
  Ideal for focused topics with 2-5 sections.
- **Tier 2** — Skill spans multiple files or topics, total content over ~300
  lines. Each file groups related sections together.

Rule of thumb: more than 5-6 sections or over 300 lines means Tier 2.
<!-- /SECTION:choose-tier -->

<!-- SECTION:create-tier1 | keywords: tier1,single,file,template,frontmatter,index,section,create | How to create a single-file Tier 1 indexed skill -->
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
3. **INDEX block** — `<!-- INDEX -->` listing entries as `@{section-id} | {topic} | {description}`
4. **SECTION blocks** — each wrapped in `<!-- SECTION:{id} | keywords: {kw1,kw2,...} | {description} -->`
   and closed with `<!-- /SECTION:{id} -->`

Each section ID in the INDEX must match exactly one SECTION block.
<!-- /SECTION:create-tier1 -->

<!-- SECTION:create-tier2 | keywords: tier2,multi,file,directory,sections,split,create | How to create a multi-file Tier 2 indexed skill -->
## Creating a Tier 2 Skill

**SKILL.md** contains frontmatter with `indexed-skill: tier 2`, a brief
description, and an INDEX pointing to files:

```
<!-- INDEX
@sections/auth.md | authentication | OAuth2, JWT, API Key setup
@sections/billing.md | billing | Stripe integration, plans, webhooks
-->
```

**Section files** (e.g., `sections/auth.md`) contain SECTION blocks only — no
frontmatter needed:

```
<!-- SECTION:auth-overview | keywords: auth,login,oauth | Auth overview -->
## Authentication Overview
...content...
<!-- /SECTION:auth-overview -->
```

Multiple SECTION blocks can live in a single section file.
<!-- /SECTION:create-tier2 -->

<!-- SECTION:keywords | keywords: keyword,synonym,search,tag,discover,write | Guidelines for writing effective section keywords -->
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
<!-- /SECTION:keywords -->

<!-- SECTION:section-sizing | keywords: size,lines,length,split,limit,large | Recommended section sizes and when to split -->
## Section Sizing

- **Ideal range**: 20-80 lines per section.
- **Upper limit**: sections over ~100 lines should be split.
- **Cohesion**: each section covers one concept. Topic switch = split point.
- **Minimum**: under 10 lines is too granular — merge with a related section.
<!-- /SECTION:section-sizing -->

<!-- SECTION:naming | keywords: name,convention,id,kebab,path,file,organize | Naming conventions for section IDs and file paths -->
## Naming Conventions

**Section IDs** — Use `{topic}-{subtopic}` in kebab-case:
- Examples: `auth-jwt`, `auth-oauth`, `billing-webhooks`, `deploy-docker`
- Keep IDs short but descriptive.

**File paths (Tier 2)** — Place files under `sections/` with topic names:
- Examples: `sections/auth.md`, `sections/billing.md`, `sections/deploy.md`
- Group related sections in the same file (e.g., `auth-overview` and
  `auth-jwt` both live in `sections/auth.md`).
<!-- /SECTION:naming -->
