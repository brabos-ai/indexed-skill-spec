<!-- SECTION:tool-calling | keywords: tool,execute,inputSchema,dynamicTool,needsApproval,experimental_repairToolCall | Tool Calling -->

## Tool Definition

```ts
import { tool, dynamicTool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  strict: true,           // optional: enforce strict schema validation (provider-dependent)
  needsApproval: true,    // optional: boolean or async ({ ...input }) => boolean
  execute: async ({ location }, { toolCallId, messages, abortSignal }) => ({
    location,
    temperature: 72,
  }),
});
```

| Property | Type | Description |
|---|---|---|
| `description` | `string` | Optional hint influencing when the model selects the tool |
| `inputSchema` | `ZodSchema \| JSONSchema` | Defines and validates input parameters |
| `execute` | `async (input, options) => RESULT` | Optional; omit to forward calls to client or queue |
| `strict` | `boolean` | Enable provider-strict schema validation |
| `needsApproval` | `boolean \| async fn` | Require human approval before execution |
| `inputExamples` | `Array<{ input }>` | Guides the model on input structure (Anthropic only) |

**Multi-step calls** — pass `stopWhen: stepCountIs(N)` to `generateText`/`streamText`; the SDK
re-invokes the model with tool results until no further tool calls are produced or the limit is
reached. Access intermediate data via `result.steps`.

**Dynamic tools** — use `dynamicTool({ ... })` when the schema is unknown at compile time; the
`execute` input is typed as `unknown`. In `onStepFinish` callbacks use `if (toolCall.dynamic)` for
type narrowing before switching on `toolCall.toolName`.

**Repair** — `experimental_repairToolCall` receives `{ toolCall, tools, inputSchema, error }` and
must return a corrected tool call object or `null` to skip repair. Useful for small models that
produce invalid JSON arguments.

**Gotcha:** When `needsApproval` is set, `generateText`/`streamText` does NOT pause — it completes
and returns `tool-approval-request` parts in `result.content`. You must collect user decisions,
push a `{ role: 'tool', content: approvals[] }` message, then call the model again. Missing this
second call means the tool never executes.

<!-- RELATED: sections/agents.md#building-agents -->
<!-- /SECTION:tool-calling -->

<!-- SECTION:mcp-tools | keywords: createMCPClient,mcpClient.tools,StreamableHTTPClientTransport,StdioClientTransport | MCP Tools -->

## MCP Client Setup

```ts
import { createMCPClient } from '@ai-sdk/mcp';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// HTTP (recommended for production)
const mcpClient = await createMCPClient({
  transport: {
    type: 'http',
    url: 'https://your-server.com/mcp',
    headers: { Authorization: 'Bearer token' },
    authProvider: myOAuthProvider, // optional OAuth
  },
});

// Or via official SDK transport class
const mcpClient2 = await createMCPClient({
  transport: new StreamableHTTPClientTransport(new URL('https://your-server.com/mcp')),
});

// Stdio — local dev only, not deployable to production
const mcpClient3 = await createMCPClient({
  transport: new StdioClientTransport({ command: 'node', args: ['server.js'] }),
});
```

| Transport | Use case |
|---|---|
| `type: 'http'` | Production; supports OAuth via `authProvider` |
| `StreamableHTTPClientTransport` | Production; MCP SDK class with session control |
| `type: 'sse'` | Alternative HTTP-based; supports OAuth |
| `StdioClientTransport` | Local dev only |

**Consuming tools, resources, and prompts:**

```ts
// Schema discovery (auto, no type safety)
const tools = await mcpClient.tools();

// Schema definition (typed, selective)
const tools = await mcpClient.tools({
  schemas: {
    'get-data': {
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.object({ result: z.string() }), // typed structuredContent
    },
  },
});

const resources = await mcpClient.listResources();
const content  = await mcpClient.readResource({ uri: 'file:///doc.txt' });
const prompts  = await mcpClient.experimental_listPrompts();
const prompt   = await mcpClient.experimental_getPrompt({ name: 'review', arguments: {} });
```

**Elicitation** — advertise `capabilities: { elicitation: {} }` on `createMCPClient`, then
register a handler with `mcpClient.onElicitationRequest(ElicitationRequestSchema, async req => ({
action: 'accept' | 'decline' | 'cancel', content: userInput }))`.

**Gotcha:** Always close the client. For streaming use `onFinish: async () => mcpClient.close()`;
for `generateText` wrap in `try/finally`. Leaking the client causes dangling connections. The
lightweight `createMCPClient` does NOT support session management or resumable streams.

<!-- /SECTION:mcp-tools -->

<!-- SECTION:tool-ui-integration | keywords: useChat,addToolOutput,addToolApprovalResponse,sendAutomaticallyWhen,onToolCall | Tool UI Integration -->

## Client-Side Tool Execution with useChat

```ts
import { useChat } from '@ai-sdk/react';
import {
  lastAssistantMessageIsCompleteWithToolCalls,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';

const { messages, addToolOutput, addToolApprovalResponse } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

  async onToolCall({ toolCall }) {
    if (toolCall.dynamic) return; // narrow type before using toolName
    if (toolCall.toolName === 'getLocation') {
      // No await — avoids deadlock inside onToolCall
      addToolOutput({
        tool: 'getLocation',
        toolCallId: toolCall.toolCallId,
        output: 'New York',
      });
    }
  },
});
```

| API | Purpose |
|---|---|
| `onToolCall` | Auto-execute client-side tools; call `addToolOutput` (no `await`) |
| `addToolOutput({ tool, toolCallId, output })` | Provide result for a client-side tool call |
| `addToolOutput({ ..., state: 'output-error', errorText })` | Record client-side execution failure |
| `addToolApprovalResponse({ id, approved })` | Approve or deny a server-side `needsApproval` tool |
| `sendAutomaticallyWhen` | Helper to auto-submit when all tool results / approvals are present |

**Approval UI pattern:**

```tsx
// part.state === 'approval-requested' for needsApproval tools
if (part.type === 'tool-getWeather' && part.state === 'approval-requested') {
  return (
    <button onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: true })}>
      Approve
    </button>
  );
}
```

**Dynamic tools in chat** — dynamic tool calls surface as `part.type === 'dynamic-tool'`; switch on
`part.state` (`input-streaming`, `input-available`, `output-available`, `output-error`) and use
`part.toolName` for display.

**Gotcha:** Never `await addToolOutput` inside `onToolCall` — it mutates state synchronously and
awaiting it can cause a deadlock. Also, always check `if (toolCall.dynamic)` before switching on
`toolCall.toolName` or TypeScript will error on unrecognised string literals.

<!-- RELATED: sections/ui.md#use-chat -->
<!-- /SECTION:tool-ui-integration -->

<!-- SECTION:generative-ui | keywords: useChat,tool,UIMessage,parts,convertToModelMessages | Generative UI -->

## Rendering React Components from Tool Results

Server route — expose tools via `streamText` and return `toUIMessageStreamResponse()`:

```ts
// app/api/chat/route.ts
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { tools } from '@/ai/tools'; // tool() helpers with execute functions

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
  });
  return result.toUIMessageStreamResponse();
}
```

Client rendering — iterate `message.parts` and switch on typed `tool-${toolName}` part types:

```tsx
// app/page.tsx
{message.parts.map((part, i) => {
  if (part.type === 'text') return <span key={i}>{part.text}</span>;

  if (part.type === 'tool-displayWeather') {
    switch (part.state) {
      case 'input-available':  return <div key={i}>Loading weather...</div>;
      case 'output-available': return <Weather key={i} {...part.output} />;
      case 'output-error':     return <div key={i}>Error: {part.errorText}</div>;
    }
  }
})}
```

| Concept | Detail |
|---|---|
| `UIMessage` | Message type used on the client; contains `parts` array |
| `convertToModelMessages(messages)` | Converts `UIMessage[]` to `ModelMessage[]` for the model |
| `part.type` | `'text'`, `'tool-{name}'` (static), or `'dynamic-tool'` |
| `part.state` | `input-streaming` → `input-available` → `output-available` \| `output-error` |
| `part.output` | Typed as the tool's `execute` return value when `state === 'output-available'` |

**Key pattern:** Co-locate tool definitions in `ai/tools.ts` using the `tool()` helper. Import the
same `tools` object into the API route and reference tool names in the client switch statement.
Adding a new generative UI widget requires: (1) add tool to `tools`, (2) create React component,
(3) add `case 'tool-newName'` to the parts renderer.

**Gotcha:** Tool parts use the registered tool name, not the function name — e.g. if your tools
object has `{ displayWeather: weatherTool }`, the part type is `tool-displayWeather`, not
`tool-weatherTool`. Mismatches silently fall through the switch without rendering.

<!-- /SECTION:generative-ui -->
