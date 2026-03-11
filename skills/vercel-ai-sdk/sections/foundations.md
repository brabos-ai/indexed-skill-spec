<!-- SECTION:providers | keywords: provider,openai,anthropic,model,gateway,@ai-sdk,@ai-sdk/openai,@ai-sdk/anthropic,@ai-sdk/google,ollama,openrouter,createOpenAICompatible | Provider catalog and model capabilities -->
## Providers and Models

The AI SDK abstracts provider differences via a unified [Language Model Specification](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v3). Switch providers by changing a single import.

**First-party packages** (install separately):

| Package | Provider |
|---|---|
| `@ai-sdk/openai` | OpenAI |
| `@ai-sdk/anthropic` | Anthropic |
| `@ai-sdk/google` | Google Generative AI |
| `@ai-sdk/google-vertex` | Google Vertex AI |
| `@ai-sdk/mistral` | Mistral |
| `@ai-sdk/deepseek` | DeepSeek |
| `@ai-sdk/groq` | Groq |
| `@ai-sdk/amazon-bedrock` | Amazon Bedrock |

**Community / OpenAI-compatible**: `ollama-ai-provider`, `@openrouter/ai-sdk-provider`, `workers-ai-provider`, and many more.

**AI Gateway** (zero-install, built into `ai`): authenticates with `AI_GATEWAY_API_KEY` and routes to any provider using a `"provider/model"` string.

```ts
import { generateText } from 'ai';

// Gateway (default global provider — no extra package needed)
const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4.5',
  prompt: 'What is love?',
});

// Dedicated provider
import { openai } from '@ai-sdk/openai';
const { text: text2 } = await generateText({
  model: openai('gpt-5.2'),
  prompt: 'What is love?',
});
```

**Model capability matrix (selected models)**:

| Provider | Model | Image Input | Object Gen | Tool Use | Tool Stream |
|---|---|---|---|---|---|
| OpenAI | `gpt-5.2` | Yes | Yes | Yes | Yes |
| Anthropic | `claude-sonnet-4-6` | Yes | Yes | Yes | Yes |
| Mistral | `pixtral-large-latest` | Yes | Yes | Yes | Yes |
| DeepSeek | `deepseek-reasoner` | No | Yes | Yes | Yes |
| Groq | `llama-3.3-70b-versatile` | No | Yes | Yes | Yes |

> **Gotcha**: Not all models support image input or tool streaming. Check the provider page before using multimodal or streaming tool features.
<!-- /SECTION:providers -->

<!-- SECTION:prompts | keywords: prompt,system,messages,CoreMessage,ModelMessage,UIMessage,image,file,convertToModelMessages,providerOptions,tool-result,tool-call | Prompt types and multimodal content parts -->
## Prompts

Three prompt forms are supported on `generateText` / `streamText`:

| Property | Type | Use case |
|---|---|---|
| `prompt` | `string` | Simple single-turn generation |
| `system` | `string` | Behavioral instructions (combines with `prompt` or `messages`) |
| `messages` | `ModelMessage[]` | Multi-turn chat, multimodal, tool calls |

**Message roles**: `user`, `assistant`, `tool`, `system`.

Each message's `content` can be a plain string or an array of typed parts:

- `{ type: 'text', text: string }`
- `{ type: 'image', image: Buffer | URL | string }` — base64, data URL, or http URL
- `{ type: 'file', mediaType: string, data: Buffer | URL | string }` — PDF, audio, etc.
- `{ type: 'tool-call', toolCallId, toolName, input }` — in assistant messages
- `{ type: 'tool-result', toolCallId, toolName, output }` — in tool messages

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';

const { text } = await generateText({
  model: openai('gpt-5.2'),
  messages: [
    { role: 'system', content: 'You are a nutrition expert.' },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'How many calories in this?' },
        { type: 'image', image: fs.readFileSync('./cheese.jpg') },
      ],
    },
  ],
});
```

**`UIMessage` vs `ModelMessage`**: UI hooks like `useChat` return `UIMessage[]`, which do not support `providerOptions`. Use `convertToModelMessages()` before passing them to core functions when you need message-level provider options.

> **Gotcha**: File parts (`type: 'file'`) are only supported by Google Generative AI, Google Vertex, Anthropic, and OpenAI (specific models for PDF/audio). Sending unsupported file types throws at runtime.
<!-- /SECTION:prompts -->

<!-- SECTION:tools-overview | keywords: tool,inputSchema,execute,zod,jsonSchema,toolChoice,provider-defined,tool(),valibotSchema,zodSchema,toolsets,stopWhen | Tool concept, schema options, and toolsets -->
## Tools Overview

A tool is an object with up to three properties passed to the `tools` parameter of `generateText` / `streamText`:

| Property | Required | Description |
|---|---|---|
| `description` | No | Guides the model on when to invoke the tool |
| `inputSchema` | Yes | Zod schema, JSON schema, or `jsonSchema()` wrapper |
| `execute` | No | Async function run automatically on tool call |

**Three tool types**:

| Type | Schema owner | Execution | Portability |
|---|---|---|---|
| Custom | You | Your code | Any provider |
| Provider-defined | Provider | Your code (`execute`) | Provider-specific |
| Provider-executed | Provider | Provider servers | Provider-specific |

```ts
import { tool, generateText } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

// Custom tool
const weather = tool({
  description: 'Get weather for a location',
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => ({ temperature: 22, conditions: 'sunny' }),
});

const { text } = await generateText({
  model: openai('gpt-5.2'),
  tools: { weather },
  prompt: "What's the weather in London?",
});
```

**Schema options**: Zod v3/v4 directly, `zodSchema()`, `jsonSchema()` for raw JSON Schema, `valibotSchema()` from `@ai-sdk/valibot`.

Tools are plain JS objects — package and publish them via npm for reuse across projects.

> **Gotcha**: Omitting `execute` means the tool call is returned but not run automatically. You must handle execution manually in your loop or use `stopWhen` / multi-step calls.
<!-- /SECTION:tools-overview -->

<!-- SECTION:streaming | keywords: streamText,textStream,fullStream,toUIMessageStreamResponse,smoothStream,streamObject,pipeThrough,toDataStreamResponse | Streaming concepts and consumer patterns -->
## Streaming

`streamText` returns a result object with multiple stream consumers. Use the one that matches your consumption pattern:

| Property / Method | Type | Use case |
|---|---|---|
| `textStream` | `AsyncIterable<string>` | Consume plain text deltas in a loop |
| `fullStream` | `AsyncIterable<StreamPart>` | All events: text, tool calls, reasoning, errors |
| `toDataStreamResponse()` | `Response` | Wire to an HTTP handler for `useChat` / `useCompletion` |
| `toUIMessageStreamResponse()` | `Response` | Structured UI message stream for `useChat` |
| `pipeThrough(smoothStream())` | `ReadableStream` | Smooth out character-level jitter in the stream |

```ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  prompt: 'Write a poem about embeddings.',
});

// Pattern 1: text-only loop
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// Pattern 2: full event stream (includes tool-call, reasoning, finish, etc.)
for await (const part of result.fullStream) {
  if (part.type === 'text-delta') process.stdout.write(part.textDelta);
  if (part.type === 'tool-call') console.log('Tool called:', part.toolName);
}
```

> **Gotcha**: `streamText` starts streaming immediately when called (without `await`). Awaiting it only resolves after the stream is fully consumed. Attach consumers before entering an await in your handler.
<!-- /SECTION:streaming -->

<!-- SECTION:provider-options | keywords: providerOptions,reasoningEffort,thinking,budgetTokens,cacheControl,effort,speed,reasoningSummary,textVerbosity,OpenAILanguageModelResponsesOptions,AnthropicLanguageModelOptions,GatewayLanguageModelOptions | Provider-specific options for reasoning and advanced features -->
## Provider Options

`providerOptions` passes provider-specific config that goes beyond standard settings. Options are namespaced by provider name — only the active provider's options are applied.

```ts
import { generateText } from 'ai';
import { openai, type OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai';
import { anthropic, type AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
```

**OpenAI reasoning options**:

| Option | Values | Effect |
|---|---|---|
| `reasoningEffort` | `'none'` \| `'minimal'` \| `'low'` \| `'medium'` \| `'high'` \| `'xhigh'` | Controls internal reasoning depth |
| `reasoningSummary` | `'auto'` \| `'detailed'` | Surfaces reasoning chain in response |
| `textVerbosity` | `'low'` \| `'medium'` \| `'high'` | Controls response length independently |

**Anthropic options**:

| Option | Values | Effect |
|---|---|---|
| `thinking` | `{ type: 'enabled', budgetTokens: number }` | Extended reasoning with token budget |
| `effort` | `'low'` \| `'medium'` \| `'high'` | Simplified reasoning depth control |
| `speed` | `'fast'` \| `'standard'` | ~2.5x faster output for `claude-opus-4-6` |
| `cacheControl` | `{ type: 'ephemeral' }` | Prompt caching at message/part level |

```ts
const { text, reasoning } = await generateText({
  model: anthropic('claude-opus-4-20250514'),
  prompt: 'How many people will live in the world in 2040?',
  providerOptions: {
    anthropic: {
      thinking: { type: 'enabled', budgetTokens: 12000 },
    } satisfies AnthropicLanguageModelOptions,
  },
});
```

Use `satisfies` with the exported option types (`OpenAILanguageModelResponsesOptions`, `AnthropicLanguageModelOptions`) for autocomplete and compile-time validation.

> **Gotcha**: When using the AI Gateway, use the underlying provider name as the key (e.g. `openai`, `anthropic`), not `gateway`. The gateway forwards these options to the target provider automatically.
<!-- /SECTION:provider-options -->
