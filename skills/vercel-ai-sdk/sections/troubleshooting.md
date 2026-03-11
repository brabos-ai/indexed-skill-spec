<!-- SECTION:streaming-issues | keywords: streamText,toUIMessageStreamResponse,smoothStream,onFinish | Streaming Issues -->

| Symptom | Cause | Fix |
|---------|-------|-----|
| Azure streams arrive in large slow chunks | Azure content filter "Streaming mode" defaults to synchronous processing | Set Azure content filter "Streaming mode" to "Asynchronous Filter"; use `experimental_transform: smoothStream()` as a workaround |
| Stream output shows `0:"Je"`, `0:" suis"` raw protocol text | Custom client code expects plain text, but SDK >= 3.0.20 uses stream data protocol | Switch to `useChat({ streamProtocol: 'text' })` or return `result.toTextStreamResponse()` |
| Streaming works locally but not when deployed; full response returned after delay | Deployment environment buffers response before forwarding | Add `'Transfer-Encoding': 'chunked'` and `Connection: 'keep-alive'` headers to `toUIMessageStreamResponse` |
| Streaming broken behind proxy/middleware | Proxy compresses response, breaking chunked transfer | Add `'Content-Encoding': 'none'` header to `toUIMessageStreamResponse` |
| `streamText` silently fails; stream contains only error parts, no exceptions thrown | Errors become stream parts instead of thrown exceptions to prevent server crashes | Provide `onError` callback to `streamText` to log or handle errors |
| `useChat` status is `"streaming"` immediately but no text appears for several seconds | Status reflects connection establishment (metadata), not first LLM token | Check `lastMessage.parts.length === 0` alongside `status === 'streaming'` to show a real loading indicator |
| `createStreamableUI` stream is slow to update or hangs | Stream not closed after final update | Call `stream.done()` as the last operation on every `createStreamableUI` instance |

<!-- /SECTION:streaming-issues -->

<!-- SECTION:usechat-issues | keywords: useChat,sendMessage,DefaultChatTransport,convertToModelMessages | useChat Issues -->

| Symptom | Cause | Fix |
|---------|-------|-----|
| `"Failed to parse stream string. Invalid code"` error in `useChat` | Backend returns plain text stream; SDK >= 3.0.20 expects stream data protocol format | Set `useChat({ streamProtocol: 'text' })` or upgrade backend to use `toUIMessageStreamResponse()` |
| Tool calls visible in server logs but model returns no response | `messages` passed raw to model without conversion | Use `convertToModelMessages(messages)` before passing to `streamText` |
| Custom `headers`, `body`, `credentials` on `useChat` hook not sent with requests | Direct hook-level options removed; `DefaultChatTransport` required | Wrap config in `new DefaultChatTransport({ headers, body, credentials })` or pass options per call via `sendMessage(msg, { headers, body })` |
| `useChat` surfaces generic "An error occurred" with no details | `streamText` errors are masked by default for security | Pass `getErrorMessage` handler to `toUIMessageStreamResponse({ getErrorMessage: ... })` |
| Assistant messages duplicated in UI after tool calls | `toUIMessageStreamResponse` generates new IDs; client creates duplicates | Pass `originalMessages` to `toUIMessageStreamResponse({ originalMessages: messages })` to reuse IDs |
| Hook-level `body` data is stale; only reflects initial render values | Hook-level `DefaultChatTransport` body is captured at init, not re-evaluated | Pass dynamic values at request level: `sendMessage(msg, { body: { temperature, userId } })` |
| React error "Maximum update depth exceeded" when streaming | UI re-renders on every chunk; overwhelms React reconciler on complex components | Add `experimental_throttle: 50` to `useChat` or `useCompletion` options |

<!-- /SECTION:usechat-issues -->

<!-- SECTION:developer-issues | keywords: tool,execute,addToolOutput,Output.object,stopWhen,TypeScript,zod,LanguageModelV1,@types/react | Tooling and TypeScript Issues -->

| Symptom | Cause | Fix |
|---------|-------|-----|
| `"ToolInvocation must have a result"` error | Tool defined without `execute` and no result provided through client | Either add `execute` to the tool definition, or use `addToolOutput({ tool, toolCallId, output })` in `useChat` client code |
| `AI_MissingToolResultsError: Tool results are missing for tool calls` | New message sent while previous tool calls still pending in conversation history | Ensure every `tool-call` part has a corresponding `tool-result` (or `tool-approval-response`) before sending the next message |
| Combining `output: Output.object(...)` with tools produces wrong results or stops early | Structured output generation counts as an extra step in the execution flow | Increase `stopWhen: stepCountIs(N+1)` to account for the additional structured-output step |
| TypeScript error when passing `toolCall.toolName` to `addToolOutput` | Mixed static/dynamic tools prevent TS from narrowing `toolName` to a literal type | Check `if (toolCall.dynamic) return;` first to let TS narrow the type before calling `addToolOutput` |
| TypeScript server crashes, hangs, or "Type instantiation is excessively deep" when using Zod with AI SDK 5 | Module resolution loads Zod declarations twice, causing expensive structural type comparisons | Upgrade to `zod@^4.1.8`; alternatively set `"moduleResolution": "nodenext"` in `tsconfig.json` |
| `AI_UnsupportedModelVersionError: Unsupported model version v1` after upgrading to AI SDK 5 | Provider package still implements spec v1; AI SDK 5 requires spec v2 | Update all `@ai-sdk/*` provider packages to `2.0.0+` and `ai` to `5.0.0+` |
| `Type 'SomeModel' is not assignable to type 'LanguageModelV1'` | Provider package version is older than the AI SDK core; spec mismatch | Update provider packages and `ai` to the latest versions |
| `error TS2503: Cannot find namespace 'JSX'` in non-React project | AI SDK depends on `@types/react` which exports the `JSX` namespace | Install `@types/react` as a dev dependency |

<!-- RELATED: sections/core-tools.md#tool-ui-integration -->
<!-- /SECTION:developer-issues -->

<!-- SECTION:runtime-issues | keywords: maxDuration,Vercel,abort,resume,createStreamableUI,@ai-sdk/rsc,Server Action,experimental_include,memory | Deployment, RSC, and Runtime Issues -->

| Symptom | Cause | Fix |
|---------|-------|-----|
| Long responses cut off on Vercel; `"Connection closed"` error or timeouts in logs | Vercel function duration limit exceeded (default 5 min / 300 s) | Export `export const maxDuration = 600;` from the route file; Pro/Enterprise required for >300 s |
| `onFinish` callback not called when stream is aborted | Abort immediately terminates the response, bypassing `onFinish` | Pass `consumeSseStream: consumeStream` (imported from `'ai'`) to `toUIMessageStreamResponse` |
| Stream resumption (`resume: true`) breaks when tab closes or `stop()` is called | Browser abort signal conflicts with resumption mechanism | Choose one: use `resume: true` without abort, or use abort with `resume: false` (default) - not both |
| Cannot define inline `"use server"` Server Actions inside Client Components | Next.js constraint: inline server annotations not allowed in client files | Export actions from a separate `"use server"` file, pass them as props, or use `createAI` + `useActions` |
| "Variable not found", "Cannot find div", or "Component refers to a value, not a type" inside server actions using `createStreamableUI` | Server action file has `.ts` extension; JSX not parsed | Rename the file to `.tsx` |
| `"only plain objects can be passed from client components"` when returning `streamText` result from Server Action | `streamText` result is non-serializable and cannot cross the server-to-client boundary | Extract serializable data or use `createStreamableValue` to wrap the stream before returning |
| Jest: `Cannot find module '@ai-sdk/rsc'` | Jest module resolution does not follow the RSC package exports | Add `"^@ai-sdk/rsc$": "<rootDir>/node_modules/@ai-sdk/rsc/dist"` to `moduleNameMapper` in Jest config |
| Memory grows continuously when processing many images; app eventually runs out of memory | AI SDK stores full request/response bodies (including base64 images) in step results by default; 100 x 500 KB images = 50 MB+ retained | Set `experimental_include: { requestBody: false, responseBody: false }` on `generateText` / `streamText`; only store `result.text`, not the full result object |

<!-- RELATED: sections/production.md#deployment -->
<!-- RELATED: sections/ui.md#persistence -->
<!-- /SECTION:runtime-issues -->
