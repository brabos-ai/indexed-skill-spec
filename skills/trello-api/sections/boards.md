<!-- SECTION:boards-core | keywords: boards,boardId,idBoard,GET /boards,POST /boards,PUT /boards,DELETE /boards,/boards/{id}/{field} | Board CRUD and retrieval -->
## Board CRUD

### POST /boards/ — Create a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | The new name for the board. 1 to 16384 characters long. |
| `defaultLabels` | boolean | No | Whether to use the default set of labels. Default: `true`. |
| `defaultLists` | boolean | No | Whether to add the default lists (To Do, Doing, Done). Ignored if `idBoardSource` is provided. Default: `true`. |
| `desc` | string | No | A description for the board, 0 to 16384 characters long. |
| `idOrganization` | string | No | The id or name of the Workspace the board should belong to. |
| `idBoardSource` | string | No | The id of a board to copy into the new board. |
| `keepFromSource` | string | No | To keep cards from the original board pass `cards`. One of: `cards`, `none`. Default: `none`. |
| `powerUps` | string | No | Power-Ups to enable. One of: `all`, `calendar`, `cardAging`, `recap`, `voting`. |
| `prefs_permissionLevel` | string | No | Permission level. One of: `org`, `private`, `public`. Default: `private`. |
| `prefs_voting` | string | No | Who can vote. One of: `disabled`, `members`, `observers`, `org`, `public`. Default: `disabled`. |
| `prefs_comments` | string | No | Who can comment. One of: `disabled`, `members`, `observers`, `org`, `public`. Default: `members`. |
| `prefs_invitations` | string | No | Who can invite. One of: `admins`, `members`. Default: `members`. |
| `prefs_selfJoin` | boolean | No | Whether users can join without invitation. Default: `true`. |
| `prefs_cardCovers` | boolean | No | Whether card covers are enabled. Default: `true`. |
| `prefs_background` | string | No | A custom background id or one of: `blue`, `orange`, `green`, `red`, `purple`, `pink`, `lime`, `sky`, `grey`. Default: `blue`. |
| `prefs_cardAging` | string | No | Card aging style. One of: `pirate`, `regular`. Default: `regular`. |

### GET /boards/{id} — Get a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `actions` | string | No | Nested resource inclusion for actions. Default: `all`. |
| `boardStars` | string | No | One of: `mine`, `none`. Default: `none`. |
| `cards` | string | No | Nested resource inclusion for cards. Default: `none`. |
| `card_pluginData` | boolean | No | Include card pluginData (use with `cards`). Default: `false`. |
| `checklists` | string | No | Nested resource inclusion for checklists. Default: `none`. |
| `customFields` | boolean | No | Include custom fields. Default: `false`. |
| `fields` | string | No | Comma-separated list of board fields or `all`. Default: `name,desc,descData,closed,idOrganization,pinned,url,shortUrl,prefs,labelNames`. |
| `labels` | string | No | Nested resource inclusion for labels. |
| `lists` | string | No | Nested resource inclusion for lists. Default: `open`. |
| `members` | string | No | Nested resource inclusion for members. Default: `none`. |
| `memberships` | string | No | Nested resource inclusion for memberships. Default: `none`. |
| `pluginData` | boolean | No | Include board pluginData. Default: `false`. |
| `organization` | boolean | No | Include organization. Default: `false`. |
| `organization_pluginData` | boolean | No | Include organization pluginData (use with `organization`). Default: `false`. |
| `myPrefs` | boolean | No | Include user's board preferences. Default: `false`. |
| `tags` | boolean | No | Include board collections/tags. Default: `false`. |

### PUT /boards/{id} — Update a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New name, 1 to 16384 characters. |
| `desc` | string | No | New description, 0 to 16384 characters. |
| `closed` | boolean | No | Whether the board is closed (archived). |
| `subscribed` | boolean | No | Whether the acting user is subscribed. |
| `idOrganization` | string | No | The id of the Workspace to move the board to. |
| `prefs/permissionLevel` | string | No | One of: `org`, `private`, `public`. |
| `prefs/selfJoin` | boolean | No | Whether Workspace members can join the board. |
| `prefs/cardCovers` | boolean | No | Whether card covers are displayed. |
| `prefs/hideVotes` | boolean | No | Whether the Voting Power-Up hides who voted. |
| `prefs/invitations` | string | No | Who can invite. One of: `admins`, `members`. |
| `prefs/voting` | string | No | Who can vote. One of: `disabled`, `members`, `observers`, `org`, `public`. |
| `prefs/comments` | string | No | Who can comment. One of: `disabled`, `members`, `observers`, `org`, `public`. |
| `prefs/background` | string | No | Custom background id or one of: `blue`, `orange`, `green`, `red`, `purple`, `pink`, `lime`, `sky`, `grey`. |
| `prefs/cardAging` | string | No | One of: `pirate`, `regular`. |
| `prefs/calendarFeedEnabled` | boolean | No | Whether the calendar feed is enabled. |

### DELETE /boards/{id} — Delete a Board

Permanently deletes a board. Requires the board `id` (string) as a path parameter.

### GET /boards/{id}/{field} — Get a field on a Board

Returns the value of a single field. The `field` path parameter accepts: `closed`, `dateLastActivity`, `dateLastView`, `desc`, `descData`, `idMemberCreator`, `idOrganization`, `invitations`, `invited`, `labelNames`, `memberships`, `name`, `pinned`, `powerUps`, `prefs`, `shortLink`, `shortUrl`, `starred`, `subscribed`, `url`.

### GET /boards/{boardId}/boardStars — Get boardStars on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `boardId` | string | Yes | The ID of the board. |
| `filter` | string | No | One of: `mine`, `none`. Default: `mine`. |

### GET /boards/{boardId}/actions — Get Actions of a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `boardId` | string | Yes | The ID of the board. |
| `fields` | string | No | Fields to return for actions. |
| `filter` | string | No | Comma-separated list of action types. |
| `format` | string | No | Response format: `list` or `count`. Default: `list`. |
| `idModels` | string | No | Comma-separated list of model IDs to filter by. |
| `limit` | number | No | Number of results, 0 to 1000. Default: `50`. |
| `member` | boolean | No | Include member object per action. Default: `true`. |
| `member_fields` | string | No | Member fields to return. Default: `activityBlocked,avatarHash,avatarUrl,fullName,idMemberReferrer,initials,nonPublic,nonPublicAvailable,username`. |
| `memberCreator` | boolean | No | Include memberCreator object per action. Default: `true`. |
| `memberCreator_fields` | string | No | MemberCreator fields to return. Same defaults as `member_fields`. |
| `page` | number | No | Page of results (zero-based). Default: `0`. |
| `reactions` | boolean | No | Whether to show reactions on comments. |
| `before` | string | No | ISO 8601 date or Mongo ObjectID. Only objects created before this value. |
| `since` | string | No | ISO 8601 date or Mongo ObjectID. Only objects created since this value. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:boards-core -->

<!-- SECTION:boards-members | keywords: boards members,idMember,/boards/{id}/members,/boards/{id}/memberships,GET /boards/{id}/memberships | Board member and membership management -->
## Board Members and Memberships

### GET /boards/{id}/members — Get Members of a Board

Returns all members of the board. No additional query parameters beyond auth.

### PUT /boards/{id}/members — Invite Member via Email

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | The email address of the user to invite. |
| `type` | string | No | Member type. One of: `admin`, `normal`, `observer`. Default: `normal`. |

### PUT /boards/{id}/members/{idMember} — Add a Member to a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | One of: `admin`, `normal`, `observer`. |
| `allowBillableGuest` | boolean | No | Allows org admins to add multi-board guests. Default: `false`. |

### DELETE /boards/{id}/members/{idMember} — Remove Member from Board

Removes the specified member from the board. Path parameters: `id` (board ID), `idMember` (member ID).

### GET /boards/{id}/memberships — Get Memberships of a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The ID of the board. |
| `filter` | string | No | One of: `admins`, `all`, `none`, `normal`. Default: `all`. |
| `activity` | boolean | No | Premium organizations only. Default: `false`. |
| `orgMemberType` | boolean | No | Show the member's org membership type (e.g., `admin`). Default: `false`. |
| `member` | boolean | No | Include a nested member object. Default: `false`. |
| `member_fields` | string | No | Fields for the nested member. Default: `fullname,username`. |

### PUT /boards/{id}/memberships/{idMembership} — Update Membership

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `idMembership` | string | Yes | The membership ID. |
| `type` | string | Yes | One of: `admin`, `normal`, `observer`. |
| `member_fields` | string | No | One of: `all`, `avatarHash`, `bio`, `bioData`, `confirmed`, `fullName`, `idPremOrgsAdmin`, `initials`, `memberType`, `products`, `status`, `url`, `username`. Default: `fullName, username`. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:boards-members -->

<!-- SECTION:boards-prefs | keywords: prefs,permissionLevel,selfJoin,cardCovers,background,calendarFeedEnabled,emailPosition | Board preferences and utility endpoints -->
## Board Preferences and Utilities

### PUT /boards/{id}/myPrefs/emailPosition — Update Email Position

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | string | Yes | One of: `bottom`, `top`. |

### PUT /boards/{id}/myPrefs/idEmailList — Update Email List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | string | Yes | The id of an email list. |

### PUT /boards/{id}/myPrefs/showSidebar — Update Sidebar Visibility

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | boolean | Yes | Whether to show the sidebar. |

### PUT /boards/{id}/myPrefs/showSidebarActivity — Update Sidebar Activity

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | boolean | Yes | Whether to show sidebar activity. |

### PUT /boards/{id}/myPrefs/showSidebarBoardActions — Update Sidebar Board Actions

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | boolean | Yes | Whether to show sidebar board actions. |

### PUT /boards/{id}/myPrefs/showSidebarMembers — Update Sidebar Members

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | boolean | Yes | Whether to show members in the sidebar. |

### POST /boards/{id}/calendarKey/generate — Generate Calendar Key

Generates a new calendar key for the board. Path parameter: `id` (board ID).

### POST /boards/{id}/emailKey/generate — Generate Email Key

Generates a new email key for the board. Path parameter: `id` (board ID).

### POST /boards/{id}/markedAsViewed — Mark Board as Viewed

Marks the board as viewed by the authenticated user. Path parameter: `id` (board ID).

### POST /boards/{id}/idTags — Add a Tag to a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `value` | string | Yes | The id of a tag from the organization to which this board belongs. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:boards-prefs -->

<!-- SECTION:boards-labels | keywords: labels,GET /boards/{id}/labels,POST /boards/{id}/labels,idBoard | Board label listing and creation -->
## Board Labels

### GET /boards/{id}/labels — Get Labels on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The ID of the board. |
| `fields` | string | No | Fields to return for labels. |
| `limit` | integer | No | Number of labels to return. Default: `50`. |

### POST /boards/{id}/labels — Create a Label on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `name` | string | Yes | Label name, 1 to 16384 characters. |
| `color` | string | Yes | Label color or `null`. Valid colors: `yellow`, `purple`, `blue`, `red`, `green`, `orange`, `black`, `sky`, `pink`, `lime`. |

For full label CRUD (GET/PUT/DELETE on individual labels), see the labels-core section.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/metadata.md#labels-core -->
<!-- /SECTION:boards-labels -->

<!-- SECTION:boards-plugins | keywords: boardPlugins,idPlugin,/boards/{id}/boardPlugins,/boards/{id}/plugins | Board Power-Ups, checklists, custom fields, and cards -->
## Board Power-Ups and Nested Resources

### GET /boards/{id}/plugins — Get Power-Ups on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `filter` | string | No | One of: `enabled`, `available`. Default: `enabled`. |

### GET /boards/{id}/boardPlugins — Get Enabled Power-Ups on Board

Returns all Power-Ups currently enabled on the board. No additional query parameters beyond auth.

### POST /boards/{id}/boardPlugins — Enable a Power-Up on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idPlugin` | string | No | The ID of the Power-Up to enable. |

### DELETE /boards/{id}/boardPlugins/{idPlugin} — Disable a Power-Up on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `idPlugin` | string | Yes | The ID of the Power-Up to disable. |

### GET /boards/{id}/checklists — Get Checklists on a Board

Returns all checklists on the board. Path parameter: `id` (board ID, string, required).

### GET /boards/{id}/customFields — Get Custom Fields for Board

Returns all custom field definitions on the board. Path parameter: `id` (board ID, required).

### GET /boards/{id}/cards — Get Cards on a Board

Returns all cards on the board. Path parameter: `id` (board ID, string, required).

### GET /boards/{id}/cards/{filter} — Get Filtered Cards on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `filter` | string | Yes | One of: `all`, `closed`, `complete`, `incomplete`, `none`, `open`, `visible`. |

### GET /boards/{id}/lists — Get Lists on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `cards` | string | No | Filter to apply to cards. |
| `card_fields` | string | No | `all` or comma-separated card fields. Default: `all`. |
| `filter` | string | No | Filter to apply to lists. |
| `fields` | string | No | `all` or comma-separated list fields. Default: `all`. |

### POST /boards/{id}/lists — Create a List on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | List name, 1 to 16384 characters. |
| `pos` | string | No | Position: `top`, `bottom`, or a positive number. Default: `top`. |

### GET /boards/{id}/lists/{filter} — Get Filtered Lists on a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The board ID. |
| `filter` | string | Yes | One of: `all`, `closed`, `none`, `open`. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/tokens-plugins.md#plugins-core -->
<!-- /SECTION:boards-plugins -->
