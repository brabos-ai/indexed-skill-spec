# Plan: 0003F-trello-api-skill

## Overview

Create an ISS Tier 2 indexed skill for the Trello REST API at `skills/trello-api/`. The skill
enables AI agents to surgically load only the API sections relevant to their task, instead of
ingesting all 187 endpoints at once. Content is synthesized from `api-specs.json` (OpenAPI 3.0.0).
The structural template is `skills/gemini-nano-banana/` and the direct precedent is `0002F-vercel-ai-sdk-skill`.

Auth (`key` + `token` query params) is the anchor section — every other section carries a
`<!-- RELATED: sections/auth.md#auth-overview -->` marker. Pagination/fields patterns are
documented once in `auth.md#auth-pagination` and referenced via RELATED elsewhere.
Webhooks receive full treatment: creation routes, event types, payload structure, HMAC validation.

---

## Content Structure

### Section Files

| File | Section IDs | Endpoint Count | Focus |
|------|-------------|----------------|-------|
| sections/auth.md | auth-overview, auth-url, auth-rate-limits, auth-pagination | cross-cutting (all 187) | API key + token credentials, base URL construction, rate limits, pagination/fields/filter patterns |
| sections/boards.md | boards-core, boards-members, boards-prefs, boards-labels, boards-plugins | 29 | Board CRUD, member management, preferences, label management, plugin attachments |
| sections/lists.md | lists-core, lists-cards | 10 | List CRUD, archiving, moving, card retrieval |
| sections/cards.md | cards-core, cards-attachments, cards-checklists, cards-labels-members, cards-stickers-comments | 30 | Card CRUD, attachments, checklists, label/member assignment, stickers, comments |
| sections/checklists.md | checklists-core, checklists-items | 7 | Checklist CRUD, checkItem management |
| sections/members.md | members-core, members-boards, members-prefs, members-custom | 27 | Member profile, boards/cards/orgs retrieval, notification settings, custom assets |
| sections/actions.md | actions-core, actions-reactions | 12 | Action retrieval, text update, reactions and reaction summaries |
| sections/organizations.md | orgs-core, orgs-members, orgs-exports | 19 | Workspace CRUD, member management, board visibility, logo, exports |
| sections/enterprises.md | enterprises-core, enterprises-members, enterprises-orgs | 19 | Enterprise data, admin management, member licensing, org claims and transfers |
| sections/notifications.md | notifications-core | 10 | Notification retrieval, mark-read, unread toggle, related resource lookups |
| sections/webhooks.md | webhooks-overview, webhooks-crud, webhooks-events, webhooks-payload, webhooks-hmac | 8 (3 /webhooks/ + 5 /tokens/) | Full webhook lifecycle: creation, event types, payload structure, HMAC validation |
| sections/search.md | search-core, search-members | 2 + batch | Full-text search across boards/cards/orgs, member search |
| sections/metadata.md | labels-core, customfields-core, customfields-options, batch-emoji | 9 (3+4+1+1) | Label CRUD, custom field definitions and options, batch requests, emoji catalog |
| sections/tokens-plugins.md | tokens-core, plugins-core | 9 (5+4) | Token introspection and revocation, plugin metadata and compliance |

**Total: 14 section files | 187 endpoints covered**

---

### SKILL.md INDEX (complete, ≤ 30 lines)

```
<!-- INDEX
@sections/auth.md | auth | API key, token, key, authentication, rate limits, pagination, fields, filter, limit
@sections/boards.md | boards | boards, boardId, idBoard, boardStars, prefs, permissionLevel, boardPlugins
@sections/lists.md | lists | lists, idList, closed, archiveAllCards, moveAllCards, idListSource
@sections/cards.md | cards | cards, idCard, idList, attachments, checklists, stickers, comments, cover, due
@sections/checklists.md | checklists | checklists, checkItems, idChecklist, idCheckItem, idChecklistSource
@sections/members.md | members | members, idMember, username, avatarSource, boardBackgrounds, savedSearches
@sections/actions.md | actions | actions, idAction, reactions, reactionsSummary, memberCreator
@sections/organizations.md | organizations | organizations, idOrganization, displayName, orgInviteRestrict, exports
@sections/enterprises.md | enterprises | enterprises, idEnterprise, licensed, deactivated, claimableOrganizations
@sections/notifications.md | notifications | notifications, idNotification, unread, read_filter, memberCreator
@sections/webhooks.md | webhooks | webhooks, callbackURL, idModel, HMAC, webhook events, payload, signature
@sections/search.md | search | search, query, modelTypes, boards_limit, cards_limit, members_limit, partial
@sections/metadata.md | metadata | labels, customFields, idCustomField, customFieldOption, batch, emoji
@sections/tokens-plugins.md | tokens-plugins | tokens, idPlugin, plugin listing, compliance, memberPrivacy
-->
```

(14 data lines + 2 delimiters = **16 lines total** — within ≤ 30 line constraint)

---

### RELATED Markers Strategy

Every non-auth section gets `<!-- RELATED: sections/auth.md#auth-overview -->` at the end of **each SECTION block**.
Sections that use pagination params also get `<!-- RELATED: sections/auth.md#auth-pagination -->`.

Additional cross-section RELATED markers:

| From Section | RELATED Target | Reason |
|---|---|---|
| boards-core | sections/auth.md#auth-pagination | GET /boards/{boardId}/actions uses limit, before, since |
| boards-labels | sections/metadata.md#labels-core | Label CRUD lives in metadata |
| boards-plugins | sections/tokens-plugins.md#plugins-core | Plugin detail in tokens-plugins |
| lists-cards | sections/cards.md#cards-core | Card detail lives in cards |
| cards-core | sections/auth.md#auth-pagination | GET /cards/{id}/actions supports filter, page |
| cards-checklists | sections/checklists.md#checklists-core | Full checklist CRUD in checklists |
| cards-labels-members | sections/metadata.md#labels-core | Label/customField detail in metadata |
| tokens-core | sections/webhooks.md#webhooks-crud | Token webhook sub-endpoints documented in webhooks |
| webhooks-hmac | sections/auth.md#auth-overview | HMAC secret = API key |
| members-prefs | sections/auth.md#auth-pagination | GET /members/{id}/notifications uses limit, page, before, since |
| enterprises-core | sections/auth.md#auth-pagination | /enterprises/{id}/members uses startIndex, count, cursor |
| notifications-core | sections/auth.md#auth-pagination | Uses limit, page, before, since |
| search-core | sections/auth.md#auth-pagination | boards_limit, cards_limit, members_limit, cards_page |

---

### Per-Section Content Spec

#### sections/auth.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| auth-overview | auth,apiKey,APIKey,APIToken,key,token,authentication,credentials | How auth works: two query params (`key` and `token`) on every request; difference between API key (app identity) and token (user authorization); how to obtain each; never include in request body; example URL with both params |
| auth-url | base URL,https://api.trello.com/1,URL construction | Base URL `https://api.trello.com/1`; URL construction pattern; worked example for GET /boards/{id}; key+token always as query params |
| auth-rate-limits | rate limit,429,Retry-After,throttle,rate limiting | 100 req/10s per token, 300 req/10s per API key; HTTP 429; `Retry-After` header; exponential backoff strategy |
| auth-pagination | pagination,fields,filter,limit,page,before,since,offset,partial | Cross-cutting params: `fields` (field projection), `filter` (open/closed/all), `limit`, `page`, `before`/`since` (ISO 8601 cursors), `partial` (search). Table showing which params appear on which resource types. |

#### sections/boards.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| boards-core | boards,boardId,idBoard,GET /boards,POST /boards,PUT /boards,DELETE /boards | POST /boards/ params; GET /boards/{id} full query param table; PUT /boards/{id} params; DELETE; GET /{field} shortcut; GET /boardStars; GET /actions with full params |
| boards-members | boards members,idMember,/boards/{id}/members,/boards/{id}/memberships | GET/PUT/DELETE /boards/{id}/members; GET/PUT /boards/{id}/memberships |
| boards-prefs | prefs,permissionLevel,selfJoin,cardCovers,background,calendarFeedEnabled,emailPosition | GET/PUT /boards/{id}/myPrefs/* endpoints; calendar/email key generation; markedAsViewed; idTags |
| boards-labels | labels,GET /boards/{id}/labels,POST /boards/{id}/labels | GET /boards/{id}/labels; POST /boards/{id}/labels; RELATED → metadata#labels-core |
| boards-plugins | boardPlugins,idPlugin,/boards/{id}/boardPlugins,/boards/{id}/plugins | GET/POST/DELETE boardPlugins; GET plugins; GET checklists; GET customFields |

#### sections/lists.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| lists-core | lists,idList,closed,idBoard,pos,subscribed | POST /lists; GET/PUT /lists/{id}; PUT closed/idBoard/{field}; GET board; GET actions |
| lists-cards | archiveAllCards,moveAllCards,/lists/{id}/cards | GET /lists/{id}/cards; POST archiveAllCards; POST moveAllCards (idBoard, idList) |

#### sections/cards.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| cards-core | cards,idCard,idList,due,dueComplete,pos,closed,subscribed,cover,cardRole | POST /cards full params; GET /cards/{id} full param table; PUT /cards/{id} params; DELETE; GET /{field}; GET /board, /list |
| cards-attachments | attachments,idAttachment,urlSource,fileSource,setCover,mimeType | GET/POST/DELETE /cards/{id}/attachments; GET single attachment |
| cards-checklists | checklists,checkItems,idChecklist,idCheckItem,checkItemStates | GET/POST /cards/{id}/checklists; DELETE checklist; GET checkItemStates; GET/PUT /checkItem/{id}; PUT checklist/checkItem |
| cards-labels-members | idLabels,idMembers,membersVoted,customFieldItems | POST/DELETE labels/members/membersVoted on card; GET members/membersVoted; GET/PUT customFieldItems |
| cards-stickers-comments | stickers,comments,idSticker,image,zIndex,rotate,text | GET/POST/PUT/DELETE stickers; GET /actions; POST/PUT/DELETE comments; markAssociatedNotificationsRead; GET pluginData |

#### sections/checklists.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| checklists-core | checklists,idChecklist,idCard,idChecklistSource,pos | POST /checklists; GET/PUT/DELETE /checklists/{id}; PUT /{field}; GET /board, /cards |
| checklists-items | checkItems,idCheckItem,checked,due,dueReminder | GET/POST /checklists/{id}/checkItems; GET/DELETE /checkItems/{id} |

#### sections/members.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| members-core | members,idMember,username,fullName,initials,bio,avatarSource | GET /members/{id} full param table; PUT /members/{id} params; GET /{field}; POST /avatar; POST /oneTimeMessagesDismissed |
| members-boards | boards,boardsInvited,boardStars,cards,organizations | GET /members/{id}/boards; boardsInvited; cards; organizations; organizationsInvited; actions; tokens |
| members-prefs | notifications,notificationsChannelSettings,channel,blockedKeys,savedSearches | GET/PUT /notificationsChannelSettings; GET /notifications (full params); GET/POST/PUT/DELETE savedSearches |
| members-custom | boardBackgrounds,customBoardBackgrounds,customEmoji,customStickers,brightness,tile | GET/POST/PUT/DELETE boardBackgrounds; customBoardBackgrounds; customEmoji; customStickers |

#### sections/actions.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| actions-core | actions,idAction,display,entities,fields,member,memberCreator | GET/PUT/DELETE /actions/{id}; PUT /text; GET /{field}; GET /board, /card, /list, /member, /memberCreator, /organization; action type enumeration |
| actions-reactions | reactions,reactionsSummary,emoji,emojiId,skinVariation | GET/POST /reactions; GET/DELETE /reactions/{id}; GET /reactionsSummary |

#### sections/organizations.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| orgs-core | organizations,idOrganization,displayName,name,desc,permissionLevel | POST /organizations; GET/PUT/DELETE /organizations/{id}; GET /{field}; GET /boards, /actions, /pluginData; POST/DELETE /logo; DELETE prefs; GET/POST/DELETE /tags |
| orgs-members | orgMembers,idMember,type,deactivated,newBillableGuests,memberships | GET/PUT/DELETE /organizations/{id}/members; deactivated; memberships; newBillableGuests |
| orgs-exports | exports,attachments,/organizations/{id}/exports | POST /exports (attachments: boolean); GET /exports (poll for status); export object fields |

#### sections/enterprises.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| enterprises-core | enterprises,idEnterprise,auditlog,admins,signupUrl | GET /enterprises/{id}; GET /auditlog; GET /admins; GET /signupUrl; POST /tokens |
| enterprises-members | licensed,deactivated,managed,admin,cursor,search | GET /members with full pagination params; GET /members/query; GET /members/{id}; PUT licensed/deactivated; PUT/DELETE /admins/{idMember} |
| enterprises-orgs | claimableOrganizations,pendingOrganizations,transferrable | GET/PUT /organizations; GET /bulk; DELETE /organizations/{idOrg}; GET /claimable/pending/transferrable |

#### sections/notifications.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| notifications-core | notifications,idNotification,unread,read_filter,display,entities | GET /notifications/{id} full param table; PUT /notifications/{id}; PUT /unread; POST /all/read; GET /{field}; GET /board, /card, /list, /member, /memberCreator, /organization; notification type enumeration |

#### sections/webhooks.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| webhooks-overview | webhooks,callbackURL,idModel,active,description,webhook | Two creation routes: POST /webhooks/ and POST /tokens/{token}/webhooks; idModel scope (board/card/list/member/org); HEAD verification of callbackURL; must return 200 |
| webhooks-crud | GET /webhooks,PUT /webhooks,DELETE /webhooks,/tokens/{token}/webhooks | Full CRUD on both /webhooks/ and /tokens/{token}/webhooks/{idWebhook} routes |
| webhooks-events | webhook events,action types,updateCard,createCard,commentCard | Comprehensive table of action types grouped by resource: Board, Card, List, Member, Org events |
| webhooks-payload | payload,action,model,type,data,display | POST body structure: action.id, action.type, action.data, action.memberCreator, model; Content-Type JSON; example payloads for commentCard and updateCard |
| webhooks-hmac | HMAC,SHA1,X-Trello-Webhook,signature,validation,secret | HMAC-SHA1 using API key as secret; `X-Trello-Webhook` header; base64 verification; Node.js + Python examples; idempotency via action.id |

#### sections/search.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| search-core | search,query,modelTypes,board_fields,card_fields,boards_limit,cards_limit,partial | GET /search full param table; response shape; partial prefix matching |
| search-members | search/members,query,limit,idBoard,idOrganization,onlyOrgMembers | GET /search/members/; scoped search for invite/autocomplete UX |

#### sections/metadata.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| labels-core | labels,idLabel,color,idBoard,/labels/{id} | POST /labels; GET/PUT/DELETE /labels/{id}; PUT /{field}; color enum (yellow/purple/blue/red/green/orange/black/sky/pink/lime) |
| customfields-core | customFields,idCustomField,type,display,fieldGroup | POST /customFields (type: text/number/date/checkbox/list); GET/PUT/DELETE /customFields/{id} |
| customfields-options | customFieldOption,idCustomFieldOption,options | GET/POST /customFields/{id}/options; GET/DELETE /options/{id}; options only for type=list |
| batch-emoji | batch,/batch,urls,emoji,/emoji,locale,spritesheets | GET /batch (up to 10 URLs); GET /emoji; GET /applications/{key}/compliance |

#### sections/tokens-plugins.md
| Section ID | Keywords | Content Coverage |
|------------|----------|-----------------|
| tokens-core | tokens,token,fields,webhooks,/tokens/{token},DELETE /tokens/{token} | GET /tokens/{token} (fields, webhooks); GET /tokens/{token}/member; DELETE /tokens/{token}/; POST /enterprises/{id}/tokens; RELATED → webhooks#webhooks-crud for token webhook CRUD |
| plugins-core | plugins,idPlugin,listing,compliance,memberPrivacy,/plugins/{id} | GET/PUT /plugins/{id}/; POST /plugins/{idPlugin}/listing; PUT /listings/{idListing}; GET /compliance/memberPrivacy |

---

## Main Flow

1. Agent detects `indexed-skill: tier 2` in `skills/trello-api/SKILL.md` frontmatter
2. Agent reads INDEX (16 lines) → matches topic keyword to section file
3. Agent scans SECTION markers in matched file → matches keyword to section block
4. Agent loads matched section range → has precise endpoint contracts to complete task
5. If auth params needed, agent follows `<!-- RELATED: sections/auth.md#auth-overview -->`

---

## File Structure

```
skills/trello-api/
├── SKILL.md                    # frontmatter + INDEX (14 entries, 16 lines)
└── sections/
    ├── auth.md                 # anchor — cross-cutting (4 sections)
    ├── boards.md               # 29 endpoints (5 sections)
    ├── cards.md                # 30 endpoints (5 sections)
    ├── lists.md                # 10 endpoints (2 sections)
    ├── members.md              # 27 endpoints (4 sections)
    ├── organizations.md        # 19 endpoints (3 sections)
    ├── enterprises.md          # 19 endpoints (3 sections)
    ├── actions.md              # 12 endpoints (2 sections)
    ├── checklists.md           # 7 endpoints (2 sections)
    ├── notifications.md        # 10 endpoints (1 section)
    ├── webhooks.md             # 8 endpoints + events + HMAC (5 sections)
    ├── search.md               # 2 endpoints + batch (2 sections)
    ├── metadata.md             # 9 endpoints (4 sections)
    └── tokens-plugins.md       # 9 endpoints (2 sections)
```

---

## Requirements Coverage

| ID | Requirement | Covered? | Area | Tasks |
|----|-------------|----------|------|-------|
| AC01 | SKILL.md has `indexed-skill: tier 2` + `api-version: "v1"` | ✅ | SKILL.md | 2.1 |
| AC02 | INDEX covers all section files with accurate topic labels | ✅ | SKILL.md | 2.1 |
| AC03 | Each section file has correct SECTION open/close markers | ✅ | All sections | 3.1–3.14 |
| AC04 | Keywords are real Trello API terms (verified against api-specs.json) | ✅ | All sections | 3.1–3.14 |
| AC05 | SKILL.md INDEX is ≤ 30 lines | ✅ | SKILL.md (16 lines) | 2.1 |
| AC06 | Content synthesized from api-specs.json (not hallucinated) | ✅ | All sections | 3.1–3.14 |
| AC07 | Auth section covers API key + token, OAuth, URL construction | ✅ | sections/auth.md | 3.1 |
| AC08 | Every non-auth section has RELATED → sections/auth.md | ✅ | All non-auth sections | 3.2–3.14 |
| AC09 | Pagination/optional fields documented with RELATED markers | ✅ | auth.md + RELATED in relevant sections | 3.1, 3.2–3.14 |
| AC10 | Webhooks covers creation, event types, payload, HMAC | ✅ | sections/webhooks.md (5 sections) | 3.11 |
| AC11 | All 15+ resource groups covered with no major gaps | ✅ | 14 section files, 187 endpoints | 3.1–3.14 |

**Status: ✅ 100% covered**

---

## Implementation Order

1. **SKILL.md** — frontmatter + INDEX (all 14 entries)
2. **sections/auth.md** — first, as anchor for RELATED markers
3. **sections/boards.md** — largest complexity after cards
4. **sections/cards.md** — 30 endpoints, 5 section blocks
5. **sections/lists.md** — simple, 2 sections
6. **sections/members.md** — 27 endpoints, 4 sections
7. **sections/organizations.md** — 19 endpoints, 3 sections
8. **sections/enterprises.md** — 19 endpoints, 3 sections
9. **sections/actions.md** — 12 endpoints, 2 sections
10. **sections/checklists.md** — 7 endpoints, 2 sections
11. **sections/notifications.md** — 10 endpoints, 1 section
12. **sections/webhooks.md** — 8 endpoints + events/payload/HMAC, 5 sections
13. **sections/search.md** — 2 endpoints, 2 sections
14. **sections/metadata.md** — 9 endpoints, 4 sections
15. **sections/tokens-plugins.md** — 9 endpoints, 2 sections

---

## Quick Reference

| Pattern | How to Find |
|---------|-------------|
| ISS Tier 2 structure | `skills/gemini-nano-banana/SKILL.md` |
| SKILL.md frontmatter schema | `schema/v0.1.json` |
| Section file format | `skills/gemini-nano-banana/sections/setup.md` |
| Authoring best practices | `skills/indexed-skill-creator/SKILL.md` |
| Precedent skill (full) | `skills/vercel-ai-sdk/` |
| Source of truth | `docs/features/0003F-trello-api-skill/api-specs.json` |
