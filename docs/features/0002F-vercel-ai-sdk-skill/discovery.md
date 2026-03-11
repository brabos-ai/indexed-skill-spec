# Discovery: Vercel AI SDK Indexed Skill

> **Branch:** docs/0002F-vercel-ai-sdk-skill
> **Feature:** 0002F
> **Date:** 2026-03-10

---

## Codebase Analysis

### Existing Skill Structure

The `skills/` directory contains:

1. **Companion Skills (Tier 1):**
   - `skills/indexed-skill/SKILL.md` — Consumer skill: teaches agents how to detect and parse indexed skills
   - `skills/indexed-skill-creator/SKILL.md` — Creator skill: authoring guide for ISS-compliant skills

2. **Real-World Example (Tier 2):**
   - `skills/gemini-nano-banana/` — Direct template: SKILL.md with 7 INDEX entries, each pointing to a dedicated section file
   - Each section file has 3-5 SECTION blocks with keywords

3. **Observed Patterns:**
   - `indexed-skill: tier 2` in frontmatter is the agent detection key
   - INDEX entries: `@{filepath} | {topic} | {description}`
   - Section files contain only SECTION markers (no frontmatter)
   - Keywords are real API/product terminology: `generateText`, `useChat`, `streamText`
   - Content is synthesized for agent consumption, not verbatim docs

### ISS Tier 2 Pattern

```
skill-name/
├── SKILL.md                    # Frontmatter + INDEX only (≤ 30 lines)
└── sections/
    ├── {category1}.md          # 3-10 SECTION blocks
    ├── {category2}.md
    └── {categoryN}.md
```

Agent algorithm:
1. Read SKILL.md → detect `indexed-skill: tier 2`
2. Parse INDEX → identify relevant file by topic/description match
3. Read section file → grep SECTION markers → match keywords
4. Read only matched line range (80–200 lines)

Marker formats:
- `@sections/core.md | core-apis | generateText, streamText, generateObject`
- `<!-- SECTION:generate-text | keywords: generateText,text,prompt | Text Generation -->`
- `<!-- /SECTION:generate-text -->`

### CLI Integration Point

`cli/src/providers.js` has 20 provider entries. **`vercel-ai` is NOT in the providers map** — this is an integration gap. Skills install to `{provider}/.skills/vercel-ai-sdk/` for each detected provider.

Decision from about.md: 0002F focuses on skill authoring. CLI provider entry may be a follow-up or 0001F scope.

### Source Material Assessment

- 90+ `.mdx` files at `C:\github\terceiros\vercel-ai-sdk\content\docs\`
- Organized by: foundations, getting-started, agents, ai-sdk-core, ai-sdk-ui, ai-sdk-rsc (legacy), advanced, reference, troubleshooting
- `ai-sdk-rsc` is marked legacy (Vercel actively redirects to UI path)
- Key APIs: `generateText`, `streamText`, `generateObject`, `useChat`, `useCompletion`, `embed`, `streamUI`

---

## Technical Context

### Infrastructure

- Skills in `skills/{skill-name}/` are installable via `idx-skill install`
- Destination across 18+ providers: `{provider-folder}/skills/vercel-ai-sdk/`
- JSON Schema validation at `schema/v0.1.json` validates frontmatter
- No runtime validator for SECTION markers; agents parse via regex

### Dependencies

- ISS specification (README.md, examples/)
- Vercel AI SDK source docs (available locally)
- `gemini-nano-banana` as direct structural template

### Integration Points

1. **Spec compliance:** `schema/v0.1.json` for frontmatter validation
2. **Agent consumption:** `indexed-skill/SKILL.md` defines the regex patterns agents use
3. **CLI distribution (future):** Provider entry in `cli/src/providers.js`

---

## Files Mapping

### To Create

| File | Purpose |
|------|---------|
| `skills/vercel-ai-sdk/SKILL.md` | Tier 2 entry: frontmatter + 8-entry INDEX |
| `skills/vercel-ai-sdk/sections/foundations.md` | Providers, models, prompts, tools, streaming (6 SECTION blocks) |
| `skills/vercel-ai-sdk/sections/getting-started.md` | Framework setup: Next.js, Node.js, Svelte, Nuxt, Expo, TanStack, agents (8 SECTION blocks) |
| `skills/vercel-ai-sdk/sections/agents.md` | Building agents, workflows, loop control, memory, subagents (5 SECTION blocks) |
| `skills/vercel-ai-sdk/sections/core.md` | generateText, streamText, generateObject, tools, MCP, embeddings, middleware, errors, testing, telemetry (10+ SECTION blocks) |
| `skills/vercel-ai-sdk/sections/ui.md` | useChat, useCompletion, generative UI, streaming data, transport, stream protocol, message persistence, error handling (8 SECTION blocks) |
| `skills/vercel-ai-sdk/sections/advanced.md` | Caching, rate limiting, prompt engineering, model-as-router, sequential generations (6 SECTION blocks) |
| `skills/vercel-ai-sdk/sections/reference.md` | API reference index for core, UI, RSC migration notes (3 SECTION blocks) |
| `skills/vercel-ai-sdk/sections/troubleshooting.md` | Top 10 common errors and fixes (10 SECTION blocks) |

### To Modify

- `cli/src/providers.js` — Add `vercel-ai` provider entry (**future/separate scope, not 0002F**)

---

## Technical Assumptions

| Assumption | Impact if Wrong | Mitigation |
|-----------|-----------------|-----------|
| Vercel AI SDK docs stable at local path | Source unavailable | Verify path before starting |
| 8 section files cover the full SDK | Major gaps in coverage | Cross-check against about.md Spec before finalizing |
| Synthesized content is preferred | Verbatim copy bloats files, defeats ISS | Follow gemini-nano-banana pattern: summarize, distill, extract |
| Keywords must be real SDK API names | Vague keywords break agent matching | Extract from actual .mdx files |
| CLI integration is deferred (separate from 0002F) | Skill not installable without provider entry | Document clearly; coordinate with 0001F |

---

## Related Features

| Feature | Relation | Key Files | Impact |
|---------|----------|-----------|--------|
| 0001F-multi-provider-install | shares-domain | `cli/src/providers.js` | May need `vercel-ai` provider entry for full CLI install; deferred from 0002F |
| indexed-skill (consumer) | teaches-consumption | `skills/indexed-skill/SKILL.md` | Defines regex patterns agents use to parse 0002F |
| indexed-skill-creator | teaches-authoring | `skills/indexed-skill-creator/SKILL.md` | Authoring best practices reference |
| gemini-nano-banana | template-reference | `skills/gemini-nano-banana/` | Direct structural template for 0002F |

<!-- refs: 0001F -->

---

## Summary for Planning

### Executive Summary

0002F creates a Tier 2 indexed skill for the Vercel AI SDK: 1 root SKILL.md (INDEX only) + 8 synthesized section files covering all major SDK categories. Follows ISS v0.1 spec and uses `gemini-nano-banana` as the direct structural template. The key challenge is content synthesis — distilling 90+ .mdx files into focused, agent-scannable sections with precise SDK API keywords.

### Key Decisions

1. **Tier 2:** Justified by 90+ source docs across 8 distinct categories
2. **Synthesized content:** Distill for agent efficiency, not verbatim copy
3. **Keywords from real SDK APIs:** `generateText`, `useChat`, `streamText`, etc.
4. **CLI integration deferred:** Separate from skill authoring scope

### Critical Files

| File | Why Critical |
|------|-------------|
| `skills/gemini-nano-banana/` | Direct structural template |
| `README.md` | ISS format specification |
| `skills/indexed-skill-creator/SKILL.md` | Authoring best practices |
| `schema/v0.1.json` | Frontmatter validation |
| `C:\github\terceiros\vercel-ai-sdk\content\docs\` | Source material for synthesis |
