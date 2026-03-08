# ISS v0.1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Indexed Skills Specification v0.1 — a global standard for surgical context loading in AI agent skills.

**Architecture:** Tier-based inline indexing using HTML comment markers (`<!-- INDEX -->`, `<!-- SECTION -->`). Two tiers: single-file (tier 1) and multi-file (tier 2). Two meta-skills teach agents to consume and create indexed skills. Examples demonstrate both tiers.

**Tech Stack:** Markdown, YAML frontmatter, JSON Schema

---

### Task 1: Update README.md with refined spec

**Files:**
- Modify: `README.md`

**Step 1: Rewrite README.md**

Replace the current README with the refined ISS v0.1 specification. The new README should cover:

- Problem statement (context waste in large skills)
- Solution overview (tier-based inline indexing)
- Detection via frontmatter (`indexed-skill: tier 1` / `indexed-skill: tier 2`)
- Tier 1 spec: INDEX and SECTION markers inline in SKILL.md
- Tier 2 spec: INDEX in SKILL.md pointing to files, SECTION markers in each file
- Marker format and regex patterns
- Agent consumption algorithm for both tiers
- Ecosystem: `indexed-skill/` (consumer) and `indexed-skill-creator/` (creator)
- Repository structure
- Roadmap

Language: English (this is a global standard).

Key content from the design doc at `docs/plans/2026-03-08-iss-v01-design.md` should be incorporated.

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README with refined ISS v0.1 spec"
```

---

### Task 2: Create Tier 1 example

**Files:**
- Create: `examples/tier1-example/SKILL.md`

**Step 1: Write the Tier 1 example skill**

Create a realistic Tier 1 indexed skill about a fictional "API Rate Limiting" topic. It should contain:

- Valid YAML frontmatter with `indexed-skill: tier 1`
- `<!-- INDEX -->` block with 3-4 entries
- 3-4 `<!-- SECTION:id | keywords: ... | description -->` blocks
- Each section with ~20-40 lines of realistic documentation content
- Total file ~150-200 lines (realistic for a tier 1 skill)

```markdown
---
name: api-rate-limiting
description: >
  Rate limiting strategies, configuration, and troubleshooting
  for API endpoints.
indexed-skill: tier 1
---
# API Rate Limiting

Comprehensive guide for implementing and managing API rate limiting.

<!-- INDEX
@rate-overview | rate-limiting | Rate limiting concepts and strategies
@rate-config | configuration | How to configure rate limits per endpoint
@rate-headers | headers | Rate limit response headers and client handling
@rate-troubleshoot | troubleshooting | Common rate limiting issues and fixes
-->

<!-- SECTION:rate-overview | keywords: rate,limit,throttle,quota,strategy | Rate limiting concepts and available strategies -->
## Overview
...realistic content about rate limiting strategies...
<!-- /SECTION:rate-overview -->

<!-- SECTION:rate-config | keywords: config,endpoint,limit,window,rules | Configuring rate limits per endpoint -->
## Configuration
...realistic content about configuration...
<!-- /SECTION:rate-config -->

<!-- SECTION:rate-headers | keywords: headers,retry-after,x-ratelimit,429,client | Rate limit headers and client-side handling -->
## Response Headers
...realistic content about headers...
<!-- /SECTION:rate-headers -->

<!-- SECTION:rate-troubleshoot | keywords: error,429,blocked,whitelist,bypass,debug | Troubleshooting rate limit issues -->
## Troubleshooting
...realistic content about troubleshooting...
<!-- /SECTION:rate-troubleshoot -->
```

**Step 2: Commit**

```bash
git add examples/tier1-example/SKILL.md
git commit -m "feat: add tier 1 example skill (api-rate-limiting)"
```

---

### Task 3: Create Tier 2 example

**Files:**
- Create: `examples/tier2-example/SKILL.md`
- Create: `examples/tier2-example/sections/auth.md`
- Create: `examples/tier2-example/sections/billing.md`

**Step 1: Write the Tier 2 SKILL.md**

```markdown
---
name: saas-platform
description: >
  Complete guide for the SaaS platform covering authentication,
  billing, and infrastructure.
indexed-skill: tier 2
---
# SaaS Platform

Full documentation for the SaaS platform backend services.

<!-- INDEX
@sections/auth.md | authentication | OAuth2, JWT, API Key setup and validation
@sections/billing.md | billing | Stripe integration, plans, webhooks
-->
```

**Step 2: Write sections/auth.md**

Create with 2-3 sections, each ~30-50 lines of realistic auth documentation.

```markdown
<!-- SECTION:auth-overview | keywords: auth,login,oauth,methods | Authentication methods overview -->
## Authentication Overview
...realistic content...
<!-- /SECTION:auth-overview -->

<!-- SECTION:auth-jwt | keywords: jwt,token,bearer,refresh,expiration | JWT token implementation -->
## JWT Implementation
...realistic content...
<!-- /SECTION:auth-jwt -->

<!-- SECTION:auth-apikey | keywords: apikey,key,secret,rotate,revoke | API Key management -->
## API Key Management
...realistic content...
<!-- /SECTION:auth-apikey -->
```

**Step 3: Write sections/billing.md**

Create with 2-3 sections, each ~30-50 lines of realistic billing documentation.

```markdown
<!-- SECTION:billing-overview | keywords: billing,stripe,payment,plan,subscription | Billing system overview -->
## Billing Overview
...realistic content...
<!-- /SECTION:billing-overview -->

<!-- SECTION:billing-webhooks | keywords: webhook,stripe,event,payment,notification | Stripe webhook handling -->
## Webhook Handling
...realistic content...
<!-- /SECTION:billing-webhooks -->
```

**Step 4: Commit**

```bash
git add examples/tier2-example/
git commit -m "feat: add tier 2 example skill (saas-platform)"
```

---

### Task 4: Create `indexed-skill/SKILL.md` (consumer meta-skill)

**Files:**
- Create: `skills/indexed-skill/SKILL.md`

**Step 1: Write the consumer meta-skill**

This is a conventional skill (NOT indexed itself) that teaches agents how to consume indexed skills. It must cover:

1. How to detect indexed skills (`indexed-skill: tier N` in frontmatter)
2. Tier 1 consumption algorithm (grep INDEX → grep SECTION → read range)
3. Tier 2 consumption algorithm (grep INDEX → identify file → grep SECTION in file → read range)
4. Regex patterns for parsing markers
5. Best practices (never load full file, use keywords for matching, follow related sections)

```markdown
---
name: indexed-skill
description: >
  Teaches AI agents how to consume Indexed Skills (ISS v0.1).
  Use when encountering a skill with indexed-skill in its frontmatter.
---
# Indexed Skill Consumer

This skill teaches you how to efficiently consume skills that follow
the Indexed Skills Specification (ISS).

## Detection

When reading a skill's frontmatter, check for the `indexed-skill` field:
- `indexed-skill: tier 1` → single-file indexed skill
- `indexed-skill: tier 2` → multi-file indexed skill
- Field absent → conventional skill, read normally

## Consuming Tier 1 Skills
...step-by-step algorithm with grep commands and regex...

## Consuming Tier 2 Skills
...step-by-step algorithm with grep commands and regex...

## Regex Reference
...the three regex patterns for INDEX, SECTION open, SECTION close...

## Best Practices
...guidelines for efficient consumption...
```

Target: ~80-120 lines. Clear, imperative instructions.

**Step 2: Commit**

```bash
git add skills/indexed-skill/SKILL.md
git commit -m "feat: add indexed-skill consumer meta-skill"
```

---

### Task 5: Create `indexed-skill-creator/SKILL.md` (creator meta-skill)

**Files:**
- Create: `skills/indexed-skill-creator/SKILL.md`

**Step 1: Write the creator meta-skill**

This is a conventional skill that teaches agents how to create indexed skills. It must cover:

1. When to use Tier 1 vs Tier 2 (decision criteria)
2. How to structure a Tier 1 skill (frontmatter, INDEX, SECTION markers)
3. How to structure a Tier 2 skill (SKILL.md with INDEX, separate section files)
4. Rules for writing good keywords and descriptions
5. Section sizing guidelines
6. Naming conventions for IDs

```markdown
---
name: indexed-skill-creator
description: >
  Teaches AI agents how to create skills following the Indexed Skills
  Specification (ISS v0.1). Use when asked to create or convert a skill
  to the indexed format.
---
# Indexed Skill Creator

This skill teaches you how to create skills that follow the
Indexed Skills Specification (ISS).

## Choosing a Tier
...decision criteria: single file vs multi-file...

## Creating a Tier 1 Skill
...step-by-step with templates...

## Creating a Tier 2 Skill
...step-by-step with templates...

## Writing Good Keywords
...guidelines...

## Section Sizing
...recommendations...

## Naming Conventions
...id, topic, file naming rules...
```

Target: ~80-120 lines.

**Step 2: Commit**

```bash
git add skills/indexed-skill-creator/SKILL.md
git commit -m "feat: add indexed-skill-creator meta-skill"
```

---

### Task 6: Create JSON Schema

**Files:**
- Create: `schema/v0.1.json`

**Step 1: Write the JSON Schema**

A JSON Schema that validates the frontmatter structure of an indexed skill. It should validate:

- `name`: required string
- `description`: required string
- `indexed-skill`: required, enum `["tier 1", "tier 2"]`

This is a lightweight schema for tooling validation.

**Step 2: Commit**

```bash
git add schema/v0.1.json
git commit -m "feat: add JSON Schema v0.1 for indexed skill validation"
```

---

### Task 7: Final review and verification

**Step 1: Verify all files exist**

```bash
find . -name "*.md" -o -name "*.json" | grep -v node_modules | grep -v .git | sort
```

Expected:
```
./README.md
./docs/plans/2026-03-08-iss-v01-design.md
./docs/plans/2026-03-08-iss-v01-implementation.md
./examples/tier1-example/SKILL.md
./examples/tier2-example/SKILL.md
./examples/tier2-example/sections/auth.md
./examples/tier2-example/sections/billing.md
./schema/v0.1.json
./skills/indexed-skill/SKILL.md
./skills/indexed-skill-creator/SKILL.md
```

**Step 2: Verify INDEX markers are grep-able**

```bash
grep -rn "<!-- INDEX" examples/
grep -rn "<!-- SECTION:" examples/
grep -rn "<!-- /SECTION:" examples/
```

**Step 3: Verify regex patterns work**

```bash
grep -P "@(.+?) \| (.+?) \| (.+)" examples/tier1-example/SKILL.md
grep -P "<!-- SECTION:(\S+) \| keywords: (.+?) \| (.+?) -->" examples/tier1-example/SKILL.md
```

**Step 4: Commit any fixes if needed**
