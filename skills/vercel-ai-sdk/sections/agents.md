<!-- SECTION:building-agents | keywords: ToolLoopAgent,generate,stream,createAgentUIStreamResponse,createAgentUIStream,pipeAgentUIStreamToResponse,InferAgentUIMessage | Building Agents -->

## ToolLoopAgent

```ts
new ToolLoopAgent(config: ToolLoopAgentConfig)
```

| Param | Type | Notes |
|-------|------|-------|
| `model` | `LanguageModel` | Required. Provider model instance |
| `instructions` | `string` | System prompt / behavioral constraints |
| `tools` | `ToolSet` | Named tools the agent may call |
| `stopWhen` | `StopCondition \| StopCondition[]` | Default: `stepCountIs(20)` |
| `toolChoice` | `'auto' \| 'required' \| 'none' \| { type:'tool', toolName }` | Default: `'auto'` |
| `output` | `Output.object(...)` | Structured output schema |
| `callOptionsSchema` | `z.ZodObject` | Typed runtime inputs schema |
| `prepareCall` | `(opts) => AgentSettings` | Mutate settings per call using `options` |
| `onStepFinish` | `callback` | Agent-wide step hook |
| `onFinish` | `callback` | Agent-wide completion hook |

**Usage methods:**

```ts
// Non-streaming
const { text, steps } = await agent.generate({ prompt });

// Streaming
const result = await agent.stream({ prompt });
for await (const chunk of result.textStream) { ... }

// API route (UI integration)
return createAgentUIStreamResponse({ agent, uiMessages: messages });
```

**Streaming helpers for custom runtimes**

```ts
import {
  createAgentUIStream,
  createAgentUIStreamResponse,
  pipeAgentUIStreamToResponse,
} from 'ai';

return createAgentUIStreamResponse({ agent, uiMessages: messages });

const stream = await createAgentUIStream({ agent, uiMessages: messages, abortSignal });
for await (const chunk of stream) {
  console.log(chunk);
}

pipeAgentUIStreamToResponse({
  response: res,
  agent,
  uiMessages: messages,
});
```

Use `createAgentUIStreamResponse` for standard Web route handlers, `createAgentUIStream` when you
need direct access to the chunk stream, and `pipeAgentUIStreamToResponse` for Node.js
`ServerResponse` objects outside the Web `Response` API.

**Type inference:**

```ts
import { InferAgentUIMessage } from 'ai';
export type MyMsg = InferAgentUIMessage<typeof myAgent>;
// Use with useChat<MyMsg>() for full type safety
```

**Lifecycle callbacks** (pass in constructor or per `generate`/`stream` call; both run if defined):

| Callback | When |
|----------|------|
| `experimental_onStart` | Once, before any LLM call |
| `experimental_onStepStart` | Before each step |
| `experimental_onToolCallStart` | Before `execute` runs |
| `experimental_onToolCallFinish` | After `execute` completes/errors |
| `onStepFinish` | After each step; receives usage + finishReason |
| `onFinish` | After all steps; receives totalUsage + steps |

**Gotcha:** `experimental_onStart` / `experimental_onStepStart` are unstable — subject to breaking changes in minor releases. Do not rely on their signature in production without locking the `ai` package version.

**Bridge note:** these helpers expect `uiMessages`, not raw `ModelMessage[]`; let them handle
validation and conversion when exposing an agent over HTTP or another streaming transport.

<!-- /SECTION:building-agents -->

<!-- SECTION:workflows | keywords: generateText,Promise.all,sequential,parallel,orchestrator,routing | Workflow Patterns -->

## Structured Workflow Patterns

Use `generateText` / `streamText` directly (not `ToolLoopAgent`) when you need deterministic, step-by-step control. These patterns are adapted from Anthropic's guide on building effective agents.

| Pattern | When to Use |
|---------|-------------|
| Sequential (chain) | Well-defined order; each step feeds the next |
| Parallel | Independent subtasks; use `Promise.all` |
| Routing | Input-dependent branching; first call classifies |
| Orchestrator-Worker | Coordinator plans; workers execute in parallel |
| Evaluator-Optimizer | Quality loop; retry until threshold met |

**Sequential chain skeleton:**

```ts
const { text: draft } = await generateText({ model, prompt: '...' });
const { output: metrics } = await generateText({
  model,
  output: Output.object({ schema: qualitySchema }),
  prompt: `Evaluate: ${draft}`,
});
if (metrics.score < 7) {
  const { text: improved } = await generateText({ model, prompt: `Improve: ${draft}` });
}
```

**Parallel execution:**

```ts
const [secReview, perfReview] = await Promise.all([
  generateText({ model, system: 'Security expert', prompt: code }),
  generateText({ model, system: 'Performance expert', prompt: code }),
]);
```

**Routing pattern** — first call decides model and system prompt for second:

```ts
const { output: cls } = await generateText({
  model, output: Output.object({ schema: z.object({ type: z.enum(['general','refund','technical']), complexity: z.enum(['simple','complex']) }) }),
  prompt: `Classify: ${query}`,
});
const { text } = await generateText({
  model: cls.complexity === 'simple' ? 'openai/gpt-4o-mini' : 'openai/o4-mini',
  system: systemMap[cls.type],
  prompt: query,
});
```

**Orchestrator-Worker** — orchestrator emits a plan; workers run in `Promise.all`.

**Evaluator-Optimizer** — while loop with `MAX_ITERATIONS`; break when `qualityScore >= 8`.

**Gotcha:** `ToolLoopAgent` is non-deterministic by design. Use these explicit patterns whenever repeatability, auditability, or cost predictability is required.

<!-- RELATED: sections/core-generation.md#generate-text -->
<!-- /SECTION:workflows -->

<!-- SECTION:loop-control | keywords: stopWhen,stepCountIs,hasToolCall,prepareStep,toolChoice,activeTools | Loop Control -->

## Loop Control: stopWhen and prepareStep

The loop continues until: text is generated (no tool call), a tool has no `execute`, a tool needs approval, or a stop condition fires.

**Built-in stop conditions:**

```ts
import { stepCountIs, hasToolCall } from 'ai';

stopWhen: stepCountIs(20)           // default
stopWhen: [stepCountIs(20), hasToolCall('done')]   // any match stops
```

**Custom stop condition:**

```ts
import { StopCondition, ToolSet } from 'ai';
const budgetGuard: StopCondition<typeof tools> = ({ steps }) => {
  const cost = steps.reduce((acc, s) =>
    acc + (s.usage?.inputTokens ?? 0) * 0.01 / 1000, 0);
  return cost > 0.50;
};
```

**`prepareStep`** — runs before each step; return only the keys you want to override:

| Returnable key | Effect |
|----------------|--------|
| `model` | Switch model mid-loop |
| `messages` | Trim or transform context |
| `activeTools` | Restrict available tools |
| `toolChoice` | Force a specific tool |

```ts
prepareStep: async ({ stepNumber, steps, messages }) => {
  if (stepNumber <= 2) return { activeTools: ['search'], toolChoice: 'required' };
  if (stepNumber <= 5) return { activeTools: ['analyze'] };
  return { activeTools: ['summarize'], toolChoice: 'required' };
}
```

**Forced-tool + sentinel `done` pattern** — ensures every step uses a tool; stops on explicit signal:

```ts
tools: {
  search: searchTool,
  done: tool({ inputSchema: z.object({ answer: z.string() }) }), // no execute
},
toolChoice: 'required',
// Access answer: result.staticToolCalls[0].input.answer
```

**`callOptionsSchema` + `prepareCall`** for typed runtime configuration:

```ts
callOptionsSchema: z.object({ complexity: z.enum(['simple','complex']) }),
prepareCall: ({ options, ...settings }) => ({
  ...settings,
  model: options.complexity === 'simple' ? 'openai/gpt-4o-mini' : 'openai/o1-mini',
}),
// Usage: agent.generate({ prompt, options: { complexity: 'complex' } })
```

**Gotcha:** `prepareStep` receives `stepNumber` as 0-indexed. A guard like `stepNumber > 2` skips steps 0, 1, 2 — meaning the stronger model kicks in on step 3 (the fourth LLM call), not the third.

<!-- /SECTION:loop-control -->

<!-- SECTION:memory | keywords: anthropic.tools.memory,Mem0,createHindsightTools,lettaCloud,supermemoryTools | Memory Providers -->

## Agent Memory

| Approach | Effort | Lock-in | Package |
|----------|--------|---------|---------|
| Anthropic built-in tool | Low | Anthropic only | `@ai-sdk/anthropic` |
| Mem0 | Low | Mem0 + chosen LLM | `@mem0/vercel-ai-provider` |
| Letta | Low | Letta cloud/self-hosted | `@letta-ai/vercel-ai-sdk-provider` |
| Supermemory | Low | Supermemory cloud | `@supermemory/tools` |
| Hindsight | Low-Med | Self-hostable | `@vectorize-io/hindsight-ai-sdk` |
| Custom tool | High | None | — |

**Anthropic memory tool** (Claude only):

```ts
import { anthropic } from '@ai-sdk/anthropic';
const memory = anthropic.tools.memory_20250818({
  execute: async action => { /* map action.command to your storage */ },
});
new ToolLoopAgent({ model: 'anthropic/claude-haiku-4.5', tools: { memory } });
```

Commands: `view`, `create`, `str_replace`, `insert`, `delete`, `rename` — all scoped to `/memories`.

**Mem0** (any LLM provider):

```ts
import { createMem0 } from '@mem0/vercel-ai-provider';
const mem0 = createMem0({ provider: 'openai', mem0ApiKey: '...', apiKey: '...' });
new ToolLoopAgent({ model: mem0('gpt-4.1', { user_id: 'user-123' }) });
// Explicit ops: addMemories(messages, { user_id }), retrieveMemories(prompt, { user_id })
```

**Letta** (persistent long-term memory, cloud or self-hosted):

```ts
import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider';
new ToolLoopAgent({
  model: lettaCloud(),
  providerOptions: { letta: { agent: { id: 'your-agent-id' } } },
});
```

**Supermemory** (any provider, automatic save/retrieve via semantic search):

```ts
import { supermemoryTools } from '@supermemory/tools/ai-sdk';
new ToolLoopAgent({ model, tools: supermemoryTools(process.env.SUPERMEMORY_API_KEY!) });
```

**Hindsight** (5 tools: `retain`, `recall`, `reflect`, `getMentalModel`, `getDocument`):

```ts
import { createHindsightTools } from '@vectorize-io/hindsight-ai-sdk';
new ToolLoopAgent({
  model,
  tools: createHindsightTools({ client, bankId: 'user-123' }),
  stopWhen: stepCountIs(10),
});
```

**Gotcha:** In multi-user apps with Hindsight, call `createHindsightTools` inside the request handler — not at module level — so each request gets the correct `bankId` (user ID). Sharing a single instance leaks memory across users.

<!-- /SECTION:memory -->

<!-- SECTION:subagents | keywords: ToolLoopAgent,readUIMessageStream,toModelOutput,abortSignal,InferAgentUIMessage | Subagents -->

## Subagent Delegation

A subagent is a `ToolLoopAgent` invoked from inside a parent agent's tool `execute` function. Each invocation gets a fresh, isolated context window.

**When to use:**

- Task requires exploring large token volumes (files, codebases, research)
- Multiple independent tasks can run in parallel via `Promise.all`
- You need tool access scoped by capability (read-only vs write)

**Basic pattern (no streaming):**

```ts
const subagent = new ToolLoopAgent({ model, instructions: '...summarize findings...', tools: { read, search } });

const delegateTool = tool({
  inputSchema: z.object({ task: z.string() }),
  execute: async ({ task }, { abortSignal }) => {
    const result = await subagent.generate({ prompt: task, abortSignal });
    return result.text;
  },
});
const mainAgent = new ToolLoopAgent({ model, tools: { research: delegateTool } });
```

Always pass `abortSignal` through; cancellation propagates and throws `AbortError` in the subagent.

**Streaming progress to UI:**

```ts
import { readUIMessageStream } from 'ai';

execute: async function* ({ task }, { abortSignal }) {
  const result = await subagent.stream({ prompt: task, abortSignal });
  for await (const message of readUIMessageStream({ stream: result.toUIMessageStream() })) {
    yield message;   // each yield REPLACES previous; message is accumulated UIMessage
  }
},
```

**Context isolation with `toModelOutput`** — UI sees full subagent trace; model sees only summary:

```ts
toModelOutput: ({ output: message }) => {
  const lastText = message?.parts.findLast(p => p.type === 'text');
  return { type: 'text', value: lastText?.text ?? 'Task completed.' };
},
```

**Type safety for UI rendering:**

```ts
export type MainAgentMessage = InferAgentUIMessage<typeof mainAgent>;
// useChat<MainAgentMessage>() gives typed part.type discriminators
```

Tool part states for UI:

| State | Meaning |
|-------|---------|
| `input-streaming` | Input being generated |
| `input-available` | Ready to execute |
| `output-available` | Output present; check `part.preliminary` |
| `output-error` | Execution failed |

**Gotcha:** Subagent tools cannot use `needsApproval`. If human-in-the-loop confirmation is needed, handle it in the main agent before invoking the subagent tool. Also: passing full `messages` history from the tool context into the subagent defeats context isolation — do so only when the subagent genuinely needs prior conversation history.

<!-- /SECTION:subagents -->
