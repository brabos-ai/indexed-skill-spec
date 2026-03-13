<!-- SECTION:actions-core | keywords: actions,idAction,display,entities,fields,member,memberCreator | Action retrieval, update, and related resources -->
## Action CRUD and Related Resources

### GET /actions/{id} — Get an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `display` | boolean | No | Whether to include the display object. |
| `entities` | boolean | No | Whether to include the entities object. |
| `fields` | string | No | `all` or comma-separated list of action fields. |
| `member` | boolean | No | Whether to include the member object. |
| `member_fields` | string | No | `all` or comma-separated list of member fields. |
| `memberCreator` | boolean | No | Whether to include the member object for the creator of the action. |
| `memberCreator_fields` | string | No | `all` or comma-separated list of member fields. |

### PUT /actions/{id} — Update an Action

Updates the text of a comment action.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | **Yes** | The new text for the comment. |

### DELETE /actions/{id} — Delete an Action

Deletes an action (comment). Requires the action `id` as a path parameter.

### PUT /actions/{id}/text — Update a Comment Action's text

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | **Yes** | The new text for the comment. |

### GET /actions/{id}/{field} — Get a specific field on an Action

Returns the value of a single action field. The `field` path parameter specifies which field to return.

### GET /actions/{id}/board — Get the Board for an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of board fields. |

### GET /actions/{id}/card — Get the Card for an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of card fields. |

### GET /actions/{id}/list — Get the List for an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of list fields. |

### GET /actions/{id}/member — Get the Member of an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of member fields. |

### GET /actions/{id}/memberCreator — Get the Member Creator of an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of member fields. |

### GET /actions/{id}/organization — Get the Organization of an Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of organization fields. |

### Common Action Types

Actions represent events on Trello objects. Common `type` values include:

- **Card**: `commentCard`, `updateCard`, `createCard`, `copyCard`, `moveCardFromBoard`, `moveCardToBoard`, `convertToCardFromCheckItem`, `deleteCard`, `addAttachmentToCard`, `deleteAttachmentFromCard`, `addChecklistToCard`, `removeChecklistFromCard`, `updateCheckItemStateOnCard`, `addMemberToCard`, `removeMemberFromCard`
- **Board**: `updateBoard`, `addMemberToBoard`, `removeMemberFromBoard`, `makeAdminOfBoard`, `makeNormalMemberOfBoard`, `addToOrganizationBoard`, `removeFromOrganizationBoard`, `createBoard`, `copyBoard`, `deleteBoard`
- **List**: `createList`, `updateList`, `moveListFromBoard`, `moveListToBoard`
- **Organization**: `createOrganization`, `updateOrganization`, `addMemberToOrganization`, `removeMemberFromOrganization`

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:actions-core -->

<!-- SECTION:actions-reactions | keywords: reactions,reactionsSummary,emoji,emojiId,skinVariation | Action reactions and reaction summaries -->
## Action Reactions

### GET /actions/{idAction}/reactions — Get Action's Reactions

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `member` | boolean | No | Whether to load the member as a nested resource. |
| `emoji` | boolean | No | Whether to load the emoji as a nested resource. |

### POST /actions/{idAction}/reactions — Create Reaction for Action

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `shortName` | string (body) | No | The primary `shortName` of the emoji to add. See `/emoji`. |
| `skinVariation` | string (body) | No | The `skinVariation` of the emoji to add. See `/emoji`. |
| `native` | string (body) | No | The emoji to add as a native unicode emoji. See `/emoji`. |
| `unified` | string (body) | No | The `unified` value of the emoji to add. See `/emoji`. |

### GET /actions/{idAction}/reactions/{id} — Get a single Action Reaction

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `member` | boolean | No | Whether to load the member as a nested resource. |
| `emoji` | boolean | No | Whether to load the emoji as a nested resource. |

### DELETE /actions/{idAction}/reactions/{id} — Delete an Action's Reaction

Deletes a reaction from an action. Requires `idAction` (action ID) and `id` (reaction ID) as path parameters.

### GET /actions/{idAction}/reactionsSummary — List Action's summary of Reactions

Returns an aggregated summary of reactions on an action.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idAction` | string | **Yes** | The ID of the action. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:actions-reactions -->
