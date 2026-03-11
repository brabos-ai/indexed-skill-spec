<!-- SECTION:core-api | keywords: generateText,streamText,Output,tool,embed,rerank,generateImage,wrapLanguageModel,createAgentUIStream,pipeAgentUIStreamToResponse,createIdGenerator | Core API Reference -->

| Function | Signature Summary | Description |
|---|---|---|
| `generateText` | `generateText({ model, prompt, messages, system, tools, output, ... })` | Non-streaming text generation; returns `{ text, toolCalls, toolResults, usage, finishReason }` |
| `streamText` | `streamText({ model, prompt, messages, system, tools, onChunk, onFinish, ... })` | Streaming text generation; returns `{ textStream, fullStream, toUIMessageStreamResponse() }` |
| `Output.text()` | `Output.text()` | Output spec for plain text (default); used in `generateText`/`streamText` `output` param |
| `Output.object()` | `Output.object({ schema })` | Output spec for structured JSON; validates against Zod/Valibot/JSON schema |
| `tool` | `tool({ description, inputSchema, execute })` | Helper for TypeScript inference of tool input types; connects `inputSchema` to `execute` args |
| `embed` | `embed({ model, value, ... })` | Embeds a single value; returns `{ embedding, usage }` |
| `embedMany` | `embedMany({ model, values, ... })` | Embeds multiple values in one call; returns `{ embeddings, usage }` |
| `rerank` | `rerank({ model, documents, query, ... })` | Reranks documents by relevance to query; returns `{ ranking }` |
| `generateImage` | `generateImage({ model, prompt, n, size, ... })` | Generates images; returns `{ images }` array |
| `wrapLanguageModel` | `wrapLanguageModel({ model, middleware })` | Wraps a `LanguageModelV3` with one or more middleware; returns enhanced model |
| `createAgentUIStream` | `createAgentUIStream({ agent, uiMessages, ... })` | Returns an async iterable of `UIMessageChunk` values for custom runtimes |
| `pipeAgentUIStreamToResponse` | `pipeAgentUIStreamToResponse({ response, agent, uiMessages, ... })` | Pipes an agent UI stream directly to a Node.js `ServerResponse` |
| `jsonSchema` | `jsonSchema(schema, { validate? })` | Creates a JSON schema spec compatible with tool/output APIs |
| `smoothStream` | `smoothStream({ delayInMs?, chunking? })` | Middleware that smooths streaming output chunks |
| `simulateReadableStream` | `simulateReadableStream({ chunks, initialDelayInMs?, chunkDelayInMs? })` | Creates a simulated readable stream for testing |
| `cosineSimilarity` | `cosineSimilarity(vector1, vector2)` | Computes cosine similarity between two embedding vectors |
| `generateId` | `generateId()` | Generates a random ID string |
| `createIdGenerator` | `createIdGenerator({ prefix, size })` | Returns a reusable ID generator function with stable formatting |

<!-- /SECTION:core-api -->

<!-- SECTION:ui-api | keywords: useChat,useCompletion,useObject,convertToModelMessages,createUIMessageStream,DirectChatTransport,safeValidateUIMessages,readUIMessageStream | UI API Reference -->

| Function / Class | Signature Summary | Description |
|---|---|---|
| `useChat` | `useChat({ chat, transport?, onError?, ... })` | React hook for conversational UI; transport-based architecture (AI SDK 5); returns `{ messages, sendMessage, status, ... }` |
| `useCompletion` | `useCompletion({ api?, initialInput?, onResponse?, onFinish?, onError?, ... })` | React hook for single-turn text completion streaming; returns `{ completion, complete, isLoading, ... }` |
| `experimental_useObject` | `useObject({ api, schema, onFinish?, onError? })` | React/Svelte/Vue hook; parses a streamed JSON object against a schema; returns `{ object, submit, isLoading }` |
| `convertToModelMessages` | `convertToModelMessages(uiMessages)` | Converts `UIMessage[]` from `useChat` into `ModelMessage[]` for core functions like `streamText` |
| `pruneMessages` | `pruneMessages(messages, options)` | Prunes a message array to fit within token or count constraints |
| `safeValidateUIMessages` | `safeValidateUIMessages({ messages, tools, ... })` | Non-throwing variant of `validateUIMessages`; returns a result object for recovery flows |
| `createUIMessageStream` | `createUIMessageStream({ execute({ writer }), ... })` | Creates a `ReadableStream` of UI message events; supports merging, error handling, finish callbacks |
| `createUIMessageStreamResponse` | `createUIMessageStreamResponse({ execute, ... })` | Wraps `createUIMessageStream` in a `Response` object for use in route handlers |
| `pipeUIMessageStreamToResponse` | `pipeUIMessageStreamToResponse(stream, response)` | Pipes a UI message stream to a Node.js `ServerResponse` |
| `readUIMessageStream` | `readUIMessageStream(stream)` | Reads all parts from a UI message stream into an array |
| `DirectChatTransport` | `new DirectChatTransport({ agent })` | In-process transport for `useChat`; calls agent's `stream()` directly without HTTP |

<!-- /SECTION:ui-api -->

<!-- SECTION:error-types | keywords: AISDKError,APICallError,NoObjectGeneratedError,NoTextGeneratedError,TypeValidationError | Error Types Reference -->

| Error Class | Import Name | When Thrown | Key Properties |
|---|---|---|---|
| `AI_APICallError` | `APICallError` | HTTP API request fails | `url`, `statusCode`, `responseBody`, `isRetryable`, `cause` |
| `AI_NoObjectGeneratedError` | `NoObjectGeneratedError` | Model fails to produce valid structured output | `text`, `response`, `usage`, `finishReason`, `cause` |
| `AI_NoContentGeneratedError` | `NoContentGeneratedError` | Model returns empty/no content | `message` |
| `AI_TypeValidationError` | `TypeValidationError` | Schema validation fails on model output | `value`, `cause` |
| `AI_InvalidPromptError` | `InvalidPromptError` | Prompt is malformed (e.g. `UIMessage[]` passed instead of `ModelMessage[]`) | `prompt`, `cause` |
| `AI_RetryError` | `RetryError` | All retry attempts exhausted | `reason`, `lastError`, `errors` |
| `AI_InvalidArgumentError` | `InvalidArgumentError` | Invalid argument passed to an AI SDK function | `parameter`, `value`, `cause` |
| `AI_InvalidResponseDataError` | `InvalidResponseDataError` | Provider returns unexpected response shape | `data`, `cause` |
| `AI_JSONParseError` | `JSONParseError` | JSON parsing fails on model response | `text`, `cause` |
| `AI_NoSuchToolError` | `NoSuchToolError` | Model calls a tool not defined in the tools map | `toolName`, `availableTools` |
| `AI_ToolCallRepairError` | `ToolCallRepairError` | Automatic tool call repair fails | `cause`, `originalError` |
| `AI_UnsupportedFunctionalityError` | `UnsupportedFunctionalityError` | Provider does not support a requested feature | `functionality` |

All error classes expose a static `.isInstance(error)` method for safe type-narrowing. Import from `"ai"`.

<!-- /SECTION:error-types -->
