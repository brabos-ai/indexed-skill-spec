# Plan: 0002F-vercel-ai-sdk-skill

## Overview

Create an ISS Tier 2 indexed skill for the Vercel AI SDK v4.x by synthesizing ~90 official .mdx docs into 10 section files. Uses a hybrid organization: follows official categories but splits core/ into 3 focused files and merges advanced/ into a production concerns file. All content synthesized from official .mdx source material — no hallucination.

---

## Structure

```
skills/vercel-ai-sdk/
├── SKILL.md                      # frontmatter + INDEX (10 entries, ≤30 lines)
└── sections/
    ├── foundations.md             # 5 SECTIONs (~150 lines)
    ├── getting-started.md         # 3 SECTIONs (~120 lines)
    ├── agents.md                  # 5 SECTIONs (~180 lines)
    ├── core-generation.md         # 4 SECTIONs (~200 lines)
    ├── core-tools.md              # 4 SECTIONs (~180 lines)
    ├── core-infra.md              # 6 SECTIONs (~180 lines)
    ├── ui.md                      # 6 SECTIONs (~200 lines)
    ├── production.md              # 5 SECTIONs (~120 lines)
    ├── reference.md               # 3 SECTIONs (~100 lines)
    └── troubleshooting.md         # 7 SECTIONs (~150 lines)
```

**Target total:** ~1,500 lines across all section files + SKILL.md

---

## SKILL.md

```yaml
---
name: vercel-ai-sdk
description: >
  Official agent documentation for the Vercel AI SDK (v4.x). Covers text generation,
  streaming, structured output, tool calling, MCP, agents, UI hooks, and deployment.
indexed-skill: tier 2
sdk-version: "4.x"
---
```

INDEX (10 entries):
```
<!-- INDEX
@sections/foundations.md | foundations | providers, models, prompts, tools overview, streaming, provider-options
@sections/getting-started.md | getting-started | Next.js, Node.js, Svelte, Nuxt, Expo, TanStack Start, coding agents
@sections/agents.md | agents | ToolLoopAgent, workflows, loop control, memory, subagents
@sections/core-generation.md | text-generation | generateText, streamText, Output, generateObject, streamObject, settings
@sections/core-tools.md | tools | tool, dynamicTool, MCP, createMCPClient, tool approval, multi-step
@sections/core-infra.md | infrastructure | middleware, providers, embeddings, image, speech, video, testing, telemetry
@sections/ui.md | ui | useChat, useCompletion, useObject, generative UI, transport, persistence, stream protocol
@sections/production.md | production | caching, rate limiting, deployment, error handling, backpressure
@sections/reference.md | reference | Core API index, UI API index, error types
@sections/troubleshooting.md | troubleshooting | streaming errors, useChat issues, tool problems, TypeScript, deployment
-->
```

---

## Section File Content Maps

### foundations.md — 5 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `providers` | `provider,openai,anthropic,model,gateway,@ai-sdk` | `02-foundations/02-providers-and-models.mdx`, `02-getting-started/00-choosing-a-provider.mdx` | Provider catalog table (first-party + community), model capability matrix, gateway setup |
| `prompts` | `prompt,system,messages,CoreMessage,ModelMessage,UIMessage,image,file` | `02-foundations/03-prompts.mdx` | Message types (user/assistant/tool), multimodal content parts, `convertToModelMessages` |
| `tools-overview` | `tool,inputSchema,execute,zod,jsonSchema,toolChoice,provider-defined` | `02-foundations/04-tools.mdx` | Tool concept: custom, provider-defined, provider-executed; schema options; toolsets |
| `streaming` | `streamText,textStream,fullStream,toUIMessageStreamResponse,smoothStream` | `02-foundations/05-streaming.mdx`, `02-foundations/01-overview.mdx` | Streaming concepts, stream types, consumer patterns |
| `provider-options` | `providerOptions,reasoningEffort,thinking,budgetTokens,cacheControl` | `02-foundations/06-provider-options.mdx` | OpenAI reasoning options, Anthropic thinking/speed, type-safe provider options |

### getting-started.md — 3 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `quickstart-pattern` | `streamText,useChat,convertToModelMessages,toUIMessageStreamResponse,tool,stepCountIs` | `02-nextjs-app-router.mdx` (reference impl) | Common pattern: route handler + `streamText` + `convertToModelMessages` + tools + `stopWhen`. One canonical example. |
| `framework-diffs` | `Next.js,SvelteKit,Nuxt,Node.js,Expo,TanStack` | `03-nextjs-pages-router.mdx`, `04-svelte.mdx`, `05-nuxt.mdx`, `06-nodejs.mdx`, `07-expo.mdx`, `08-tanstack-start.mdx` | Table of framework-specific differences: file paths, routing, env vars, transport config, Chat class (Svelte/Vue) vs useChat (React), Expo polyfills |
| `coding-agents` | `coding agent,skills,devToolsMiddleware,wrapLanguageModel` | `09-coding-agents.mdx`, `01-navigating-the-library.mdx` | Installing skills, DevTools middleware, SDK layer decision guide |

**Synthesis strategy:** The 7 quickstarts are 90% identical. Extract the common pattern ONCE, then a comparison table for framework-specific scaffolding differences.

### agents.md — 5 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `building-agents` | `ToolLoopAgent,generate,stream,createAgentUIStreamResponse,InferAgentUIMessage` | `03-agents/02-building-agents.mdx` | ToolLoopAgent signature, lifecycle callbacks, Output integration, streaming |
| `workflows` | `generateText,Promise.all,sequential,parallel,orchestrator,routing` | `03-agents/03-workflows.mdx` | Workflow patterns: sequential, parallel, routing, orchestrator-worker, evaluator-optimizer |
| `loop-control` | `stopWhen,stepCountIs,hasToolCall,prepareStep,toolChoice,activeTools` | `03-agents/04-loop-control.mdx`, `05-configuring-call-options.mdx` | Stop conditions, `prepareStep` for dynamic config, `callOptionsSchema` |
| `memory` | `anthropic.tools.memory,Mem0,createHindsightTools,lettaCloud,supermemoryTools` | `03-agents/06-memory.mdx` | Memory providers: Anthropic built-in, Mem0, Letta, Supermemory, Hindsight, custom tools |
| `subagents` | `ToolLoopAgent,readUIMessageStream,toModelOutput,abortSignal,InferAgentUIMessage` | `03-agents/06-subagents.mdx` | Subagent delegation: tool wrapper, stream consumption, context isolation |

### core-generation.md — 4 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `generate-text` | `generateText,onStepFinish,onFinish,text,steps,toolCalls` | `03-ai-sdk-core/05-generating-text.mdx` | Signature, callbacks, multi-step, sources, abort handling |
| `stream-text` | `streamText,textStream,fullStream,toUIMessageStreamResponse,onChunk,smoothStream` | `03-ai-sdk-core/05-generating-text.mdx` | Streaming signature, stream types (textStream, fullStream), transforms, `smoothStream` |
| `structured-output` | `Output.object,Output.array,Output.choice,Output.json,generateObject,streamObject` | `03-ai-sdk-core/10-generating-structured-data.mdx` | Output API: object/array/choice/json/text, schema, partial streaming, enum classification |
| `settings` | `maxOutputTokens,temperature,topP,topK,presencePenalty,frequencyPenalty,abortSignal,timeout` | `03-ai-sdk-core/25-settings.mdx`, `20-prompt-engineering.mdx` | Common generation settings table, prompt debugging tips |

### core-tools.md — 4 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `tool-calling` | `tool,execute,inputSchema,dynamicTool,needsApproval,experimental_repairToolCall` | `03-ai-sdk-core/15-tools-and-tool-calling.mdx` | Tool definition, multi-step calls, approval flow, repair, dynamic tools, TypedToolCall |
| `mcp-tools` | `createMCPClient,mcpClient.tools,StreamableHTTPClientTransport,StdioClientTransport` | `03-ai-sdk-core/16-mcp-tools.mdx` | MCP client setup, tool/resource/prompt consumption, transport options, elicitation |
| `tool-ui-integration` | `useChat,addToolOutput,addToolApprovalResponse,sendAutomaticallyWhen,onToolCall` | `04-ai-sdk-ui/03-chatbot-tool-usage.mdx` | Client-side tool execution, approval UI, auto-send patterns, dynamic tools in chat |
| `generative-ui` | `useChat,tool,UIMessage,parts,convertToModelMessages` | `04-ai-sdk-ui/04-generative-user-interfaces.mdx` | Rendering React components from tool results, typed tool parts |

### core-infra.md — 6 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `middleware` | `wrapLanguageModel,LanguageModelV3Middleware,extractReasoningMiddleware,defaultSettingsMiddleware` | `03-ai-sdk-core/40-middleware.mdx` | Middleware API, built-in middlewares (reasoning, JSON, streaming sim, defaults, tool examples), custom middleware |
| `provider-management` | `customProvider,createProviderRegistry,gateway,registry.languageModel` | `03-ai-sdk-core/45-provider-management.mdx` | Custom providers, provider registry, centralized model management |
| `embeddings` | `embed,embedMany,cosineSimilarity,wrapEmbeddingModel,rerank` | `03-ai-sdk-core/30-embeddings.mdx`, `31-reranking.mdx` | Single/batch embedding, similarity, reranking, middleware |
| `media` | `generateImage,experimental_transcribe,experimental_generateSpeech,experimental_generateVideo` | `35-image-generation.mdx`, `36-transcription.mdx`, `37-speech.mdx`, `38-video-generation.mdx` | Image gen (providers table), transcription, TTS, video gen — all experimental |
| `testing` | `MockLanguageModelV3,MockEmbeddingModelV3,simulateReadableStream,ai/test` | `03-ai-sdk-core/55-testing.mdx` | Mock providers, stream simulation, unit test patterns |
| `telemetry` | `experimental_telemetry,TelemetryIntegration,devToolsMiddleware,bindTelemetryIntegration` | `03-ai-sdk-core/60-telemetry.mdx`, `65-devtools.mdx`, `65-event-listeners.mdx` | OpenTelemetry spans, integrations API, DevTools UI, lifecycle events reference |

### ui.md — 6 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `use-chat` | `useChat,sendMessage,convertToModelMessages,toUIMessageStreamResponse,DefaultChatTransport` | `04-ai-sdk-ui/02-chatbot.mdx` | Full useChat reference: state, status, callbacks, attachments, reasoning, sources |
| `use-completion` | `useCompletion,completion,complete,handleSubmit,handleInputChange` | `04-ai-sdk-ui/05-completion.mdx` | useCompletion hook: input handling, loading, cancellation |
| `use-object` | `useObject,submit,stop,isLoading,Output.object,Output.choice` | `04-ai-sdk-ui/08-object-generation.mdx` | Streaming structured JSON to UI, classification mode |
| `streaming-data` | `createUIMessageStream,createUIMessageStreamResponse,writer,onData` | `04-ai-sdk-ui/20-streaming-data.mdx` | Custom data parts (persistent/transient), data reconciliation by ID |
| `transport` | `DefaultChatTransport,TextStreamChatTransport,DirectChatTransport,ChatTransport` | `04-ai-sdk-ui/21-transport.mdx`, `50-stream-protocol.mdx` | Transport types, stream protocol spec (text + SSE data), custom transport |
| `persistence` | `initialMessages,validateUIMessages,consumeStream,generateMessageId,resume` | `03-chatbot-message-persistence.mdx`, `03-chatbot-resume-streams.mdx`, `25-message-metadata.mdx` | Save/load messages, validate, resume streams, metadata, error handling |

### production.md — 5 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `caching` | `wrapLanguageModel,LanguageModelV3Middleware,simulateReadableStream,onFinish` | `06-advanced/04-caching.mdx` | Middleware caching (Redis), onFinish caching, stream replay |
| `rate-limiting` | `Ratelimit,@upstash/ratelimit,429` | `06-advanced/06-rate-limiting.mdx` | Upstash ratelimit + Vercel KV pattern |
| `deployment` | `maxDuration,Vercel,environment variables` | `06-advanced/10-vercel-deployment-guide.mdx` | Vercel deployment: env vars, function duration, rate limiting, firewall |
| `error-handling` | `AISDKError,try/catch,fullStream,onAbort,onError` | `03-ai-sdk-core/50-error-handling.mdx`, `04-ai-sdk-ui/21-error-handling.mdx` | Error patterns: try/catch, stream errors, abort handling, UI error states |
| `stream-control` | `stop,abortSignal,consumeStream,backpressure,ReadableStream` | `06-advanced/02-stopping-streams.mdx`, `03-backpressure.mdx` | Cancellation (client/server), backpressure patterns, `onAbort` cleanup |

### reference.md — 3 SECTIONs

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `core-api` | `generateText,streamText,Output,tool,embed,rerank,generateImage,wrapLanguageModel` | `07-reference/01-ai-sdk-core/` | Core API function index table: function, signature summary, link context |
| `ui-api` | `useChat,useCompletion,useObject,convertToModelMessages,createUIMessageStream,DirectChatTransport` | `07-reference/02-ai-sdk-ui/` | UI API function index table |
| `error-types` | `AISDKError,APICallError,NoObjectGeneratedError,NoTextGeneratedError,TypeValidationError` | `07-reference/05-ai-sdk-errors/` | Error class index: name, when thrown, key properties |

### troubleshooting.md — 7 SECTIONs (grouped by theme)

| SECTION ID | Keywords | Source .mdx Files | Content |
|------------|----------|-------------------|---------|
| `streaming-issues` | `streamText,toUIMessageStreamResponse,smoothStream,onFinish` | `01-azure-stream-slow`, `04-strange-stream-output`, `06-streaming-not-working-*`, `07-unclosed-streams`, `15-stream-text-not-working`, `16-streaming-status-delay` | 7 streaming issues: symptom → cause → fix table |
| `usechat-issues` | `useChat,sendMessage,DefaultChatTransport,convertToModelMessages` | `08-use-chat-failed-*`, `10-tools-no-response`, `11-custom-request`, `12-an-error-occurred`, `13-repeated-messages`, `17-stale-body`, `50-react-max-depth` | 7 useChat issues: symptom → cause → fix table |
| `tool-issues` | `tool,execute,addToolOutput,Output.object,stopWhen` | `05-tool-invocation-missing`, `14-tool-calling-structured`, `18-ontoolcall-type`, `21-missing-tool-results` | 4 tool issues: symptom → cause → fix table |
| `typescript-issues` | `TypeScript,zod,LanguageModelV1,@types/react` | `12-typescript-performance-zod`, `19-unsupported-model-version`, `30-model-not-assignable`, `40-cannot-find-jsx` | 4 TS issues: symptom → cause → fix table |
| `deployment-issues` | `maxDuration,Vercel,abort,resume` | `06-timeout-on-vercel`, `14-stream-abort-handling`, `15-abort-breaks-resumable` | 3 deployment issues: symptom → cause → fix table |
| `rsc-issues` | `createStreamableUI,@ai-sdk/rsc,Server Action` | `03-server-actions`, `05-streamable-ui-errors`, `09-client-stream-error`, `60-jest-module` | 4 RSC/legacy issues: symptom → cause → fix table |
| `performance-issues` | `experimental_include,experimental_throttle,memory` | `70-high-memory-usage` | Memory leak with images, throttle for render perf |

---

## Content Synthesis Strategy

For EACH section, the developer agent MUST:

1. **READ** the mapped .mdx source files (listed in "Source .mdx Files" column)
2. **EXTRACT** API signatures, key parameters, return types
3. **SYNTHESIZE** into hybrid format:
   - Function signature (params table)
   - 1 key usage pattern (minimal code)
   - 1 gotcha/common mistake
   - Cross-reference via `<!-- RELATED: sections/{file}.md#{id} -->`
4. **TARGET** ~80-200 lines per SECTION (ISS best practice from indexed-skill-creator)

---

## Source → Section Mapping (Coverage Verification)

| Source Category | Files | Mapped To |
|----------------|-------|-----------|
| 02-foundations/ (6 files) | ALL 6 | `foundations.md` |
| 02-getting-started/ (10 files) | ALL 10 | `getting-started.md` |
| 03-agents/ (7 files) | ALL 7 | `agents.md` |
| 03-ai-sdk-core/ (20 files) | 05,10 → `core-generation.md`; 15,16 → `core-tools.md`; 20,25 → `core-generation.md`; 30,31,35-38 → `core-infra.md`; 40,45 → `core-infra.md`; 50 → `production.md`; 55,60,65,65 → `core-infra.md`; 01 → skip (intro only) |
| 04-ai-sdk-ui/ (14 files) | 02,05,08 → `ui.md`; 03-chatbot-tool-usage,04 → `core-tools.md`; 03-persistence,03-resume,25 → `ui.md`; 20,21-transport,50 → `ui.md`; 21-error,24 → `ui.md` + `production.md`; 01 → skip (intro) |
| 05-ai-sdk-rsc/ (10 files) | 10-migrating → `ui.md` (RSC migration SECTION); rest → skip (legacy) |
| 06-advanced/ (11 files) | 04,06 → `production.md`; 02,03 → `production.md`; 10 → `production.md`; 01,05,07,08,09,09 → skip/conceptual |
| 07-reference/ (4 dirs) | ALL → `reference.md` |
| 09-troubleshooting/ (31 files) | ALL 31 → `troubleshooting.md` (7 themed SECTIONs) |

**Files explicitly skipped (justified):**
- `core/01-overview.mdx` — 32 lines, fully subsumed by generating-text
- `ui/01-overview.mdx` — 45 lines, fully subsumed by chatbot.mdx
- `advanced/01-prompt-engineering.mdx` — conceptual LLM intro, no SDK content
- `advanced/05-multiple-streamables.mdx` — RSC-only, deprecated
- `advanced/07-rendering-ui-with-language-models.mdx` — conceptual, covered by generative-ui
- `advanced/08-model-as-router.mdx` — conceptual, no actionable code
- `advanced/09-multistep-interfaces.mdx` — conceptual, covered by tools multi-step
- `advanced/09-sequential-generations.mdx` — 56 lines, trivial pattern
- `ai-sdk-rsc/01-09` (except migration) — legacy, per about.md decision

---

## RELATED Cross-References (Key Links)

| From | To | Why |
|------|----|-----|
| `core-generation.md#stream-text` | `ui.md#use-chat` | streamText feeds useChat |
| `core-generation.md#generate-text` | `agents.md#building-agents` | generateText is the agent core |
| `core-tools.md#tool-calling` | `agents.md#building-agents` | Tools power agents |
| `core-tools.md#tool-ui-integration` | `ui.md#use-chat` | Tool results in chat UI |
| `core-infra.md#middleware` | `production.md#caching` | Caching via middleware |
| `agents.md#workflows` | `core-generation.md#generate-text` | Workflows use generateText |
| `ui.md#transport` | `production.md#deployment` | Transport config affects deployment |

---

## Implementation Order

1. **SKILL.md** — frontmatter + INDEX (depends on nothing)
2. **foundations.md** — base concepts, no dependencies
3. **core-generation.md** — generateText/streamText (core APIs)
4. **core-tools.md** — tools (depends on core-generation for context)
5. **core-infra.md** — middleware, embeddings, media, testing
6. **agents.md** — ToolLoopAgent (depends on core-generation + core-tools)
7. **ui.md** — useChat, hooks (depends on core-generation)
8. **getting-started.md** — quickstart patterns (depends on core + ui for references)
9. **production.md** — caching, deployment (depends on core-infra)
10. **reference.md** — API index tables (depends on all core + ui sections)
11. **troubleshooting.md** — issues (depends on all previous for RELATED refs)
12. **docs/submit-to-vercel.md** — submission guide (standalone)

---

## Main Flow

1. Developer agent reads SKILL.md → detects `indexed-skill: tier 2`
2. Agent reads INDEX (10 entries, ~12 lines) → matches keyword to section file
3. Agent reads section file → scans SECTION markers → matches keywords
4. Agent reads only the matched SECTION block (~80-200 lines)
5. If cross-topic need → follows `<!-- RELATED -->` marker to another section

---

## Requirements Coverage

| ID | Requirement | Covered? | Section | Tasks |
|----|-------------|----------|---------|-------|
| AC01 | SKILL.md frontmatter | ✅ | SKILL.md | 1.1 |
| AC02 | INDEX covers all sections | ✅ | SKILL.md | 1.1 |
| AC03 | SECTION markers correct | ✅ | All sections | 2.1-11.1 |
| AC04 | Keywords are real SDK APIs | ✅ | All sections | 2.1-11.1 |
| AC05 | INDEX ≤ 30 lines | ✅ | SKILL.md (10 entries = ~12 lines) | 1.1 |
| AC06 | Content from official .mdx | ✅ | All sections | 2.1-11.1 |
| AC07 | RSC migration note | ✅ | ui.md (persistence SECTION) | 7.1 |
| AC08 | RELATED markers | ✅ | Cross-refs table above | 2.1-11.1 |
| AC09 | submit-to-vercel.md | ✅ | docs/ | 12.1 |
| AC10 | All 9 categories covered | ✅ | Source mapping table | 2.1-11.1 |
| AC11 | Every .mdx read | ✅ | Source mapping + skip justifications | 2.1-11.1 |

**Status:** ✅ 100% covered

---

## Quick Reference

| Pattern | How to Find |
|---------|-------------|
| ISS Tier 2 template | `skills/gemini-nano-banana/` |
| SECTION marker syntax | `skills/indexed-skill-creator/SKILL.md` |
| Frontmatter validation | `schema/v0.1.json` |
| Source .mdx files | `C:\github\terceiros\vercel-ai-sdk\content\docs\` |
