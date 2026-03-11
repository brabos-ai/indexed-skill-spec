# How to Submit the Vercel AI SDK Indexed Skill to the Official Repository

This guide explains how to propose the `vercel-ai-sdk` indexed skill as official agent documentation in the Vercel AI SDK repository.

---

## What you're submitting

An ISS Tier 2 indexed skill at `skills/vercel-ai-sdk/` that allows AI agents to surgically load only the relevant Vercel AI SDK documentation sections instead of ingesting all docs at once.

This is agent-first documentation — not tutorials, not API references for humans. It's structured for agents to read efficiently during coding tasks.

---

## Option 1 — GitHub Discussion (recommended first step)

Open a Discussion in the Vercel AI SDK repository:

**Repository:** `vercel/ai`
**Category:** Ideas / RFC

**Title:**
```
[RFC] Official agent documentation for Vercel AI SDK using Indexed Skills Specification (ISS)
```

**Body template:**
```markdown
## Summary

I've created an ISS-indexed skill for the Vercel AI SDK that enables AI agents (Claude Code, Gemini, Copilot, etc.) to surgically load only the relevant SDK documentation during coding tasks.

## The Problem

When agents work on Vercel AI SDK projects, they either:
- Load the full docs (thousands of lines → context waste + cost)
- Skip docs entirely → miss important patterns, make errors

## The Solution

An [Indexed Skills Specification (ISS)](https://github.com/xmaiconx/indexed-skill-spec) compliant skill:
- `SKILL.md` with Tier 2 INDEX (≤ 30 lines) pointing to 10 section files
- Each section: synthesized signatures + key pattern + gotcha (~80-200 lines)
- Agents load only what they need: e.g., "how do I use streamText with tools?" → reads ~180 lines from `sections/core-generation.md`, not 8,000+ lines

## What I'm proposing

Add `agent-docs/` (or similar) to the Vercel AI SDK repo with:
- `agent-docs/SKILL.md` — ISS Tier 2 entry point
- `agent-docs/sections/*.md` — 8 synthesized section files

OR link from the README to the indexed skill as a community resource.

## Links

- Indexed Skill: [github.com/xmaiconx/indexed-skill-spec/tree/main/skills/vercel-ai-sdk](https://github.com/xmaiconx/indexed-skill-spec/tree/main/skills/vercel-ai-sdk)
- ISS Specification: [github.com/xmaiconx/indexed-skill-spec](https://github.com/xmaiconx/indexed-skill-spec)

Happy to open a PR if there's interest.
```

---

## Option 2 — Pull Request

If the Discussion gets positive signal (or if you want to be direct):

**Branch name:** `feat/agent-docs-indexed-skill`

**PR Title:**
```
feat: add ISS indexed skill for agent-efficient documentation loading
```

**Where to add the files:**
- Preferred: `agent-docs/` directory at repo root
- Alternative: `docs/agent/` or alongside existing docs

**PR body template:**
```markdown
## What

Adds an [ISS Tier 2 indexed skill](https://github.com/xmaiconx/indexed-skill-spec) that enables AI agents to surgically load Vercel AI SDK documentation.

## Why

AI agents working on Vercel AI SDK projects currently have no efficient way to consume the docs. They either load everything (context waste) or skip docs (miss patterns). This skill solves both problems.

## Structure

```
agent-docs/
├── SKILL.md                # Tier 2 entry: frontmatter + INDEX (≤30 lines)
└── sections/
    ├── foundations.md       # providers, models, prompts, streaming, provider-options
    ├── getting-started.md   # Next.js, Node.js, Svelte, Nuxt, Expo, TanStack
    ├── agents.md            # building agents, workflows, memory, subagents
    ├── core-generation.md   # generateText, streamText, Output, settings
    ├── core-tools.md        # tool calling, MCP, tool UI integration, generative UI
    ├── core-infra.md        # middleware, providers, embeddings, media, testing, telemetry
    ├── ui.md                # useChat, useCompletion, useObject, transport, persistence
    ├── production.md        # caching, rate limiting, deployment, error handling
    ├── reference.md         # API index for core, UI, errors
    └── troubleshooting.md   # streaming, useChat, tool, TS, deployment issues
```

## How agents use it

1. Agent reads `SKILL.md`, detects `indexed-skill: tier 2`
2. Agent reads INDEX (30 lines) → identifies relevant section file
3. Agent scans SECTION markers → matches keywords to task
4. Agent reads matched line range (~150 lines)

Result: 97%+ context reduction vs. loading all docs.

## Compatibility

Works with any agent that supports file reading: Claude Code, Gemini CLI, GitHub Copilot, Cursor, etc.

## ISS Specification

The format is open and documented at [indexed-skill-spec](https://github.com/xmaiconx/indexed-skill-spec). No special tooling required — just Markdown comments.
```

---

## Option 3 — Community resources / README link

If Vercel prefers not to host the files, request a link in their README or documentation:

```markdown
## Agent Documentation

An indexed skill is available for AI agents working with the Vercel AI SDK:
[vercel-ai-sdk indexed skill](https://github.com/xmaiconx/indexed-skill-spec/tree/main/skills/vercel-ai-sdk)

This enables agents to load only the relevant documentation sections during coding tasks.
```

---

## Recommended sequence

1. **Verify skill is complete and validated** (AC01–AC10 all passing)
2. **Test locally** — install in your `.claude/skills/` and verify an agent uses it correctly
3. **Open GitHub Discussion** (Option 1) to gauge interest
4. **If positive response** → open PR (Option 2)
5. **If they prefer external link** → request README addition (Option 3)

---

## PR Checklist

Before opening the PR (Option 2), verify:

- [ ] `SKILL.md` has `indexed-skill: tier 2` in YAML frontmatter
- [ ] `SKILL.md` has `sdk-version: "4.x"` in frontmatter
- [ ] `SKILL.md` INDEX has ≤ 30 lines and covers all 10 section files
- [ ] Every section file has matching `<!-- SECTION:{id} ... -->` and `<!-- /SECTION:{id} -->` markers
- [ ] All keywords in SECTION markers are real Vercel AI SDK API names (e.g. `useChat`, `streamText`, `generateText`, `convertToModelMessages`)
- [ ] No raw keyword lists contain invented API names or generic words like "streaming" alone
- [ ] Each section is ~150 lines: signature/params table + 1 key pattern + 1 gotcha
- [ ] No verbatim copy-paste of `.mdx` source files — content is synthesized
- [ ] `<!-- RELATED: sections/{file}.md#{section-id} -->` markers present where cross-section links exist
- [ ] `sections/ui.md` includes the `rsc-migration` SECTION
- [ ] Files work as standalone Markdown (no MDX components, no JSX, no `<Note>` tags)
- [ ] Tested locally: copy `skills/vercel-ai-sdk/` into a project's `.claude/skills/` and verify Claude Code reads and uses the skill correctly

---

## Contacts / where to look

- Vercel AI SDK repo: `github.com/vercel/ai`
- Look for active maintainers in recent PRs/issues
- Tag `@lgrammel` (core maintainer) or check `CONTRIBUTING.md` for preferred channels
