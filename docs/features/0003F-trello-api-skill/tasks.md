# Tasks: 0003F-trello-api-skill

## Metadata

| Campo | Valor |
|-------|-------|
| Complexity | COMPLEX |
| Total tasks | 16 |
| Services | content |

## Tasks

| ID | Description | Service | Files | Deps | Verify |
|----|-------------|---------|-------|------|--------|
| 1.1 | Validate schema and reference templates | content | `schema/v0.1.json`, `skills/gemini-nano-banana/SKILL.md`, `skills/indexed-skill-creator/SKILL.md` | - | Files exist and are readable |
| 2.1 | Create SKILL.md with frontmatter + INDEX | content | `skills/trello-api/SKILL.md` | 1.1 | INDEX has exactly 16 lines; `indexed-skill: tier 2` and `api-version: "v1"` in frontmatter |
| 3.1 | Create sections/auth.md (4 sections) | content | `skills/trello-api/sections/auth.md` | 2.1 | Has auth-overview, auth-url, auth-rate-limits, auth-pagination sections with correct markers |
| 3.2 | Create sections/boards.md (5 sections) | content | `skills/trello-api/sections/boards.md` | 3.1 | All 5 section IDs present; RELATED → auth.md in each |
| 3.3 | Create sections/cards.md (5 sections) | content | `skills/trello-api/sections/cards.md` | 3.1 | All 5 section IDs present; RELATED → auth.md in each |
| 3.4 | Create sections/lists.md (2 sections) | content | `skills/trello-api/sections/lists.md` | 3.1 | Both section IDs present; RELATED → auth.md |
| 3.5 | Create sections/members.md (4 sections) | content | `skills/trello-api/sections/members.md` | 3.1 | All 4 section IDs present; RELATED → auth.md in each |
| 3.6 | Create sections/organizations.md (3 sections) | content | `skills/trello-api/sections/organizations.md` | 3.1 | All 3 section IDs present; RELATED → auth.md |
| 3.7 | Create sections/enterprises.md (3 sections) | content | `skills/trello-api/sections/enterprises.md` | 3.1 | All 3 section IDs present; RELATED → auth.md |
| 3.8 | Create sections/actions.md (2 sections) | content | `skills/trello-api/sections/actions.md` | 3.1 | Both section IDs present; RELATED → auth.md |
| 3.9 | Create sections/checklists.md (2 sections) | content | `skills/trello-api/sections/checklists.md` | 3.1 | Both section IDs present; RELATED → auth.md |
| 3.10 | Create sections/notifications.md (1 section) | content | `skills/trello-api/sections/notifications.md` | 3.1 | notifications-core present; RELATED → auth.md + auth-pagination |
| 3.11 | Create sections/webhooks.md (5 sections) | content | `skills/trello-api/sections/webhooks.md` | 3.1 | All 5 section IDs present; HMAC section uses API key as secret; events table covers all types |
| 3.12 | Create sections/search.md (2 sections) | content | `skills/trello-api/sections/search.md` | 3.1 | Both section IDs present; RELATED → auth.md + auth-pagination |
| 3.13 | Create sections/metadata.md (4 sections) | content | `skills/trello-api/sections/metadata.md` | 3.1 | All 4 section IDs present; RELATED → auth.md |
| 3.14 | Create sections/tokens-plugins.md (2 sections) | content | `skills/trello-api/sections/tokens-plugins.md` | 3.1 | Both sections present; tokens-core has RELATED → webhooks#webhooks-crud |
