<!-- SECTION:use-chat | keywords: useChat,sendMessage,convertToModelMessages,toUIMessageStreamResponse,DefaultChatTransport | useChat Hook Reference -->

## useChat

`useChat` from `@ai-sdk/react` streams chat messages, manages state, and updates the UI in real-time.

**Signature**
```ts
const {
  messages,       // UIMessage[]
  sendMessage,    // (msg: { text, files? }, opts?: { headers, body, metadata }) => void
  status,         // 'ready' | 'submitted' | 'streaming' | 'error'
  stop,           // () => void — abort current stream
  regenerate,     // () => void — re-run last assistant turn
  setMessages,    // direct state mutator
  error,          // Error | undefined
} = useChat<TMessage>({
  transport,      // ChatTransport instance (default: DefaultChatTransport({ api: '/api/chat' }))
  id,             // string — shared chat identity
  messages,       // UIMessage[] — initial/controlled messages
  onFinish,       // ({ message, messages, isAbort, isDisconnect, isError }) => void
  onError,        // (error: Error) => void
  onData,         // (dataPart) => void — fires for every streamed data part incl. transient
  experimental_throttle, // number (ms) — throttle render frequency
  generateId,     // () => string — client-side message ID generator
  resume,         // boolean — reconnect to an active server stream on mount
});
```

**Server route pattern**
```ts
// app/api/chat/route.ts
import { convertToModelMessages, streamText, UIMessage } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
```

**Key pattern — rendering parts**
```tsx
{messages.map(m => (
  <div key={m.id}>
    {m.parts.map((part, i) => {
      if (part.type === 'text') return <span key={i}>{part.text}</span>;
      if (part.type === 'reasoning') return <pre key={i}>{part.text}</pre>;
      if (part.type === 'source-url') return <a key={i} href={part.url}>{part.title}</a>;
      if (part.type === 'file' && part.mediaType.startsWith('image/'))
        return <img key={i} src={part.url} alt={part.filename} />;
      return null;
    })}
  </div>
))}
```

**Optional server-side extras**
- `sendReasoning: true` — forward reasoning tokens as `reasoning` parts
- `sendSources: true` — forward grounding sources as `source-url`/`source-document` parts
- `messageMetadata: ({ part }) => (...)` — attach per-message metadata (timestamps, usage)
- `onError: (err) => string` — customise error text sent to client (default: masked)

**Gotcha** — Render using `message.parts`, not `message.content`. The `parts` array is the only way to access reasoning, source, file, and tool-invocation data. Disabling `status !== 'ready'` on the input is mandatory to prevent double-submissions during `submitted`/`streaming` phases.

<!-- /SECTION:use-chat -->

<!-- SECTION:use-completion | keywords: useCompletion,completion,complete,handleSubmit,handleInputChange | useCompletion Hook -->

## useCompletion

`useCompletion` from `@ai-sdk/react` streams a single text completion (no conversation history).

**Signature**
```ts
const {
  completion,        // string — accumulated streamed text
  input,             // string — controlled input value
  handleInputChange, // React.ChangeEventHandler<HTMLInputElement>
  handleSubmit,      // React.FormEventHandler — sends `input` as `prompt`
  complete,          // (prompt: string, opts?) => Promise<string | undefined>
  setInput,          // (value: string) => void
  isLoading,         // boolean
  stop,              // () => void
  error,             // Error | undefined
} = useCompletion({
  api,               // string (default '/api/completion')
  headers,           // Record<string, string>
  body,              // Record<string, unknown> — extra fields merged into every request
  credentials,       // RequestCredentials
  onFinish,          // (prompt: string, completion: string) => void
  onError,           // (error: Error) => void
  experimental_throttle, // number (ms)
});
```

**Key pattern**
```tsx
const { completion, input, handleInputChange, handleSubmit, isLoading, stop } = useCompletion({
  api: '/api/completion',
});

return (
  <form onSubmit={handleSubmit}>
    <input value={input} onChange={handleInputChange} />
    <button type="submit" disabled={isLoading}>Send</button>
    <button type="button" onClick={stop} disabled={!isLoading}>Stop</button>
    <div>{completion}</div>
  </form>
);
```

**Server route** — identical to `useChat`; `streamText` returns `result.toUIMessageStreamResponse()` (or `result.toTextStreamResponse()` for plain text).

**Gotcha** — `useCompletion` does not carry conversation history; each `handleSubmit` sends only the current `input` as `{ prompt }`. Use `useChat` for multi-turn conversations. Tool calls, usage, and finish reasons are unavailable when using `TextStreamChatTransport`.

<!-- /SECTION:use-completion -->

<!-- SECTION:use-object | keywords: useObject,submit,stop,isLoading,Output.object,Output.choice | useObject Hook — Streaming Structured JSON -->

## useObject (experimental)

`experimental_useObject` from `@ai-sdk/react` streams a partially-built JSON object to the UI as it is generated. Also supports enum classification mode.

**Signature**
```ts
const {
  object,    // DeepPartial<T> | undefined — partial result during streaming
  submit,    // (input: unknown) => void — send prompt to API
  stop,      // () => void — cancel generation
  isLoading, // boolean
  error,     // Error | undefined
} = useObject<T>({
  api,       // string
  schema,    // Zod schema — drives partial type inference
  headers,
  credentials,
  onFinish,  // ({ object: T | undefined, error }) => void
  onError,   // (error: Error) => void
});
```

**Key pattern — object streaming**
```tsx
// client
const { object, submit, isLoading } = useObject({
  api: '/api/notifications',
  schema: notificationSchema,
});
// server
const result = streamText({ model, output: Output.object({ schema: notificationSchema }), prompt });
return result.toTextStreamResponse();
```

**Enum/classification mode** — schema must wrap the enum in an object with key `enum`:
```tsx
// client
useObject({ schema: z.object({ enum: z.enum(['true', 'false']) }) });
// server
streamText({ output: Output.choice({ options: ['true', 'false'] }), prompt });
```

**Gotcha** — `object` is `DeepPartial<T>` during streaming; all nested fields are potentially `undefined`. Guard every access (`object?.notifications?.map(...)`) or the UI will throw on partial renders. Use `result.toTextStreamResponse()` (not `toUIMessageStreamResponse`) on the server for `useObject`.

<!-- /SECTION:use-object -->

<!-- SECTION:streaming-data | keywords: createUIMessageStream,createUIMessageStreamResponse,writer,onData,readUIMessageStream,pipeUIMessageStreamToResponse | Streaming Custom Data Parts -->

## Streaming Custom Data

Use `createUIMessageStream` + `writer` to push typed data parts alongside model text. Parts with an `id` are reconciled client-side (same ID = update in place); parts with `transient: true` are ephemeral and only reachable via `onData`.

**Server pattern**
```ts
import { createUIMessageStream, createUIMessageStreamResponse, streamText } from 'ai';

const stream = createUIMessageStream<MyUIMessage>({
  execute: ({ writer }) => {
    // transient status — only visible via onData, never in message.parts
    writer.write({ type: 'data-notification', data: { message: 'Loading…' }, transient: true });

    // persistent, reconcilable part
    writer.write({ type: 'data-weather', id: 'w1', data: { city: 'SF', status: 'loading' } });

    const result = streamText({ model, messages });
    result.onFinish(() => {
      writer.write({ type: 'data-weather', id: 'w1', data: { city: 'SF', weather: 'sunny', status: 'success' } });
    });
    writer.merge(result.toUIMessageStream());
  },
});
return createUIMessageStreamResponse({ stream });
```

**Client — consuming data**
```tsx
const { messages } = useChat<MyUIMessage>({
  onData: part => {
    if (part.type === 'data-notification') showToast(part.data.message);
    // transient parts ONLY available here, not in message.parts
  },
});

// persistent parts rendered from message.parts:
message.parts.filter(p => p.type === 'data-weather').map(p => <WeatherWidget key={p.id} data={p.data} />)
```

**Type-safe custom message**
```ts
type MyUIMessage = UIMessage<
  never,          // metadata type
  { weather: { city: string; status: 'loading' | 'success'; weather?: string } }
>;
```

**Reading UI message streams outside chat UIs**
```ts
import { readUIMessageStream, streamText } from 'ai';

const result = streamText({ model, prompt: 'Summarize the incident.' });

for await (const uiMessage of readUIMessageStream({
  stream: result.toUIMessageStream(),
})) {
  console.log(uiMessage.parts);
}
```

Use this for CLIs, terminal apps, server-side processors, or custom clients that need incremental
`UIMessage` state without `useChat`. If you already have the last partial message, pass
`message: lastMessage` to resume reconstruction from that state.

**Gotcha** — Transient parts (`transient: true`) are never added to `message.parts` and are not persisted. They are only accessible inside the `onData` callback on the client. Writing the same `id` twice updates the part in-place; omitting `id` always appends a new part.

<!-- /SECTION:streaming-data -->

<!-- SECTION:transport | keywords: DefaultChatTransport,TextStreamChatTransport,DirectChatTransport,ChatTransport | Transport Configuration -->

## Transport

The `transport` option on `useChat` controls how messages are sent and responses received.

| Transport | Protocol | Use case |
|---|---|---|
| `DefaultChatTransport` | HTTP POST → UI message stream SSE | Standard API route (default) |
| `TextStreamChatTransport` | HTTP POST → plain text stream | Non-SDK backends; no tools/usage |
| `DirectChatTransport` | In-process `Agent.stream()` | SSR, testing, single-process apps |
| Custom `ChatTransport` | Any | WebSockets, gRPC, etc. |

**DefaultChatTransport options**
```ts
new DefaultChatTransport({
  api: '/api/chat',
  headers: () => ({ Authorization: `Bearer ${getToken()}` }), // static or function
  body: () => ({ sessionId: getSession() }),
  credentials: 'include',
  prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => ({
    body: { id, message: messages.at(-1), trigger, messageId },
  }),
  prepareReconnectToStreamRequest: ({ id }) => ({
    api: `/api/chat/${id}/stream`,
  }),
})
```

**DirectChatTransport** (no HTTP round-trip)
```ts
import { DirectChatTransport, ToolLoopAgent } from 'ai';
const agent = new ToolLoopAgent({ model, instructions: '...' });
useChat({ transport: new DirectChatTransport({ agent, sendReasoning: true }) });
```

**UI message stream protocol** — SSE over HTTP; set header `x-vercel-ai-ui-message-stream: v1` for custom backends. Key part types: `start`, `text-start/delta/end`, `reasoning-start/delta/end`, `tool-input-start/delta/available`, `tool-output-available`, `data-*`, `error`, `finish`, `abort`, `[DONE]`.

**Text stream protocol** — plain chunks appended; use `TextStreamChatTransport`. No tool calls, usage, or finish reasons available.

**Gotcha** — `DirectChatTransport` does not support stream reconnection (`reconnectToStream()` always returns `null`). Do not use the `resume` option with `DirectChatTransport`.

<!-- RELATED: sections/production.md#deployment -->
<!-- /SECTION:transport -->

<!-- SECTION:persistence | keywords: initialMessages,validateUIMessages,consumeStream,generateMessageId,resume | Message Persistence, Stream Resume & Error Handling -->

## Persistence, Resume & Error Handling

### Saving and loading messages

Pass `initialMessages` (server-loaded `UIMessage[]`) and `id` to `useChat`. Save via `onFinish` callback of `toUIMessageStreamResponse`:

```ts
// server — save on completion
return result.toUIMessageStreamResponse({
  originalMessages: messages,
  generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
  onFinish: ({ messages }) => saveChat({ chatId, messages }),
});
```

```tsx
// client — hydrate from server
useChat({ id, messages: initialMessages, transport: new DefaultChatTransport({ api: '/api/chat' }) });
```

### Validating stored messages

When reloading messages that contain tools, metadata, or data parts, validate before passing to `convertToModelMessages`:

```ts
const validated = await validateUIMessages({ messages, tools, metadataSchema, dataPartsSchema });
// throws TypeValidationError on schema mismatch — catch and fall back to empty history
```

For recovery flows where you do not want validation to throw, use `safeValidateUIMessages(...)`
and branch on its result instead of wrapping validation in `try/catch`.

### Handling client disconnects

Call `result.consumeStream()` (no await) before returning the response to detach backpressure. This ensures `onFinish` fires even if the client disconnects before the stream completes.

### Resuming streams after reload

```tsx
// client
useChat({ id, messages: initialMessages, resume: true, transport: new DefaultChatTransport({
  prepareSendMessagesRequest: ({ id, messages }) => ({ body: { id, message: messages.at(-1) } }),
  prepareReconnectToStreamRequest: ({ id }) => ({ api: `/api/chat/${id}/stream` }),
}) });
```

The GET endpoint (`/api/chat/[id]/stream`) returns the stored SSE stream from Redis (via `resumable-stream`) or 204 if no active stream exists. Use the `consumeSseStream` callback in the POST handler to publish the stream to Redis with a unique `streamId`.

**Warning** — `resume: true` is incompatible with abort. Closing or refreshing the tab triggers an abort signal that breaks the resumption mechanism. Do not combine both.

### Error handling in useChat

```tsx
const { error, regenerate } = useChat({ ... });
// Display generic message to avoid leaking server internals
{error && <><div>Something went wrong.</div><button onClick={regenerate}>Retry</button></>}
```

Server-side error text is masked by default ("An error occurred."). Provide `onError: (err) => err.message` to `toUIMessageStreamResponse` to forward it.

### RSC migration note

`@ai-sdk/rsc` (`streamUI`, `useUIState`, `createStreamableUI`) is experimental and not recommended for production due to abort limitations, component flicker on `.done()`, and quadratic data transfer.

**Migration map**

| Legacy RSC pattern | Preferred replacement |
|---|---|
| `streamUI` server action | `streamText` in a POST route returning `result.toUIMessageStreamResponse()` |
| `useUIState` for chat history | `useChat({ messages: initialMessages })` with persisted `UIMessage[]` |
| `createStreamableUI` for serializable streaming | `createUIMessageStream` for chat parts, or `createStreamableValue` when you only need serializable value streaming |
| `useActions` + RSC server actions | explicit client requests through `useChat`, `useCompletion`, or custom fetch/transport |

Use `createStreamableValue` as the escape hatch when the old RSC flow was really about streaming a
serializable value rather than a chat UI. That is the closest replacement for many `streamUI` +
Server Action patterns that returned structured data to the client.

<!-- /SECTION:persistence -->
