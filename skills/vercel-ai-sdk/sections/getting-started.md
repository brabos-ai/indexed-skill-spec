<!-- SECTION:quickstart-pattern | keywords: streamText,useChat,convertToModelMessages,toUIMessageStreamResponse,tool,stepCountIs | Quickstart: Route Handler + Streaming Chat Pattern -->

The canonical pattern shared by all framework quickstarts:

**Route handler** (`POST /api/chat`):
```ts
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.5', // global gateway default
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      weather: tool({
        description: 'Get weather for a location',
        inputSchema: z.object({ location: z.string() }),
        execute: async ({ location }) => ({ location, temperature: 72 }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

**UI** (`useChat` — React / Next.js / Expo / TanStack):
```tsx
'use client';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, sendMessage } = useChat();
  // render messages[].parts — each part has .type ('text' | 'tool-{name}')
}
```

**Key params for `streamText`:**

| Param | Type | Purpose |
|-------|------|---------|
| `model` | `string \| LanguageModel` | Global gateway string or explicit provider instance |
| `messages` | `ModelMessage[]` | Convert from `UIMessage[]` via `convertToModelMessages` |
| `tools` | `Record<string, Tool>` | Named tools; tool parts appear as `tool-{name}` in UI |
| `stopWhen` | `StopCondition` | e.g. `stepCountIs(5)` enables multi-step tool loops |
| `onStepFinish` | `callback` | Fires after each LLM step; receives `{ toolResults }` |

**Key flow:**
1. Client sends `UIMessage[]` → server calls `convertToModelMessages` to strip UI metadata → `ModelMessage[]` goes to LLM.
2. `streamText` returns a `StreamTextResult`; call `.toUIMessageStreamResponse()` to return the HTTP response.
3. `useChat` on the client receives the stream; message parts are accessed via `message.parts[].type`.

**Gotcha:** Without `stopWhen`, generation stops after the first step that produces tool calls — the model will NOT automatically use tool results to continue generating a final text answer. Set `stopWhen: stepCountIs(N)` to allow multi-step loops.

<!-- /SECTION:quickstart-pattern -->

<!-- SECTION:framework-diffs | keywords: Next.js,SvelteKit,Nuxt,Node.js,Expo,TanStack | Framework-Specific Differences -->

All quickstarts share the same core pattern. Differences are scaffolding-level only:

| Framework | UI Package | Route File | Env File | Env Var | Notes |
|-----------|-----------|------------|----------|---------|-------|
| Next.js App Router | `@ai-sdk/react` | `app/api/chat/route.ts` | `.env.local` | `AI_GATEWAY_API_KEY` | Default global gateway; standard `export async function POST` |
| Next.js Pages Router | `@ai-sdk/react` | `pages/api/chat.ts` | `.env.local` | `AI_GATEWAY_API_KEY` | Uses `export default` API handler style |
| SvelteKit | `@ai-sdk/svelte` | `src/routes/api/chat/+server.ts` | `.env.local` | imported via `$env/static/private` | Must use `createGateway({ apiKey })` — Vite does not expose `process.env` automatically; use `Chat` class from `@ai-sdk/svelte` |
| Nuxt (Vue) | `@ai-sdk/vue` | `server/api/chat.ts` | `.env` | `NUXT_AI_GATEWAY_API_KEY` | Must configure `runtimeConfig` in `nuxt.config.ts`; access via `useRuntimeConfig()`; uses `defineLazyEventHandler` + `readBody` |
| Node.js | _(none — CLI)_ | `index.ts` | `.env` | `AI_GATEWAY_API_KEY` | No UI hooks; use `readline` for terminal loop; requires `dotenv/config` |
| Expo | `@ai-sdk/react` | `app/api/chat+api.ts` | `.env.local` | `AI_GATEWAY_API_KEY` | `toUIMessageStreamResponse` must pass `headers: { 'Content-Type': 'application/octet-stream', 'Content-Encoding': 'none' }`; requires Expo 52+ |
| TanStack Start | `@ai-sdk/react` | Server function file | `.env` | `AI_GATEWAY_API_KEY` | Uses TanStack server functions; `useChat` from `@ai-sdk/react` |

**UI hook by framework:**

| Framework | Hook/Class | Import |
|-----------|-----------|--------|
| React (Next.js, Expo, TanStack) | `useChat` | `@ai-sdk/react` |
| Svelte / SvelteKit | `Chat` class | `@ai-sdk/svelte` |
| Vue / Nuxt | `useChat` | `@ai-sdk/vue` |

**Provider instantiation differences:**
- Next.js / Expo / TanStack / Node.js: global gateway default works via string `model` (env var picked up automatically from `process.env`).
- SvelteKit: must call `createGateway({ apiKey: AI_GATEWAY_API_KEY })` explicitly, importing the key from `$env/static/private`.
- Nuxt: must call `createGateway({ apiKey: useRuntimeConfig().aiGatewayApiKey })` using Nuxt runtime config.

**Gotcha:** Nuxt env var must be prefixed `NUXT_` (e.g., `NUXT_AI_GATEWAY_API_KEY`) for automatic runtime config injection. The plain `AI_GATEWAY_API_KEY` name used in other frameworks will not auto-populate Nuxt's `runtimeConfig`.

<!-- /SECTION:framework-diffs -->

<!-- SECTION:coding-agents | keywords: coding agent,skills,devToolsMiddleware,wrapLanguageModel | Coding Agents: Skills, DevTools, and SDK Layer Guide -->

## Installing the AI SDK Skill

Give a coding agent (Claude Code, Codex, Cursor, etc.) deep SDK knowledge via the official skill:

```bash
npx skills add vercel/ai
```

This installs a lightweight markdown skill into the agent's skills directory (`.claude/skills`, `.codex/skills`, or `.agents/skills` for universal with `-a amp`). Agents supporting the [Agent Skills](https://agentskills.io) format load it on demand — only when the task requires it (progressive disclosure).

The installed `ai` package also bundles docs and source at `node_modules/ai/docs/` and `node_modules/ai/src/` — agents can read these directly for accurate, version-matched API signatures.

## DevTools Middleware

Wraps any language model to capture all LLM interactions during local development:

```ts
import { wrapLanguageModel, gateway } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';

const model = wrapLanguageModel({
  model: gateway('anthropic/claude-sonnet-4.5'),
  middleware: devToolsMiddleware(),
});
```

Launch the viewer in a separate terminal:
```bash
npx @ai-sdk/devtools   # opens http://localhost:4983
```

DevTools captures: input prompts, output content, tool calls, token usage, timing, and raw provider payloads. Multi-step interactions are grouped into **runs** (full interaction) and **steps** (each LLM call).

**Key params for `wrapLanguageModel`:**

| Param | Type | Purpose |
|-------|------|---------|
| `model` | `LanguageModel` | The base model to wrap |
| `middleware` | `LanguageModelMiddleware` | One or more middleware (e.g. `devToolsMiddleware()`) |

**SDK layer decision guide:**

| You need... | Use |
|-------------|-----|
| LLM calls in any JS env, no UI | AI SDK Core (`streamText`, `generateText`) |
| Streaming chat UI in React/Svelte/Vue | AI SDK UI (`useChat`, `Chat`) |
| Streaming UI from React Server Components | AI SDK RSC (`streamUI`) — experimental, prefer UI |
| Visibility into LLM calls during dev | `@ai-sdk/devtools` + `wrapLanguageModel` |
| Deep agent knowledge of SDK | `npx skills add vercel/ai` |

**Gotcha:** `@ai-sdk/devtools` is experimental and intended for local development only. It writes interaction data to `.devtools/generations.json` (auto-added to `.gitignore`). Do not use in production.

<!-- /SECTION:coding-agents -->
