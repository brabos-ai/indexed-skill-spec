<!-- SECTION:notifications-core | keywords: notifications,idNotification,unread,read_filter,display,entities | Notification retrieval, read status, and related resources -->
## Notifications

### GET /notifications/{id} — Get a Notification

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `board` | boolean | No | Whether to include the board object. |
| `board_fields` | string | No | `all` or comma-separated list of board fields. |
| `card` | boolean | No | Whether to include the card object. |
| `card_fields` | string | No | `all` or comma-separated list of card fields. |
| `display` | boolean | No | Whether to include the display object with the results. |
| `entities` | boolean | No | Whether to include the entities object with the results. |
| `fields` | string | No | `all` or comma-separated list of notification fields. |
| `list` | boolean | No | Whether to include the list object. |
| `member` | boolean | No | Whether to include the member object. |
| `member_fields` | string | No | `all` or comma-separated list of member fields. |
| `memberCreator` | boolean | No | Whether to include the member object of the creator. |
| `memberCreator_fields` | string | No | `all` or comma-separated list of member fields. |
| `organization` | boolean | No | Whether to include the organization object. |
| `organization_fields` | string | No | `all` or comma-separated list of organization fields. |

### PUT /notifications/{id} — Update a Notification's read status

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `unread` | boolean | No | Whether the notification should be marked as unread (`true`) or read (`false`). |

### PUT /notifications/{id}/unread — Update Notification's read status

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | No | The new unread value. |

### POST /notifications/all/read — Mark all Notifications as read

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `read` | boolean | No | Whether to mark as read or unread. Defaults to `true` (marking as read). |
| `ids` | array | No | Comma-separated list of notification IDs to change the read state for. Allows bulk operations on specific notifications. |

### GET /notifications/{id}/{field} — Get a field of a Notification

Returns the value of a single notification field. The `field` path parameter specifies which field to return.

### GET /notifications/{id}/board — Get the Board a Notification is on

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of board fields. |

### GET /notifications/{id}/card — Get the Card a Notification is on

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of card fields. |

### GET /notifications/{id}/list — Get the List a Notification is on

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of list fields. |

### GET /notifications/{id}/member — Get the Member a Notification is about

Returns the member that the notification is about (not the creator).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of member fields. |

### GET /notifications/{id}/memberCreator — Get the Member who created the Notification

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of member fields. |

### GET /notifications/{id}/organization — Get a Notification's associated Organization

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of organization fields. |

### Common Notification Types

Notifications are triggered by specific events. Common `type` values include:

- **Board**: `addedToBoard`, `removedFromBoard`, `invitedToBoard`, `addAdminToBoard`, `makeAdminOfBoard`, `closeBoard`, `removedFromOrganization`
- **Card**: `addedToCard`, `removedFromCard`, `changeCard`, `cardDueSoon`, `commentCard`, `mentionedOnCard`, `createdCard`
- **Organization**: `addedToOrganization`, `invitedToOrganization`, `addAdminToOrganization`
- **Other**: `makeAdminOfOrganization`, `declinedInvitationToBoard`, `declinedInvitationToOrganization`

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:notifications-core -->
