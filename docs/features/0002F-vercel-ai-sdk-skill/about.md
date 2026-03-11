# Task: Vercel AI SDK — Indexed Skill

> **Branch:** docs/0002F-vercel-ai-sdk-skill
> **Feature:** 0002F
> **Date:** 2026-03-10

---

## Objective

Transform the full Vercel AI SDK documentation (~90 .mdx files) into an ISS Tier 2 indexed skill — official agent documentation for the Vercel AI SDK that enables AI agents to surgically load only the relevant sections instead of ingesting thousands of lines.

## Business Context

- **Why:** The Vercel AI SDK docs are extensive and dispersed across 9 categories. Agents building with the SDK either waste context loading everything or miss critical documentation. An indexed skill makes the SDK natively navigable by agents.
- **Problem:** No indexed skill exists for the Vercel AI SDK. Agents can't efficiently consume SDK docs during development tasks.
- **Stakeholders:** Developers using AI agents (especially Claude Code) to build with Vercel AI SDK; the indexed-skill-spec community; Vercel AI SDK users who would benefit from official agent documentation.

## Scope

### Included

- ISS Tier 2 indexed skill at `skills/vercel-ai-sdk/` — SKILL.md with frontmatter (`indexed-skill: tier 2`, `sdk-version: "4.x"`) + INDEX + section files
- Content synthesized from official Vercel AI SDK documentation (see Source Material below)
- All 9 categories of the SDK docs covered: foundations, getting-started, agents, ai-sdk-core, ai-sdk-ui, ai-sdk-rsc (migration only), advanced, reference, troubleshooting
- `docs/submit-to-vercel.md` — Guide on how to submit this skill to the Vercel AI SDK repository as official agent documentation

**Note:** The exact file structure, section file names, number of SECTION blocks per file, and content organization are to be determined during `/plan`. This spec defines WHAT to deliver, not HOW to structure it.

### Not Included
- Changes to `cli/src/providers.js` — skill is standalone, installed manually
- `ai-sdk-rsc` deep coverage — migration note only, pointing to UI path
- Verbatim copy of .mdx source files — content is synthesized/distilled
- Cookbook examples or playground code

## Source Material (MANDATORY)

The skill content MUST be synthesized from the official Vercel AI SDK documentation files below. These are the **source of truth** — no content should be invented or hallucinated.

**Base path:** `C:\github\terceiros\vercel-ai-sdk\content\docs\`

### 02-foundations/
- `01-overview.mdx`
- `02-providers-and-models.mdx`
- `03-prompts.mdx`
- `04-tools.mdx`
- `05-streaming.mdx`
- `06-provider-options.mdx`

### 02-getting-started/
- `00-choosing-a-provider.mdx`
- `01-navigating-the-library.mdx`
- `02-nextjs-app-router.mdx`
- `03-nextjs-pages-router.mdx`
- `04-svelte.mdx`
- `05-nuxt.mdx`
- `06-nodejs.mdx`
- `07-expo.mdx`
- `08-tanstack-start.mdx`
- `09-coding-agents.mdx`

### 03-agents/
- `01-overview.mdx`
- `02-building-agents.mdx`
- `03-workflows.mdx`
- `04-loop-control.mdx`
- `05-configuring-call-options.mdx`
- `06-memory.mdx`
- `06-subagents.mdx`

### 03-ai-sdk-core/
- `01-overview.mdx`
- `05-generating-text.mdx`
- `10-generating-structured-data.mdx`
- `15-tools-and-tool-calling.mdx`
- `16-mcp-tools.mdx`
- `20-prompt-engineering.mdx`
- `25-settings.mdx`
- `30-embeddings.mdx`
- `31-reranking.mdx`
- `35-image-generation.mdx`
- `36-transcription.mdx`
- `37-speech.mdx`
- `38-video-generation.mdx`
- `40-middleware.mdx`
- `45-provider-management.mdx`
- `50-error-handling.mdx`
- `55-testing.mdx`
- `60-telemetry.mdx`
- `65-devtools.mdx`
- `65-event-listeners.mdx`

### 04-ai-sdk-ui/
- `01-overview.mdx`
- `02-chatbot.mdx`
- `03-chatbot-message-persistence.mdx`
- `03-chatbot-resume-streams.mdx`
- `03-chatbot-tool-usage.mdx`
- `04-generative-user-interfaces.mdx`
- `05-completion.mdx`
- `08-object-generation.mdx`
- `20-streaming-data.mdx`
- `21-error-handling.mdx`
- `21-transport.mdx`
- `24-reading-ui-message-streams.mdx`
- `25-message-metadata.mdx`
- `50-stream-protocol.mdx`

### 05-ai-sdk-rsc/ (legacy — migration note only)
- `01-overview.mdx`
- `02-streaming-react-components.mdx`
- `03-generative-ui-state.mdx`
- `03-saving-and-restoring-states.mdx`
- `04-multistep-interfaces.mdx`
- `05-streaming-values.mdx`
- `06-loading-state.mdx`
- `08-error-handling.mdx`
- `09-authentication.mdx`
- `10-migrating-to-ui.mdx`

### 06-advanced/
- `01-prompt-engineering.mdx`
- `02-stopping-streams.mdx`
- `03-backpressure.mdx`
- `04-caching.mdx`
- `05-multiple-streamables.mdx`
- `06-rate-limiting.mdx`
- `07-rendering-ui-with-language-models.mdx`
- `08-model-as-router.mdx`
- `09-multistep-interfaces.mdx`
- `09-sequential-generations.mdx`
- `10-vercel-deployment-guide.mdx`

### 07-reference/
- `01-ai-sdk-core/` (directory — API reference files)
- `02-ai-sdk-ui/` (directory — API reference files)
- `03-ai-sdk-rsc/` (directory — API reference files)
- `05-ai-sdk-errors/` (directory — error type files)

### 09-troubleshooting/
- `01-azure-stream-slow.mdx`
- `03-server-actions-in-client-components.mdx`
- `04-strange-stream-output.mdx`
- `05-streamable-ui-errors.mdx`
- `05-tool-invocation-missing-result.mdx`
- `06-streaming-not-working-when-deployed.mdx`
- `06-streaming-not-working-when-proxied.mdx`
- `06-timeout-on-vercel.mdx`
- `07-unclosed-streams.mdx`
- `08-use-chat-failed-to-parse-stream.mdx`
- `09-client-stream-error.mdx`
- `10-use-chat-tools-no-response.mdx`
- `11-use-chat-custom-request-options.mdx`
- `12-typescript-performance-zod.mdx`
- `12-use-chat-an-error-occurred.mdx`
- `13-repeated-assistant-messages.mdx`
- `14-stream-abort-handling.mdx`
- `14-tool-calling-with-structured-outputs.mdx`
- `15-abort-breaks-resumable-streams.mdx`
- `15-stream-text-not-working.mdx`
- `16-streaming-status-delay.mdx`
- `17-use-chat-stale-body-data.mdx`
- `18-ontoolcall-type-narrowing.mdx`
- `19-unsupported-model-version.mdx`
- `20-no-object-generated-content-filter.mdx`
- `21-missing-tool-results-error.mdx`
- `30-model-is-not-assignable-to-type.mdx`
- `40-typescript-cannot-find-namespace-jsx.mdx`
- `50-react-maximum-update-depth-exceeded.mdx`
- `60-jest-cannot-find-module-ai-rsc.mdx`
- `70-high-memory-usage-with-images.mdx`

## Business Rules

### Validations
- SKILL.md MUST have `indexed-skill: tier 2` in YAML frontmatter
- SKILL.md MUST have `sdk-version: "4.x"` in frontmatter
- Every section file MUST use `<!-- SECTION:{id} | keywords: {kw1,kw2} | {title} -->` / `<!-- /SECTION:{id} -->` markers
- INDEX entries MUST follow format: `@sections/{file}.md | {topic} | {description}`
- Keywords MUST be real Vercel AI SDK API names (`generateText`, `useChat`, `streamText`, etc.)
- Content MUST be synthesized: signatures + 1 key pattern + 1 gotcha per concept, tables for params (~150 lines/section)
- SKILL.md INDEX MUST be ≤ 30 lines total
- Each section file SHOULD include `<!-- RELATED: sections/{file}.md#{section-id} -->` at the end of sections that have strong cross-section dependencies

### Flows

**Happy Path — single topic:**
1. Agent detects `indexed-skill: tier 2` in SKILL.md frontmatter
2. Agent reads INDEX (≤ 30 lines) → matches topic keyword to section file
3. Agent scans section file SECTION markers → matches keywords
4. Agent reads only matched line range (~80-200 lines)
5. Agent has precise context to complete task

**Happy Path — cross-topic:**
1. Agent's task spans multiple topics (e.g., `streamText` + `useChat`)
2. INDEX match yields 2 files: `sections/core.md` + `sections/ui.md`
3. Agent reads relevant sections from each file
4. `<!-- RELATED -->` markers help navigate between linked sections

**Error — topic not found:**
1. Agent's keyword doesn't match any INDEX entry
2. Agent reads SKILL.md description for general orientation
3. Agent reads the closest section; follows `<!-- RELATED -->` references

## Strategic Questionnaire

**3.1 Content depth:** c) Hybrid — signatures + 1 key pattern + 1 gotcha per concept, tables for params (~150 lines/section)

**3.2 CLI/provider scope:** None — skill is standalone. No changes to `cli/src/providers.js`. User installs manually into their agent project (e.g., `.claude/skills/`) to use it with Claude Code.

**3.3 RSC coverage:** a) Migration note only — 1 SECTION in `ui.md` titled "RSC Migration" pointing to the UI path.

**3.4 Framing:** This is OFFICIAL agent documentation for the Vercel AI SDK. Not a case study. Submission guide created separately.

**Insight 2 — RELATED convention:** Add `<!-- RELATED: sections/{file}.md#{id} -->` at end of relevant sections. Pioneers a lightweight cross-section navigation extension within the ISS format.

**Insight 3 — Version pinning:** `sdk-version: "4.x"` in SKILL.md frontmatter.

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Tier | Tier 2 (multi-file) | 90+ source docs across 9 categories. Single-file Tier 1 would exceed practical limits. |
| Content strategy | Synthesized/distilled | ISS purpose is agent efficiency. Tables + signatures + key pattern = right density. |
| Content source | Official .mdx files (MANDATORY) | All content MUST be synthesized from the Source Material listed above. No hallucinated content. |
| RSC coverage | Migration note only | Vercel marks ai-sdk-rsc as legacy. Forward-only documentation. |
| CLI integration | Out of scope | Skill is self-contained. User copies to `.claude/skills/` in their project. |
| Keywords taxonomy | Real SDK API names | `generateText`, `useChat`, `streamText`, framework names. Required for reliable agent matching. |
| RELATED convention | Add in section files | Lightweight cross-section navigation. No spec change needed to be useful. |
| Version pin | `sdk-version: "4.x"` | Prevents silent staleness as SDK evolves. |
| Structure | Deferred to /plan | File names, section count, SECTION block distribution determined during planning, not spec. |

## Edge Cases

| Name | Description | Strategy |
|------|-------------|----------|
| Cross-section topic | Agent needs `streamText` (core) + `useChat` (ui) | Both files indexed; `<!-- RELATED -->` markers guide navigation |
| New SDK version | Vercel releases breaking API changes | Update `sdk-version` in frontmatter; note changes in affected sections |
| RSC legacy project | User asks about ai-sdk-rsc patterns | SECTION in `ui.md` with migration notes + pointer to official docs |
| Unknown topic | Agent asks about feature not yet sectioned | SKILL.md description gives general orientation; `<!-- RELATED -->` chains guide |

## Acceptance Criteria

- [ ] AC01: `skills/vercel-ai-sdk/SKILL.md` has `indexed-skill: tier 2` + `sdk-version: "4.x"` in frontmatter
- [ ] AC02: INDEX covers all section files with accurate topic labels and descriptions
- [ ] AC03: Each section file has correct SECTION open/close markers with keywords
- [ ] AC04: Keywords are real Vercel AI SDK API names (verified against the .mdx source files)
- [ ] AC05: SKILL.md INDEX is ≤ 30 lines
- [ ] AC06: Content is synthesized from the official .mdx Source Material (not hallucinated)
- [ ] AC07: RSC migration note exists, pointing to UI path
- [ ] AC08: Relevant sections include `<!-- RELATED -->` cross-navigation markers
- [ ] AC09: `docs/submit-to-vercel.md` exists with actionable submission guide
- [ ] AC10: All 9 categories of Vercel AI SDK docs are covered with no major gaps
- [ ] AC11: Every .mdx file in Source Material was read during development (no skipped sources)

## Spec (Token-Efficient)

```
Output: skills/vercel-ai-sdk/
  SKILL.md             → tier 2, sdk-version: 4.x, INDEX (≤30 lines)
  sections/             → structure determined by /plan

Source: C:\github\terceiros\vercel-ai-sdk\content\docs\ (90+ .mdx files)
  MANDATORY: every .mdx file MUST be read and synthesized
  Categories: foundations, getting-started, agents, ai-sdk-core, ai-sdk-ui, ai-sdk-rsc (migration), advanced, reference, troubleshooting

Content strategy: hybrid — API signature + 1 pattern + 1 gotcha + params table (~150 lines/section)
RELATED markers: added where sections have strong cross-topic dependencies

Supporting docs:
  docs/submit-to-vercel.md → Guide for submitting to Vercel AI SDK repo as official agent docs
```

## Next Steps

Ready for `/plan` to define the skill file structure based on the Source Material.

Key guidance:
1. `/plan` MUST read the Source Material .mdx files to determine structure
2. Read `skills/gemini-nano-banana/` as the ISS Tier 2 structural template
3. Read `skills/indexed-skill-creator/SKILL.md` for authoring best practices
4. Structure (file names, SECTION count, organization) comes from planning, not this spec
5. Validate frontmatter against `schema/v0.1.json`
