<!-- SECTION:generate-text | keywords: generateText,onStepFinish,onFinish,text,steps,toolCalls,sources,abortSignal | Generate text (non-streaming) -->
## `generateText`

Ideal for non-interactive use cases (drafting, summarization) and tool-using agents.

```ts
import { generateText } from 'ai';

const { text, toolCalls, steps, usage, sources } = await generateText({
  model,
  system: 'You are a concise writer.',
  prompt: 'Summarize this article.',
  onStepFinish({ stepNumber, finishReason, usage }) { /* per-step logging */ },
  onFinish({ text, finishReason, usage, steps, totalUsage }) { /* final hook */ },
  abortSignal: AbortSignal.timeout(10_000),
});
```

**Key result properties**

| Property | Description |
|---|---|
| `text` | Final generated text |
| `toolCalls` / `toolResults` | From the last step |
| `steps` | All intermediate steps (multi-turn) |
| `totalUsage` | Aggregated token usage across all steps |
| `sources` | Grounding URLs (Perplexity, Google, etc.) |
| `output` | Typed structured output when `output:` is set |
| `response.headers` / `.body` | Raw provider response for debugging |

**Pattern — multi-step with per-step callback**

```ts
const result = await generateText({
  model,
  tools: { myTool },
  stopWhen: stepCountIs(5),
  onStepFinish({ stepNumber, finishReason, usage }) {
    console.log(`step ${stepNumber}`, finishReason, usage);
  },
  prompt: 'Research and summarize recent AI news.',
});
```

**Gotcha:** `onStepFinish` / `onFinish` errors are silently caught — they never break the generation flow. Log inside the callbacks; do not throw.
<!-- RELATED: sections/agents.md#building-agents -->
<!-- /SECTION:generate-text -->

<!-- SECTION:stream-text | keywords: streamText,textStream,fullStream,toUIMessageStreamResponse,onChunk,smoothStream,experimental_transform,elementStream | Stream text -->
## `streamText`

Use for interactive UIs (chat, real-time output). Returns a result object immediately; streaming begins in the background.

```ts
import { streamText, smoothStream } from 'ai';

const result = streamText({
  model,
  prompt: 'Describe the history of jazz in detail.',
  experimental_transform: smoothStream(),    // optional: smooth token bursts
  onChunk({ chunk }) {
    if (chunk.type === 'text') process.stdout.write(chunk.text);
  },
  onFinish({ text, usage, steps }) { /* persist history here */ },
  onError({ error }) { console.error(error); }, // required for error visibility
});

// consume as async iterable
for await (const delta of result.textStream) {
  process.stdout.write(delta);
}

// or pipe to Next.js Route Handler
return result.toUIMessageStreamResponse();
```

**Stream access options**

| API | Use case |
|---|---|
| `result.textStream` | Plain text deltas (AsyncIterable + ReadableStream) |
| `result.fullStream` | All typed events: `text-delta`, `tool-call`, `source`, `finish`, `error`, etc. |
| `result.toUIMessageStreamResponse()` | HTTP Response for AI SDK UI (`useChat`) |
| `result.toTextStreamResponse()` | Minimal HTTP text stream |
| `result.partialOutputStream` | Partial structured object stream (requires `output:`) |
| `result.elementStream` | Completed array elements stream (requires `Output.array()`) |

**Pattern — `fullStream` for custom rendering**

```ts
for await (const part of result.fullStream) {
  if (part.type === 'text-delta') appendText(part.text);
  if (part.type === 'tool-result') renderToolResult(part);
  if (part.type === 'source') addCitation(part.url);
}
```

**Gotcha:** `streamText` suppresses thrown errors into the stream to prevent server crashes. Always attach an `onError` callback — otherwise errors are silently swallowed.
<!-- RELATED: sections/ui.md#use-chat -->
<!-- /SECTION:stream-text -->

<!-- SECTION:structured-output | keywords: Output.object,Output.array,Output.choice,Output.json,generateObject,streamObject,partialOutputStream,elementStream,NoObjectGeneratedError | Structured output -->
## Structured Output

Structured output is built into `generateText` / `streamText` via the `output` property. No separate `generateObject` / `streamObject` functions exist in SDK v5.

```ts
import { generateText, Output } from 'ai';
import { z } from 'zod';

const { output } = await generateText({
  model,
  output: Output.object({
    name: 'Recipe',
    schema: z.object({
      name: z.string().describe('Recipe name'),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

**Output type variants**

| Factory | Returns | Notes |
|---|---|---|
| `Output.object({ schema })` | Typed object | Schema-validated; use Zod `.describe()` for quality |
| `Output.array({ element })` | Typed array | Stream per-element via `elementStream` |
| `Output.choice({ options })` | One string from list | Enum classification; throws if model deviates |
| `Output.json()` | `unknown` JSON | No schema validation; flexible shapes |
| `Output.text()` | `string` | Explicit plain text (SDK default when no `output`) |

**Pattern — streaming an array of objects**

```ts
const { elementStream } = streamText({
  model,
  output: Output.array({ element: z.object({ name: z.string(), class: z.string() }) }),
  prompt: 'Generate 3 RPG hero descriptions.',
});
for await (const hero of elementStream) {
  console.log(hero); // each element is complete and validated
}
```

**Gotcha:** Structured output counts as one step. When combining with tools, set `stopWhen: stepCountIs(n)` high enough to allow both tool calls and the final output generation step. Catch `NoObjectGeneratedError` to inspect `error.text` and `error.cause` when schema validation fails.
<!-- /SECTION:structured-output -->

<!-- SECTION:settings | keywords: maxOutputTokens,temperature,topP,topK,presencePenalty,frequencyPenalty,abortSignal,timeout,maxRetries,seed,stopSequences,headers,warnings | Common generation settings -->
## Common Generation Settings

All `generateText` / `streamText` calls accept these settings alongside `model` and `prompt`.

| Setting | Type | Default | Description |
|---|---|---|---|
| `maxOutputTokens` | `number` | provider default | Hard cap on tokens generated |
| `temperature` | `number` | provider default | Randomness — `0` = near-deterministic |
| `topP` | `number` | — | Nucleus sampling; do not combine with `temperature` |
| `topK` | `number` | — | Top-K sampling; advanced use only |
| `presencePenalty` | `number` | `0` | Penalises repeating topics already in prompt |
| `frequencyPenalty` | `number` | `0` | Penalises repeated words/phrases |
| `stopSequences` | `string[]` | — | Stop generation when any sequence appears |
| `seed` | `number` | — | Deterministic sampling (model must support it) |
| `maxRetries` | `number` | `2` | Set `0` to disable retries |
| `abortSignal` | `AbortSignal` | — | Forward from request or use `AbortSignal.timeout()` |
| `timeout` | `number \| object` | — | Shorthand; supports `totalMs`, `stepMs`, `chunkMs` |
| `headers` | `Record<string,string>` | — | Extra HTTP headers (HTTP providers only) |

**Pattern — structured/tool calls with deterministic settings**

```ts
const result = await generateText({
  model,
  temperature: 0,           // recommended for tool calls and structured output
  maxOutputTokens: 1024,
  timeout: { totalMs: 30_000, stepMs: 10_000 },
  abortSignal: req.signal,  // cancel when client disconnects
  prompt: 'Extract all dates from this contract.',
});
```

**Debugging tips**

```ts
// 1. Check for unsupported-setting warnings
console.log(result.warnings);

// 2. Inspect the exact payload sent to the provider
console.log(result.request.body);
```

**Gotcha:** In AI SDK v5, `temperature` is no longer forced to `0` by default. Explicitly set `temperature: 0` for tool calling and structured output to ensure consistent, schema-conformant results.
<!-- /SECTION:settings -->
