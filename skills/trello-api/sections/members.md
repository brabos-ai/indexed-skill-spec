<!-- SECTION:members-core | keywords: members,idMember,username,fullName,initials,bio,avatarSource | Member profile retrieval, update, avatar, and field access -->
## Member Profile

### GET /members/{id} — Get a Member

Retrieve a member by their ID or username.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `actions` | string | No | See the Actions Nested Resource. |
| `boards` | string | No | See the Boards Nested Resource. |
| `boardBackgrounds` | string | No | One of: `all`, `custom`, `default`, `none`, `premium`. |
| `boardsInvited` | string | No | `all` or comma-separated list of: `closed`, `members`, `open`, `organization`, `pinned`, `public`, `starred`, `unpinned`. |
| `boardsInvited_fields` | string | No | `all` or comma-separated list of board fields. |
| `boardStars` | boolean | No | Whether to return the boardStars. |
| `cards` | string | No | See the Cards Nested Resource. |
| `customBoardBackgrounds` | string | No | `all` or `none`. |
| `customEmoji` | string | No | `all` or `none`. |
| `customStickers` | string | No | `all` or `none`. |
| `fields` | string | No | `all` or comma-separated list of member fields. |
| `notifications` | string | No | See the Notifications Nested Resource. |
| `organizations` | string | No | One of: `all`, `members`, `none`, `public`. |
| `organization_fields` | string | No | `all` or comma-separated list of organization fields. |
| `organization_paid_account` | boolean | No | Whether to include paid account information in the returned workspace object. |
| `organizationsInvited` | string | No | One of: `all`, `members`, `none`, `public`. |
| `organizationsInvited_fields` | string | No | `all` or comma-separated list of organization fields. |
| `paid_account` | boolean | No | Whether to include paid account information in the returned member object. |
| `savedSearches` | boolean | No | Whether to include saved searches. |
| `tokens` | string | No | `all` or `none`. |

### PUT /members/{id} — Update a Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | No | New name for the member. Cannot begin or end with a space. |
| `initials` | string | No | New initials for the member. 1-4 characters long. |
| `username` | string | No | New username. At least 3 characters, only lowercase letters, underscores, and numbers. Must be unique. |
| `bio` | string | No | New biography for the member. |
| `avatarSource` | string | No | One of: `gravatar`, `none`, `upload`. |
| `prefs/colorBlind` | boolean | No | Whether to enable color blind mode. |
| `prefs/locale` | string | No | Locale preference for the member. |
| `prefs/minutesBetweenSummaries` | integer | No | `-1` for disabled, `1`, or `60`. |

### GET /members/{id}/{field} — Get a specific field on a Member

Returns the value of a single member field. The `field` path parameter specifies which field to return.

### POST /members/{id}/avatar — Upload a Member avatar

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | **Yes** | The image file to upload as the member's avatar. |

### POST /members/{id}/oneTimeMessagesDismissed — Dismiss a one-time message

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | **Yes** | The message to dismiss. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:members-core -->

<!-- SECTION:members-boards | keywords: boards,boardsInvited,boardStars,cards,organizations | Member boards, cards, organizations, actions, tokens, and board stars -->
## Member Boards, Cards, and Organizations

### GET /members/{id}/boards — Get Boards that a Member belongs to

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | `all` or comma-separated list of: `closed`, `members`, `open`, `organization`, `public`, `starred`. |
| `fields` | string | No | `all` or comma-separated list of board fields. |
| `lists` | string | No | Which lists to include. One of: `all`, `closed`, `none`, `open`. |
| `organization` | boolean | No | Whether to include the Organization object with the Boards. |
| `organization_fields` | string | No | `all` or comma-separated list of organization fields. |

### GET /members/{id}/boardsInvited — Get Boards a Member has been invited to

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of board fields. |

### GET /members/{id}/cards — Get Cards a Member is on

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | One of: `all`, `closed`, `complete`, `incomplete`, `none`, `open`, `visible`. |

### GET /members/{id}/organizations — Get Organizations a Member belongs to

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | One of: `all`, `members`, `none`, `public`. Note: `members` filters to only private Workspaces. |
| `fields` | string | No | `all` or comma-separated list of organization fields. |
| `paid_account` | boolean | No | Whether to include paid account information in the returned workspace object. |

### GET /members/{id}/organizationsInvited — Get Organizations a Member has been invited to

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of organization fields. |

### GET /members/{id}/actions — Get Actions for a Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | A comma-separated list of action types. |

### GET /members/{id}/tokens — Get Tokens for a Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `webhooks` | boolean | No | Whether to include webhooks. |

### GET /members/{id}/boardStars — List Board Stars for a Member

Returns all starred boards for the member.

### POST /members/{id}/boardStars — Star a Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idBoard` | string | **Yes** | The ID of the board to star. |
| `pos` | string | **Yes** | Position of the newly starred board. `top`, `bottom`, or a positive float. |

### GET /members/{id}/boardStars/{idStar} — Get a Board Star

Returns a specific board star by `idStar`.

### PUT /members/{id}/boardStars/{idStar} — Update a Board Star

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `pos` | string | No | New position for the starred board. `top`, `bottom`, or a positive float. |

### DELETE /members/{id}/boardStars/{idStar} — Delete a Board Star

Removes a board star. Requires `idStar` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:members-boards -->

<!-- SECTION:members-prefs | keywords: notifications,notificationsChannelSettings,channel,blockedKeys,savedSearches,read_filter | Notifications, notification channel settings, and saved searches -->
## Notifications, Channel Settings, and Saved Searches

### GET /members/{id}/notifications — Get Notifications for a Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `entities` | boolean | No | Whether to include the entities object. |
| `display` | boolean | No | Whether to include the display object. |
| `filter` | string | No | Comma-separated list of notification types. |
| `read_filter` | string | No | One of: `all`, `read`, `unread`. |
| `fields` | string | No | `all` or comma-separated list of notification fields. |
| `limit` | integer | No | Max 1000. |
| `page` | integer | No | Max 100. |
| `before` | string | No | A notification ID to paginate before. |
| `since` | string | No | A notification ID to paginate since. |
| `memberCreator` | boolean | No | Whether to include the memberCreator object. |
| `memberCreator_fields` | string | No | `all` or comma-separated list of member fields. |

### GET /members/{id}/notificationsChannelSettings — Get Notification Channel Settings

Returns all notification channel settings for the member.

### PUT /members/{id}/notificationsChannelSettings — Update Notification Channel Settings

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string (body) | No | The notification channel. |
| `blockedKeys` | string (body) | No | Blocked key or array of blocked keys. |

### GET /members/{id}/notificationsChannelSettings/{channel} — Get Settings for a Channel

Returns notification settings for a specific channel. The `channel` path parameter specifies which channel.

### PUT /members/{id}/notificationsChannelSettings/{channel} — Update Settings for a Channel

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `blockedKeys` | string (body) | No | Singular key or array of notification keys. |

### PUT /members/{id}/notificationsChannelSettings/{channel}/{blockedKeys} — Block Notification Keys

Updates blocked notification keys for a specific channel. Both `channel` and `blockedKeys` are path parameters (comma-separated list of notification keys).

### GET /members/{id}/savedSearches — List Saved Searches

Returns all saved searches for the member.

### POST /members/{id}/savedSearches — Create a Saved Search

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | The name for the saved search. |
| `query` | string | **Yes** | The search query. |
| `pos` | string | **Yes** | Position. `top`, `bottom`, or a positive float. |

### GET /members/{id}/savedSearches/{idSearch} — Get a Saved Search

Returns a single saved search by `idSearch`.

### PUT /members/{id}/savedSearches/{idSearch} — Update a Saved Search

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | The new name for the saved search. |
| `query` | string | No | The new search query. |
| `pos` | string | No | New position. `top`, `bottom`, or a positive float. |

### DELETE /members/{id}/savedSearches/{idSearch} — Delete a Saved Search

Deletes a saved search. Requires `idSearch` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:members-prefs -->

<!-- SECTION:members-custom | keywords: boardBackgrounds,customBoardBackgrounds,customEmoji,customStickers,brightness,tile | Custom board backgrounds, emoji, and stickers -->
## Custom Board Backgrounds, Emoji, and Stickers

### GET /members/{id}/boardBackgrounds — List Board Backgrounds

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | One of: `all`, `custom`, `default`, `none`, `premium`. |

### POST /members/{id}/boardBackgrounds — Upload a Board Background

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | **Yes** | The image file to upload. |

### GET /members/{id}/boardBackgrounds/{idBackground} — Get a Board Background

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of: `brightness`, `fullSizeUrl`, `scaled`, `tile`. |

### PUT /members/{id}/boardBackgrounds/{idBackground} — Update a Board Background

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `brightness` | string | No | One of: `dark`, `light`, `unknown`. |
| `tile` | boolean | No | Whether the background should be tiled. |

### DELETE /members/{id}/boardBackgrounds/{idBackground} — Delete a Board Background

Deletes a board background. Requires `idBackground` as a path parameter.

### GET /members/{id}/customBoardBackgrounds — List Custom Board Backgrounds

Returns all custom board backgrounds for the member.

### POST /members/{id}/customBoardBackgrounds — Upload a Custom Board Background

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | **Yes** | The image file to upload. |

### GET /members/{id}/customBoardBackgrounds/{idBackground} — Get a Custom Board Background

Returns a specific custom board background by `idBackground`.

### PUT /members/{id}/customBoardBackgrounds/{idBackground} — Update a Custom Board Background

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `brightness` | string | No | One of: `dark`, `light`, `unknown`. |
| `tile` | boolean | No | Whether to tile the background. |

### DELETE /members/{id}/customBoardBackgrounds/{idBackground} — Delete a Custom Board Background

Deletes a custom board background. Requires `idBackground` as a path parameter.

### GET /members/{id}/customEmoji — List Custom Emoji

Returns all custom emoji for the member.

### POST /members/{id}/customEmoji — Upload a Custom Emoji

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | **Yes** | The image file to upload. |
| `name` | string | **Yes** | Name for the emoji. 2-64 characters. |

### GET /members/{id}/customEmoji/{idEmoji} — Get a Custom Emoji

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of `name`, `url`. |

### GET /members/{id}/customStickers — List Custom Stickers

Returns all custom stickers for the member.

### POST /members/{id}/customStickers — Upload a Custom Sticker

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | **Yes** | The image file to upload. |

### GET /members/{id}/customStickers/{idSticker} — Get a Custom Sticker

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of `scaled`, `url`. |

### DELETE /members/{id}/customStickers/{idSticker} — Delete a Custom Sticker

Deletes a custom sticker. Requires `idSticker` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:members-custom -->
