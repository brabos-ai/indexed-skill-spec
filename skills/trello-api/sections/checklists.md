<!-- SECTION:checklists-core | keywords: checklists,idChecklist,idCard,idChecklistSource,pos | Checklist CRUD -->
## Checklist CRUD

### POST /checklists — Create a Checklist

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idCard` | string | Yes | The ID of the card the checklist should be added to. |
| `name` | string | No | The checklist name, 1 to 16384 characters. |
| `pos` | string | No | Position on the card: `top`, `bottom`, or a positive number. |
| `idChecklistSource` | string | No | The ID of a checklist to copy into the new checklist. |

### GET /checklists/{id} — Get a Checklist

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `cards` | string | No | Nested card inclusion. One of: `all`, `closed`, `none`, `open`, `visible`. Default: `none`. |
| `checkItems` | string | No | Check items to return. One of: `all`, `none`. Default: `all`. |
| `checkItem_fields` | string | No | Fields per check item. One of `all` or comma-separated: `name`, `nameData`, `pos`, `state`, `type`, `due`, `dueReminder`, `idMember`. Default: `name,nameData,pos,state,due,dueReminder,idMember`. |
| `fields` | string | No | `all` or a comma-separated list of checklist fields. Default: `all`. |

### PUT /checklists/{id} — Update a Checklist

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | New checklist name, 1 to 16384 characters. |
| `pos` | string | No | New position: `top`, `bottom`, or a positive number. |

### DELETE /checklists/{id} — Delete a Checklist

Permanently deletes the checklist. Path parameter: `id` (checklist ID).

### PUT /checklists/{id}/{field} — Update a Field on a Checklist

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | Yes | The new value for the field, 1 to 16384 characters. |

### GET /checklists/{id}/board — Get the Board the Checklist is On

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | The checklist ID. |
| `fields` | string | No | `all` or a comma-separated list of board fields. One of: `all`, `name`. Default: `all`. |

### GET /checklists/{id}/cards — Get the Card a Checklist is On

Returns the card(s) associated with this checklist. Path parameter: `id` (checklist ID, required).

### GET /checklists/{id}/{field} — Get a Field on a Checklist

Returns the value of a single checklist field. Path parameters: `id` (checklist ID), `field` (field name).

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:checklists-core -->

<!-- SECTION:checklists-items | keywords: checkItems,idCheckItem,checked,due,dueReminder | Check item management -->
## Check Items

### GET /checklists/{id}/checkItems — Get Check Items on a Checklist

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | One of: `all`, `none`. Default: `all`. |
| `fields` | string | No | One of `all` or comma-separated: `name`, `nameData`, `pos`, `state`, `type`, `due`, `dueReminder`, `idMember`. Default: `name,nameData,pos,state,due,dueReminder,idMember`. |

### POST /checklists/{id}/checkItems — Create a Check Item

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Check item name, 1 to 16384 characters. |
| `pos` | string | No | Position in the checklist: `top`, `bottom`, or a positive number. Default: `bottom`. |
| `checked` | boolean | No | Whether the item is already checked when created. Default: `false`. |
| `due` | string | No | A due date for the check item (ISO 8601 date string). |
| `dueReminder` | number | No | A reminder offset for the due date. |
| `idMember` | string | No | ID of a member to assign to this check item. |

### GET /checklists/{id}/checkItems/{idCheckItem} — Get a Check Item

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | One of `all` or comma-separated: `name`, `nameData`, `pos`, `state`, `type`, `due`, `dueReminder`, `idMember`. Default: `name,nameData,pos,state,due,dueReminder,idMember`. |

### DELETE /checklists/{id}/checkItems/{idCheckItem} — Delete a Check Item

Removes a check item from the checklist. Path parameters: `id` (checklist ID), `idCheckItem` (check item ID).

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:checklists-items -->
