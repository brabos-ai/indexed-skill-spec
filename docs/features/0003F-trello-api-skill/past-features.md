# Past Features Analysis: 0003F

## Related Features

| Feature | Relation | Key Files | Impact on 0003F |
|---------|----------|-----------|-----------------|
| 0002F-vercel-ai-sdk-skill | Direct template — same ISS Tier 2 skill type, same synthesis process (external API docs → indexed skill) | `skills/vercel-ai-sdk/SKILL.md`, `skills/vercel-ai-sdk/sections/*.md` | Defines the exact file layout, SKILL.md frontmatter schema, section decomposition strategy, and INDEX comment format to replicate |
| 0001F-multi-provider-install | CLI infrastructure that delivers all indexed skills to user environments | `bin/idx-skill.js`, `installer.js`, `prompt.js` | The skill output path must be `skills/trello-api/` at repo root; the SKILL.md and section files are what the CLI zips and installs to `{providerFolder}skills/`; no CLI changes required |

## Key Patterns to Follow

From 0002F, the Tier 2 ISS pattern is:

1. **Root entry point: `skills/<skill-name>/SKILL.md`** — YAML frontmatter with `name`, `description`, `indexed-skill: tier 2`, and any version/spec fields. The description must list the key concepts a user would search for (equivalent to Trello resource names: boards, cards, lists, members, webhooks, etc.).

2. **Index comment block in SKILL.md** — An HTML comment `<!-- INDEX ... -->` maps each section file to a short alias and a keyword list. This is what agents use to load only the section they need rather than the full skill. Each line format is: `@sections/<file>.md | <alias> | <keyword1>, <keyword2>, ...`

3. **Section file decomposition** — Content is split into focused `.md` files under `skills/<skill-name>/sections/`. The 0002F split was topical (foundations, getting-started, agents, core-generation, core-tools, core-infra, ui, production, reference, troubleshooting). For a REST API skill, the natural decomposition follows the API surface: one section per major resource group, plus auth, rate-limiting, webhooks, and a reference/troubleshooting section.

4. **Synthesis from official sources** — 0002F synthesized 90+ source files into 11 section files. For the Trello API skill, the synthesis source is the Trello REST API official reference (developer.atlassian.com/cloud/trello/rest). Content should be distilled, not copied verbatim — the goal is dense, agent-readable reference.

5. **No extra tooling or build steps** — The skill is purely Markdown files. No scripts, no JSON manifests, no build process. The CLI picks up whatever is in `skills/` at zip time.

## Key Decisions That Constrain 0003F

| Decision (from) | What it means for 0003F |
|-----------------|------------------------|
| Provider dest is `{folder}skills/` for all 18 providers (0001F) | The repo-side path must be `skills/trello-api/` — this is what gets installed. Do not nest differently. |
| Skill directory name = skill key used by CLI (0001F convention) | Use `trello-api` as the directory name (kebab-case, matches the feature slug suffix) |
| SKILL.md is the single entry point agents load first (0002F) | Everything navigable must be reachable from the INDEX block in SKILL.md; do not create top-level files outside `SKILL.md` + `sections/` |
| `indexed-skill: tier 2` in frontmatter is required (0002F) | Tier 2 means multi-file with an index; the frontmatter field must be exactly `indexed-skill: tier 2` |
| Section files are standalone-readable (0002F) | Each section must make sense without reading others — no cross-section `@import` or relative references |

## What to Reuse

- **SKILL.md frontmatter structure** — Copy the exact YAML shape from `skills/vercel-ai-sdk/SKILL.md` and substitute Trello-specific values. Replace `sdk-version` with `api-version: "v1"` (Trello REST API is versioned as v1).
- **INDEX comment syntax** — The `<!-- INDEX\n@sections/... | alias | keywords\n-->` format is reusable verbatim; only the section entries change.
- **Section file conventions** — Plain Markdown, no frontmatter needed in section files, use `##` headings for major topics within a section. Reference how `sections/reference.md` in 0002F provides an API index table — the same pattern works for Trello's resource/endpoint index.
- **`docs/submit-to-*.md` pattern** — 0002F created `docs/submit-to-vercel.md` as a submission/changelog note. Create `docs/submit-to-trello.md` (or `submit-to-atlassian.md`) following the same convention if a submission doc is needed.
- **Section count and granularity** — 0002F landed on 11 sections after a v2 re-synthesis that split large sections (core split into core-generation, core-tools, core-infra). For the Trello API, aim for a similar count; if a resource group is large (cards have 40+ endpoints), split it.

## Summary

0002F is the direct blueprint for 0003F: same ISS Tier 2 file layout (`SKILL.md` + `sections/`), same frontmatter schema, same INDEX comment format, same synthesis-from-official-docs workflow. The only domain change is from an SDK (Vercel AI) to a REST API (Trello), which shifts the section decomposition from SDK concepts to API resource groups (boards, cards, lists, members, actions, webhooks, auth). 0001F's CLI infrastructure requires no changes — the skill just needs to land at `skills/trello-api/` in the repo root, and the existing 18-provider install pipeline will handle distribution automatically.
