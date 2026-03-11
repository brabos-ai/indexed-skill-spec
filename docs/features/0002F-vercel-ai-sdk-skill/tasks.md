# Tasks: 0002F-vercel-ai-sdk-skill

## Metadata

| Campo | Valor |
|-------|-------|
| Complexity | COMPLEX |
| Total tasks | 13 |
| Services | docs |

## Tasks

| ID | Description | Service | Files | Deps | Verify |
|----|-------------|---------|-------|------|--------|
| 1.1 | Create SKILL.md with frontmatter + INDEX | docs | `skills/vercel-ai-sdk/SKILL.md` | - | frontmatter validates against `schema/v0.1.json`, INDEX has 10 entries ≤30 lines |
| 2.1 | Synthesize foundations.md (5 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/foundations.md` | 1.1 | Read 6 .mdx from 02-foundations/, SECTION markers valid, keywords are real APIs |
| 3.1 | Synthesize core-generation.md (4 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/core-generation.md` | 1.1 | Read 05-generating-text.mdx + 10-generating-structured-data.mdx + 25-settings.mdx + 20-prompt-engineering.mdx |
| 4.1 | Synthesize core-tools.md (4 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/core-tools.md` | 3.1 | Read 15-tools-and-tool-calling.mdx + 16-mcp-tools.mdx + 03-chatbot-tool-usage.mdx + 04-generative-user-interfaces.mdx |
| 5.1 | Synthesize core-infra.md (6 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/core-infra.md` | 1.1 | Read 40-middleware.mdx + 45-provider-management.mdx + 30-embeddings.mdx + 31-reranking.mdx + 35-38 media + 55-testing.mdx + 60-telemetry.mdx + 65-*.mdx |
| 6.1 | Synthesize agents.md (5 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/agents.md` | 3.1, 4.1 | Read all 7 .mdx from 03-agents/ |
| 7.1 | Synthesize ui.md (6 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/ui.md` | 3.1 | Read 02-chatbot.mdx + 05-completion.mdx + 08-object-generation.mdx + 20-streaming-data.mdx + 21-transport.mdx + 50-stream-protocol.mdx + 03-persistence.mdx + 03-resume-streams.mdx + 25-message-metadata.mdx + 10-migrating-to-ui.mdx |
| 8.1 | Synthesize getting-started.md (3 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/getting-started.md` | 3.1, 7.1 | Read all 10 .mdx from 02-getting-started/, extract common pattern + framework diffs table |
| 9.1 | Synthesize production.md (5 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/production.md` | 5.1 | Read 04-caching.mdx + 06-rate-limiting.mdx + 10-vercel-deployment-guide.mdx + 50-error-handling.mdx + 21-error-handling.mdx (UI) + 02-stopping-streams.mdx + 03-backpressure.mdx |
| 10.1 | Synthesize reference.md (3 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/reference.md` | 3.1, 4.1, 5.1, 7.1 | List all API files from 07-reference/ dirs, create index tables |
| 11.1 | Synthesize troubleshooting.md (7 SECTIONs) | docs | `skills/vercel-ai-sdk/sections/troubleshooting.md` | - | Read all 31 .mdx from 09-troubleshooting/, group by theme, symptom→cause→fix tables |
| 12.1 | Create/update submit-to-vercel.md | docs | `docs/submit-to-vercel.md` | 1.1 | Actionable submission guide exists |
| 13.1 | Add RELATED cross-references to all sections | docs | All section files | 2.1-11.1 | RELATED markers link per cross-refs table in plan.md |
