<!-- SECTION:middleware | keywords: wrapLanguageModel,LanguageModelV3Middleware,extractReasoningMiddleware,defaultSettingsMiddleware | Language Model Middleware -->

**API:** `wrapLanguageModel({ model, middleware }): LanguageModel`

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | `LanguageModel` | Base model to wrap |
| `middleware` | `LanguageModelV3Middleware \| LanguageModelV3Middleware[]` | One or more middleware; applied left-to-right (first wraps outermost) |

**Built-in middleware:**

| Middleware | Purpose |
|------------|---------|
| `extractReasoningMiddleware({ tagName })` | Extracts `<think>` / custom tags into `.reasoning` |
| `extractJsonMiddleware()` | Strips markdown code fences from JSON responses |
| `simulateStreamingMiddleware()` | Fakes streaming for non-streaming models |
| `defaultSettingsMiddleware({ settings })` | Applies default temperature, tokens, providerOptions |
| `addToolInputExamplesMiddleware()` | Injects `inputExamples` into tool descriptions |

**Pattern — custom logging middleware:**
```ts
import type { LanguageModelV3Middleware } from '@ai-sdk/provider';

export const logMiddleware: LanguageModelV3Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    console.log('params:', JSON.stringify(params));
    const result = await doGenerate();
    console.log('text:', result.text);
    return result;
  },
};

const model = wrapLanguageModel({ model: yourModel, middleware: logMiddleware });
```

**Gotcha:** Per-request metadata flows through `params.providerMetadata` keyed by middleware name. Access it via `params?.providerMetadata?.yourMiddlewareName` inside `wrapGenerate`/`wrapStream`.

<!-- RELATED: sections/production.md#caching -->
<!-- /SECTION:middleware -->

<!-- SECTION:provider-management | keywords: customProvider,createProviderRegistry,gateway,registry.languageModel | Provider & Model Management -->

**APIs:** `customProvider({ languageModels, embeddingModels, fallbackProvider })` · `createProviderRegistry(providers, options?)`

| Concept | Use when |
|---------|---------|
| `customProvider` | Pre-configure settings, add aliases, restrict available models |
| `createProviderRegistry` | Centralize multiple providers; access via `"provider:model"` string |
| `gateway` | Vercel AI Gateway as default global provider |

**Pattern — registry with aliases and restricted models:**
```ts
import { createProviderRegistry, customProvider, gateway } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export const registry = createProviderRegistry({
  gateway,
  anthropic: customProvider({
    languageModels: {
      fast:   anthropic('claude-haiku-4-5'),
      smart:  anthropic('claude-sonnet-4-5'),
    },
    fallbackProvider: anthropic,
  }),
});

// usage
const model = registry.languageModel('anthropic:fast');
```

Registry also exposes `.embeddingModel('provider:model')` and `.imageModel('provider:model')`.
Custom separator: `createProviderRegistry(providers, { separator: ' > ' })`.

**Gotcha:** Without a `fallbackProvider`, requesting an unregistered model throws at runtime. Combine with `defaultSettingsMiddleware` and `wrapLanguageModel` for pre-configured reasoning budgets.

<!-- /SECTION:provider-management -->

<!-- SECTION:embeddings | keywords: embed,embedMany,cosineSimilarity,wrapEmbeddingModel,rerank | Embeddings, Similarity & Reranking -->

**APIs:** `embed({ model, value })` · `embedMany({ model, values, maxParallelCalls? })` · `cosineSimilarity(a, b)` · `rerank({ model, documents, query, topN? })` · `wrapEmbeddingModel({ model, middleware })`

| Function | Returns | Notes |
|----------|---------|-------|
| `embed` | `{ embedding: number[], usage, response }` | Single value |
| `embedMany` | `{ embeddings: number[][], usage }` | Batch; sorted same order as input |
| `cosineSimilarity` | `number` (-1 to 1) | Higher = more similar |
| `rerank` | `{ ranking, rerankedDocuments, originalDocuments }` | Dedicated reranking model required |

**Pattern — RAG similarity search then rerank:**
```ts
import { embedMany, cosineSimilarity, rerank } from 'ai';
import { cohere } from '@ai-sdk/cohere';

const { embeddings } = await embedMany({
  model: 'openai/text-embedding-3-small',
  values: docs,
  maxParallelCalls: 3,
});

// coarse filter by cosine similarity, then rerank top candidates
const { rerankedDocuments } = await rerank({
  model: cohere.reranking('rerank-v3.5'),
  documents: candidateDocs,
  query: userQuery,
  topN: 5,
});
```

**Gotcha:** `embedMany` chunks calls automatically but `maxParallelCalls` defaults to unlimited — set it explicitly to avoid rate-limit errors. `rerank` returns `ranking[].originalIndex` referring to the *input* array position, not the reranked position.

<!-- /SECTION:embeddings -->

<!-- SECTION:media | keywords: generateImage,experimental_transcribe,experimental_generateSpeech,experimental_generateVideo | Media Generation (Image / Audio / Video) -->

All media APIs are **experimental** except `generateImage`.

| Function | Import name | Returns |
|----------|-------------|---------|
| `generateImage` | `generateImage` | `{ image: { base64, uint8Array }, images, warnings }` |
| Transcription | `experimental_transcribe` | `{ text, segments, language, durationInSeconds }` |
| TTS | `experimental_generateSpeech` | `{ audio: { base64, uint8Array } }` |
| Video | `experimental_generateVideo` | `{ video: { base64, uint8Array }, videos }` |

**Shared params (all four):** `providerOptions`, `abortSignal`, `headers`, `maxRetries`

**generateImage extras:** `size` (`"1024x1024"`), `aspectRatio` (`"16:9"`), `n`, `seed`, `maxImagesPerCall`

**Pattern — batch image generation:**
```ts
import { generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

const { images } = await generateImage({
  model: openai.image('dall-e-2'),
  prompt: 'A sunset over the ocean',
  n: 4,               // SDK batches automatically
  size: '1024x1024',
  providerOptions: { openai: { quality: 'hd' } },
});
```

**Gotcha:** Video generation is async/polled and can take minutes — set `providerOptions.fal.pollTimeoutMs` to at least 600 000 ms for production. The default polling timeout is ~5 minutes, which is insufficient for long videos or slow models.

<!-- /SECTION:media -->

<!-- SECTION:testing | keywords: MockLanguageModelV3,MockEmbeddingModelV3,simulateReadableStream,ai/test | Testing with Mock Providers -->

**Import path:** `ai/test` for mock classes; `ai` for `simulateReadableStream`.

| Helper | Purpose |
|--------|---------|
| `MockLanguageModelV3({ doGenerate?, doStream? })` | Deterministic LLM responses |
| `MockEmbeddingModelV3(...)` | Deterministic embedding responses |
| `simulateReadableStream({ chunks, chunkDelayInMs?, initialDelayInMs? })` | Fake streaming with optional delays |
| `mockId()` | Auto-incrementing integer IDs |
| `mockValues(array)` | Cycles through array values per call |

**Pattern — unit-test streamText:**
```ts
import { streamText, simulateReadableStream } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';

const result = streamText({
  model: new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-start', id: 'text-1' },
          { type: 'text-delta', id: 'text-1', delta: 'Hello' },
          { type: 'text-end',   id: 'text-1' },
          { type: 'finish', finishReason: { unified: 'stop', raw: undefined },
            logprobs: undefined,
            usage: { inputTokens: { total: 3, noCache: 3 },
                     outputTokens: { total: 5, text: 5 } } },
        ],
      }),
    }),
  }),
  prompt: 'Hi',
});
```

**Gotcha:** `MockLanguageModelV3.doGenerate` must return the full usage shape including `inputTokens.noCache` and `outputTokens.text`; missing sub-fields cause type errors that are only caught at runtime in loose configurations.

<!-- /SECTION:testing -->

<!-- SECTION:telemetry | keywords: experimental_telemetry,TelemetryIntegration,devToolsMiddleware,bindTelemetryIntegration | Telemetry, Observability & DevTools -->

**OpenTelemetry spans** are emitted per call when `experimental_telemetry: { isEnabled: true }` is set. Span names follow the pattern `ai.generateText`, `ai.generateText.doGenerate`, `ai.toolCall`, etc.

**experimental_telemetry options:**

| Option | Type | Description |
|--------|------|-------------|
| `isEnabled` | `boolean` | Activates OTel instrumentation |
| `functionId` | `string` | Labels spans for grouping |
| `metadata` | `Record<string, unknown>` | Attached to all spans as `ai.telemetry.metadata.*` |
| `recordInputs` / `recordOutputs` | `boolean` | Toggle PII-sensitive data recording |
| `tracer` | `Tracer` | Custom OTel Tracer instance |
| `integrations` | `TelemetryIntegration[]` | Lifecycle hook objects |

**TelemetryIntegration lifecycle methods:** `onStart`, `onStepStart`, `onToolCallStart`, `onToolCallFinish`, `onStepFinish`, `onFinish` — mirrors the per-call event callbacks exactly.

**Pattern — custom integration + DevTools:**
```ts
import { bindTelemetryIntegration } from 'ai';
import type { TelemetryIntegration } from 'ai';
import { devToolsIntegration } from '@ai-sdk/devtools';

class CostTracker implements TelemetryIntegration {
  async onFinish(event) {
    console.log('total tokens:', event.totalUsage.totalTokens);
  }
}

const result = await generateText({
  model,
  prompt: 'Hello',
  experimental_telemetry: {
    isEnabled: true,
    integrations: [devToolsIntegration(), bindTelemetryIntegration(new CostTracker())],
  },
});
```

**DevTools setup:** `pnpm add @ai-sdk/devtools` → wrap model with `wrapLanguageModel({ model, middleware: devToolsMiddleware() })` → run `npx @ai-sdk/devtools` → open `http://localhost:4983`. Stores data in `.devtools/generations.json` — never enable in production.

**Gotcha:** Event callbacks (`experimental_onStart`, `onStepFinish`, `onFinish`, etc.) are per-call and independent of OTel. Errors thrown inside both integrations and callbacks are swallowed silently — they never propagate to the caller.

<!-- /SECTION:telemetry -->
