<!-- SECTION:caching | keywords: wrapLanguageModel,LanguageModelV3Middleware,simulateReadableStream,onFinish | Caching Responses -->

## Caching Responses

Two approaches: middleware (recommended) for transparent cache at the model call layer, or `onFinish` lifecycle callback for response-level caching.

### Middleware approach

```ts
// ai/middleware.ts
import { Redis } from '@upstash/redis';
import {
  type LanguageModelV3Middleware,
  type LanguageModelV3StreamPart,
  simulateReadableStream,
} from 'ai';

export const cacheMiddleware: LanguageModelV3Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const key = JSON.stringify(params);
    const cached = await redis.get(key);
    if (cached !== null) return cached;
    const result = await doGenerate();
    redis.set(key, result);
    return result;
  },
  wrapStream: async ({ doStream, params }) => {
    const key = JSON.stringify(params);
    const cached = await redis.get(key);
    if (cached !== null) {
      return {
        stream: simulateReadableStream({ initialDelayInMs: 0, chunkDelayInMs: 10, chunks: cached }),
      };
    }
    const { stream, ...rest } = await doStream();
    const fullResponse: LanguageModelV3StreamPart[] = [];
    const transform = new TransformStream({
      transform(chunk, controller) { fullResponse.push(chunk); controller.enqueue(chunk); },
      flush() { redis.set(key, fullResponse); },
    });
    return { stream: stream.pipeThrough(transform), ...rest };
  },
};
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `wrapGenerate` | `({ doGenerate, params }) => Promise` | Intercepts non-streaming calls |
| `wrapStream` | `({ doStream, params }) => Promise` | Intercepts streaming calls |
| `simulateReadableStream` | `({ chunks, initialDelayInMs, chunkDelayInMs })` | Replays cached chunks as a stream |

**Key pattern:** `wrapStream` caches the full `LanguageModelV3StreamPart[]` array and replays it via `simulateReadableStream` so callers receive a proper `ReadableStream` from cache.

**Gotcha:** `response.timestamp` is serialized as a string in Redis; restore it with `new Date(cached.response.timestamp)` on cache read or the type will be wrong.

<!-- /SECTION:caching -->

<!-- SECTION:rate-limiting | keywords: Ratelimit,@upstash/ratelimit,429 | Rate Limiting -->

## Rate Limiting

Use `@upstash/ratelimit` with Vercel KV to gate AI route handlers before incurring LLM costs.

```ts
// app/api/generate/route.ts
import kv from '@vercel/kv';
import { Ratelimit } from '@upstash/ratelimit';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(5, '30s'),
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? 'ip';
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response('Ratelimited!', { status: 429 });

  const { messages } = await req.json();
  const result = streamText({ model, messages });
  return result.toUIMessageStreamResponse();
}
```

| Parameter | Description |
|-----------|-------------|
| `Ratelimit.fixedWindow(n, window)` | Allow `n` requests per `window` (e.g. `'30s'`, `'1m'`) |
| `ratelimit.limit(identifier)` | Returns `{ success, remaining, reset }` |

**Key pattern:** Call `ratelimit.limit(req.ip)` before parsing the body — reject immediately with `status: 429` to avoid any downstream cost.

**Gotcha:** `req.ip` may be `undefined` on local dev; always fall back (`req.ip ?? 'ip'`) or use a header like `x-forwarded-for`.

<!-- /SECTION:rate-limiting -->

<!-- SECTION:deployment | keywords: maxDuration,Vercel,environment variables | Vercel Deployment -->

## Vercel Deployment

### Environment variables

Paste your `.env.local` content in the Vercel dashboard **Environment Variables** section during import — Vercel parses `key=value` format automatically. Never commit `.env` to git.

### Function duration

Hobby tier default is 10 s; LLMs often exceed this. Set per-route:

```ts
// app/api/chat/route.ts
export const maxDuration = 30; // seconds (up to 60 on Hobby, higher on Pro/Enterprise)
```

### Security

| Concern | Solution |
|---------|----------|
| API abuse | Upstash Ratelimit + Vercel KV (see rate-limiting section) |
| DDoS / bots | Vercel Firewall — automatic DDoS mitigation; custom IP-block rules on Enterprise |
| Key exposure | Store keys as Vercel env vars, never in client bundles |

**Key pattern:** Add `maxDuration` to every streaming route handler; without it, Hobby functions time out at 10 s and the client receives a truncated or errored stream.

**Gotcha:** If streaming does not work behind a proxy, the proxy may be buffering the response — ensure `Transfer-Encoding: chunked` passes through, or consult the Vercel troubleshooting guide on streaming behind proxies.

<!-- /SECTION:deployment -->

<!-- SECTION:error-handling | keywords: AISDKError,try/catch,fullStream,onAbort,onError | Error Handling -->

## Error Handling

### Non-streaming (generateText)

```ts
try {
  const { text } = await generateText({ model, prompt });
} catch (error) {
  // AISDKError subclasses provide .cause, .message, .name
}
```

### Streaming — fullStream error parts

```ts
try {
  const { fullStream } = streamText({ model, prompt });
  for await (const part of fullStream) {
    if (part.type === 'error') { /* part.error */ }
    if (part.type === 'tool-error') { /* part.error */ }
    if (part.type === 'abort') { /* stream was aborted */ }
  }
} catch (error) { /* errors outside the stream */ }
```

### UI error state (useChat)

```tsx
const { error, regenerate } = useChat({ onError: err => console.error(err) });
// render: {error && <button onClick={regenerate}>Retry</button>}
```

| Surface | API |
|---------|-----|
| Hook error object | `error` from `useChat` / `useCompletion` |
| Hook error callback | `onError: (error) => void` |
| Suppress SDK warnings | `globalThis.AI_SDK_LOG_WARNINGS = false` |
| Custom warning handler | `globalThis.AI_SDK_LOG_WARNINGS = ({ warnings, provider, model }) => {}` |

**Key pattern:** Use `fullStream` when you need in-stream error granularity (e.g. tool errors mid-flight); use `textStream` with a surrounding `try/catch` for simple cases.

**Gotcha:** `onAbort` is NOT called when `onFinish` fires and vice-versa — they are mutually exclusive. If you use `toUIMessageStreamResponse`, check the `isAborted` flag inside `onFinish` instead of relying on `onAbort`.

<!-- /SECTION:error-handling -->

<!-- SECTION:stream-control | keywords: stop,abortSignal,consumeStream,backpressure,ReadableStream | Stream Control -->

## Stream Control

### Client-side cancellation (useChat / useCompletion)

```tsx
const { stop, status } = useCompletion();
// {(status === 'submitted' || status === 'streaming') && <button onClick={stop}>Stop</button>}
```

### Server-side cancellation (abortSignal)

```ts
export async function POST(req: Request) {
  const result = streamText({
    model,
    prompt,
    abortSignal: req.signal, // forward browser abort to LLM API
    onAbort: ({ steps }) => {
      // persist partial results, clean up resources
    },
  });
  return result.toUIMessageStreamResponse({ consumeSseStream: consumeStream });
}
```

### Backpressure

Use `ReadableStream` with a `pull` handler (lazy) rather than `start` (eager) to avoid unbounded buffer growth:

```ts
new ReadableStream({
  async pull(controller) {
    const { value, done } = await iterator.next(); // produce only when consumer is ready
    done ? controller.close() : controller.enqueue(value);
  },
});
```

| API | Purpose |
|-----|---------|
| `stop()` | Cancel stream client-to-server (UI hooks) |
| `abortSignal` | Forward `AbortSignal` from request to LLM API |
| `onAbort({ steps })` | Server cleanup on abort; receives completed steps |
| `consumeStream` | Drain stream properly when using `toUIMessageStreamResponse` to avoid hanging connections |

**Key pattern:** Always pass `abortSignal: req.signal` in route handlers so a user clicking "Stop" cancels the upstream LLM request and avoids wasted token spend.

**Gotcha:** `stop()` (client abort) is incompatible with `resume: true` in `useChat` — enabling both breaks stream resumption. Choose one mechanism.

<!-- /SECTION:stream-control -->
