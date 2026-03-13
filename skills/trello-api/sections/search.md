<!-- SECTION:search-core | keywords: search,query,modelTypes,board_fields,card_fields,boards_limit,cards_limit,partial | Full-text search across Trello -->
## Search Trello — GET /search

Full-text search across boards, cards, members, and organizations.

```
GET https://api.trello.com/1/search?query={query}&key={key}&token={token}
```

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string (1–16384 chars) | Yes | — | The search query string |
| `idBoards` | string | No | — | `mine` or comma-separated list of Board IDs to scope the search |
| `idOrganizations` | string | No | — | Comma-separated list of Organization IDs to scope the search |
| `idCards` | string | No | — | Comma-separated list of Card IDs to scope the search |
| `modelTypes` | string | No | `all` | What types to search. `all` or comma-separated list of: `actions`, `boards`, `cards`, `members`, `organizations` |
| `board_fields` | string | No | `name,idOrganization` | `all` or comma-separated list of: `closed`, `dateLastActivity`, `dateLastView`, `desc`, `descData`, `idOrganization`, `invitations`, `invited`, `labelNames`, `memberships`, `name`, `pinned`, `powerUps`, `prefs`, `shortLink`, `shortUrl`, `starred`, `subscribed`, `url` |
| `boards_limit` | integer | No | `10` | Max boards returned. Maximum: 1000 |
| `board_organization` | boolean | No | `false` | Whether to include the parent organization with board results |
| `card_fields` | string | No | `all` | `all` or comma-separated list of: `badges`, `checkItemStates`, `closed`, `dateLastActivity`, `desc`, `descData`, `due`, `idAttachmentCover`, `idBoard`, `idChecklists`, `idLabels`, `idList`, `idMembers`, `idMembersVoted`, `idShort`, `labels`, `manualCoverAttachment`, `name`, `pos`, `shortLink`, `shortUrl`, `subscribed`, `url` |
| `cards_limit` | integer | No | `10` | Max cards returned. Maximum: 1000 |
| `cards_page` | number | No | `0` | Page of card results (zero-based). Maximum: 100 |
| `card_board` | boolean | No | `false` | Whether to include the parent board with card results |
| `card_list` | boolean | No | `false` | Whether to include the parent list with card results |
| `card_members` | boolean | No | `false` | Whether to include member objects with card results |
| `card_stickers` | boolean | No | `false` | Whether to include sticker objects with card results |
| `card_attachments` | string | No | `false` | `true`, `false`, or `cover` (only card cover attachments) |
| `organization_fields` | string | No | `name,displayName` | `all` or comma-separated list of: `billableMemberCount`, `desc`, `descData`, `displayName`, `idBoards`, `invitations`, `invited`, `logoHash`, `memberships`, `name`, `powerUps`, `prefs`, `premiumFeatures`, `products`, `url`, `website` |
| `organizations_limit` | integer | No | `10` | Max organizations returned. Maximum: 1000 |
| `member_fields` | string | No | `avatarHash,fullName,initials,username,confirmed` | `all` or comma-separated list of: `avatarHash`, `bio`, `bioData`, `confirmed`, `fullName`, `idPremOrgsAdmin`, `initials`, `memberType`, `products`, `status`, `url`, `username` |
| `members_limit` | integer | No | `10` | Max members returned. Maximum: 1000 |
| `partial` | boolean | No | `false` | Enable prefix matching. When `true`, searching "dev" matches "Development". Only matches word beginnings, not substrings ("velopment" will not match). |

### Response shape

```json
{
  "options": { "terms": [...], "modifiers": [...] },
  "boards": [ /* Board objects */ ],
  "cards": [ /* Card objects */ ],
  "members": [ /* Member objects */ ],
  "organizations": [ /* Organization objects */ ]
}
```

Only arrays for requested `modelTypes` are populated. Unrequested types return empty arrays.

### Example

```
GET /search?query=sprint+planning&modelTypes=cards,boards&cards_limit=25&cards_page=0&card_fields=name,idBoard,idList,due&boards_limit=5&partial=true&key=...&token=...
```

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:search-core -->

<!-- SECTION:search-members | keywords: search/members,query,limit,idBoard,idOrganization,onlyOrgMembers,autocomplete | Search for members -->
## Search Members — GET /search/members/

Search for Trello members by name or username. Useful for autocomplete and invite UX.

```
GET https://api.trello.com/1/search/members/?query={query}&key={key}&token={token}
```

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string (1–16384 chars) | Yes | — | Search query for member name or username |
| `limit` | integer | No | `8` | Max results returned. Maximum: 20 |
| `idBoard` | TrelloID | No | — | Scope search to members of a specific board |
| `idOrganization` | TrelloID | No | — | Scope search to members of a specific organization |
| `onlyOrgMembers` | boolean | No | `false` | When `true` and `idOrganization` is set, only return members who belong to that organization |

### Response

Returns an array of Member objects:

```json
[
  {
    "id": "5a1b2c3d...",
    "fullName": "Jane Smith",
    "username": "janesmith",
    "avatarHash": "abc123...",
    "initials": "JS",
    "confirmed": true
  }
]
```

### Scoping behavior

- When `idBoard` is provided, results are prioritized/filtered to board members.
- When `idOrganization` is provided, results are scoped to organization members.
- Combine `idOrganization` with `onlyOrgMembers=true` to strictly limit to org members only.

### Example

```
GET /search/members/?query=jane&limit=5&idBoard=5a1b2c3d&key=...&token=...
```

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:search-members -->
