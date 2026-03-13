<!-- SECTION:lists-core | keywords: lists,idList,closed,idBoard,pos,subscribed,/lists/{id},POST /lists | List CRUD and management -->
## List CRUD

### POST /lists — Create a New List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name for the list. |
| `idBoard` | string | Yes | The long ID of the board the list should be created on. |
| `idListSource` | string | No | ID of a list to copy into the new list. |
| `pos` | string | No | Position: `top`, `bottom`, or a positive floating point number. |

### GET /lists/{id} — Get a List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or a comma-separated list of list field names. Default: `name,closed,idBoard,pos`. |

### PUT /lists/{id} — Update a List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New name for the list. |
| `closed` | boolean | No | Whether the list should be closed (archived). |
| `idBoard` | string | No | ID of a board the list should be moved to. |
| `pos` | string | No | New position: `top`, `bottom`, or a positive floating point number. |
| `subscribed` | boolean | No | Whether the active member is subscribed to this list. |

### PUT /lists/{id}/closed — Archive or Unarchive a List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The list ID. |
| `value` | boolean | No | Set to `true` to close (archive) the list. |

### PUT /lists/{id}/idBoard — Move List to Board

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The list ID. |
| `value` | string | Yes | The ID of the board to move the list to. |

### PUT /lists/{id}/{field} — Update a Field on a List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The list ID. |
| `field` | string | Yes | The field to update. One of: `name`, `pos`, `subscribed`. |
| `value` | string | No | The new value for the field. |

### GET /lists/{id}/board — Get the Board a List is On

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The list ID. |
| `fields` | string | No | `all` or a comma-separated list of board fields. Default: `all`. |

### GET /lists/{id}/actions — Get Actions for a List

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The list ID. |
| `filter` | string | No | A comma-separated list of action types. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:lists-core -->

<!-- SECTION:lists-cards | keywords: archiveAllCards,moveAllCards,/lists/{id}/cards | List card operations -->
## List Card Operations

### GET /lists/{id}/cards — Get Cards in a List

Returns all cards in the specified list. Path parameter: `id` (list ID, required).

### POST /lists/{id}/archiveAllCards — Archive All Cards in List

Archives every card in the list. Path parameter: `id` (list ID, required).

### POST /lists/{id}/moveAllCards — Move All Cards in List

Moves every card from this list to another list (optionally on a different board).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The ID of the source list. |
| `idBoard` | string | Yes | The ID of the board the cards should be moved to. |
| `idList` | string | Yes | The ID of the destination list. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/cards.md#cards-core -->
<!-- /SECTION:lists-cards -->
