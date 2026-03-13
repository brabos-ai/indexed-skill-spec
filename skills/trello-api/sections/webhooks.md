<!-- SECTION:webhooks-overview | keywords: webhooks,callbackURL,idModel,active,description,webhook | Webhook concepts -->
## Webhooks Overview

Webhooks allow you to subscribe to changes on Trello models (boards, cards, lists, members, organizations). When a change occurs on the watched model, Trello sends an HTTP POST to your registered callback URL with details about the action.

### Core Concepts

- **`idModel`** — the ID of any Trello model to watch. The scope of the model determines which events are delivered:
  - Board ID → all card, list, member, and checklist changes on that board
  - Card ID → only changes to that specific card
  - List ID → changes to the list and its cards
  - Member ID → changes across all the member's boards
  - Organization ID → changes across all boards in the workspace
- **`callbackURL`** — MUST be HTTPS and publicly reachable. Trello sends a HEAD request to verify the URL before activating the webhook; the endpoint must return HTTP 200.
- **`active`** — boolean indicating whether the webhook is currently sending POST requests. Can be toggled via PUT without recreating the webhook.
- **`description`** — optional human-readable label for the webhook (useful when managing multiple webhooks).

### Creation Flow

1. You call POST `/webhooks/` or POST `/tokens/{token}/webhooks` with `callbackURL` and `idModel`
2. Trello immediately sends a HEAD request to `callbackURL`
3. If the HEAD request returns 200, the webhook is created and activated
4. If the HEAD request fails (non-200 or unreachable), the webhook is **NOT** created and the API returns an error

Two creation routes exist:
- **POST /webhooks/** — standard route, requires `key` + `token` as query params
- **POST /tokens/{token}/webhooks** — token-scoped route, token is in the path

Both produce identical webhook objects and behavior.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:webhooks-overview -->

<!-- SECTION:webhooks-crud | keywords: GET /webhooks,PUT /webhooks,DELETE /webhooks,/tokens/{token}/webhooks/{idWebhook},POST /webhooks,webhook CRUD | Webhook CRUD endpoints -->
## Webhook CRUD

Two parallel CRUD surfaces exist for managing webhooks. Both operate on the same underlying webhook objects.

### Via /webhooks/ (key+token in query)

#### POST /webhooks/ — Create a Webhook

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | No | A human-readable description for the webhook |
| `callbackURL` | string | **Yes** | A URL that starts with `https://`. Trello will send HEAD to verify, then POST for events |
| `idModel` | TrelloID | **Yes** | ID of the model to watch (board, card, list, member, or organization) |
| `active` | boolean | No | Whether the webhook is active. Defaults to `true` |

Returns the created webhook object.

#### GET /webhooks/{id} — Get a Webhook

Retrieve a webhook by its ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the webhook |

#### PUT /webhooks/{id} — Update a Webhook

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | No | Updated description |
| `callbackURL` | string | No | Updated callback URL (must be HTTPS) |
| `idModel` | TrelloID | No | Updated model ID to watch |
| `active` | boolean | No | Toggle webhook on/off |

#### DELETE /webhooks/{id} — Delete a Webhook

Remove a webhook by its ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the webhook to delete |

#### GET /webhooks/{id}/{field} — Get a Webhook field

Retrieve a specific field from a webhook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the webhook |
| `field` | string | Yes (path) | The field to retrieve (e.g., `active`, `callbackURL`, `description`, `idModel`) |

### Via /tokens/{token}/webhooks (token-scoped)

These endpoints scope webhook operations to a specific token.

#### GET /tokens/{token}/webhooks — List all webhooks for a token

Returns an array of all webhooks registered under the given token.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes (path) | The token string |

#### POST /tokens/{token}/webhooks — Create a webhook for a token

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | No | A human-readable description |
| `callbackURL` | string | **Yes** | HTTPS URL for receiving webhook POST requests |
| `idModel` | TrelloID | **Yes** | ID of the model to watch |

#### GET /tokens/{token}/webhooks/{idWebhook} — Get a specific webhook

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes (path) | The token string |
| `idWebhook` | TrelloID | Yes (path) | The ID of the webhook |

#### PUT /tokens/{token}/webhooks/{idWebhook} — Update a webhook

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes (path) | The token string |
| `idWebhook` | TrelloID | Yes (path) | The ID of the webhook |
| `description` | string | No | Updated description |
| `callbackURL` | string | No | Updated callback URL |
| `idModel` | TrelloID | No | Updated model ID |

#### DELETE /tokens/{token}/webhooks/{idWebhook} — Delete a webhook

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes (path) | The token string |
| `idWebhook` | TrelloID | Yes (path) | The ID of the webhook to delete |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/tokens-plugins.md#tokens-core -->
<!-- /SECTION:webhooks-crud -->

<!-- SECTION:webhooks-events | keywords: webhook events,action types,updateCard,createCard,addMemberToBoard,commentCard,deleteCard,moveCard | Webhook event types -->
## Webhook Event Types

When a change occurs on the watched model, Trello sends a POST to your `callbackURL` with an `action.type` field identifying the event. The `idModel` scope determines which events are delivered — a webhook on a board ID receives all card, list, and member changes within that board; a webhook on a card ID only receives changes to that specific card.

### Board Events

| Action Type | Description |
|-------------|-------------|
| `createBoard` | A new board was created |
| `updateBoard` | Board was updated (any field) |
| `deleteBoard` | Board was deleted |
| `updateBoard:closed` | Board was archived or unarchived |
| `updateBoard:name` | Board name changed |
| `updateBoard:desc` | Board description changed |
| `updateBoard:prefs` | Board preferences changed |
| `addMemberToBoard` | A member was added to the board |
| `removeMemberFromBoard` | A member was removed from the board |
| `makeAdminOfBoard` | A member was made admin |
| `makeNormalMemberOfBoard` | A member was changed to normal member |
| `addToOrganizationBoard` | Board was added to a workspace |
| `removeFromOrganizationBoard` | Board was removed from a workspace |

### Card Events

| Action Type | Description |
|-------------|-------------|
| `createCard` | A new card was created |
| `updateCard` | Card was updated (any field) |
| `deleteCard` | Card was deleted |
| `copyCard` | Card was copied |
| `moveCardFromBoard` | Card was moved away from the watched board |
| `moveCardToBoard` | Card was moved to the watched board |
| `updateCard:closed` | Card was archived or unarchived |
| `updateCard:due` | Card due date changed |
| `updateCard:idList` | Card was moved to a different list |
| `updateCard:desc` | Card description changed |
| `updateCard:name` | Card name changed |
| `updateCard:pos` | Card position changed within a list |
| `addAttachmentToCard` | Attachment was added to a card |
| `deleteAttachmentFromCard` | Attachment was removed from a card |
| `addMemberToCard` | A member was assigned to a card |
| `removeMemberFromCard` | A member was unassigned from a card |
| `commentCard` | A comment was added to a card |
| `updateComment` | A comment was edited |
| `deleteComment` | A comment was deleted |
| `addChecklistToCard` | A checklist was added to a card |
| `removeChecklistFromCard` | A checklist was removed from a card |
| `updateCheckItemStateOnCard` | A checklist item was checked or unchecked |
| `convertToCardFromCheckItem` | A checklist item was converted to a card |
| `addLabelToCard` | A label was added to a card |
| `removeLabelFromCard` | A label was removed from a card |

### List Events

| Action Type | Description |
|-------------|-------------|
| `createList` | A new list was created |
| `updateList` | List was updated (any field) |
| `updateList:closed` | List was archived or unarchived |
| `updateList:name` | List name changed |
| `updateList:pos` | List position changed |
| `moveListFromBoard` | List was moved away from the watched board |
| `moveListToBoard` | List was moved to the watched board |

### Checklist Events

| Action Type | Description |
|-------------|-------------|
| `addChecklistToCard` | Checklist added to a card |
| `removeChecklistFromCard` | Checklist removed from a card |
| `updateCheckItemStateOnCard` | Checklist item checked/unchecked |
| `createCheckItem` | A new checklist item was created |
| `deleteCheckItem` | A checklist item was deleted |
| `updateCheckItem` | A checklist item was updated |

### Member Events

| Action Type | Description |
|-------------|-------------|
| `addMemberToBoard` | Member added to a board |
| `removeMemberFromBoard` | Member removed from a board |
| `makeAdminOfBoard` | Member promoted to board admin |
| `makeNormalMemberOfBoard` | Member demoted to normal board member |

### Organization Events

| Action Type | Description |
|-------------|-------------|
| `createOrganization` | A new workspace was created |
| `updateOrganization` | Workspace was updated |
| `addMemberToOrganization` | A member was added to the workspace |
| `removeMemberFromOrganization` | A member was removed from the workspace |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:webhooks-events -->

<!-- SECTION:webhooks-payload | keywords: payload,action,model,webhook payload,type,data,display,memberCreator | Webhook payload structure -->
## Webhook Payload

When a webhook fires, Trello sends an HTTP POST to your `callbackURL` with `Content-Type: application/json`. The payload contains two top-level keys: `action` (what happened) and `model` (current state of the watched object).

### Payload Structure

```json
{
  "action": {
    "id": "action-id",
    "idMemberCreator": "member-id",
    "type": "updateCard",
    "date": "2024-01-15T10:30:00.000Z",
    "data": {
      "board": { "id": "...", "name": "...", "shortLink": "..." },
      "card": { "id": "...", "name": "...", "idShort": 42, "shortLink": "..." },
      "old": { "name": "Old Name" },
      "listBefore": { "id": "...", "name": "To Do" },
      "listAfter": { "id": "...", "name": "Done" }
    },
    "display": {
      "translationKey": "action_move_card_from_list_to_list",
      "entities": {}
    },
    "memberCreator": {
      "id": "...",
      "username": "...",
      "fullName": "...",
      "avatarHash": "..."
    }
  },
  "model": {
    // Full current state of the watched model (board, card, list, etc.)
  }
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `action.id` | Unique ID of the action. Use for idempotency checks |
| `action.type` | String matching an event type (see webhooks-events) |
| `action.date` | ISO 8601 timestamp of when the action occurred |
| `action.data` | Varies by type. Contains IDs and names of affected objects. The `old` key holds previous values for update actions |
| `action.data.board` | Board context (always present for board-level webhooks) |
| `action.data.card` | Card context (present for card-related actions) |
| `action.data.old` | Previous values for fields that changed (only on update actions) |
| `action.data.listBefore` / `action.data.listAfter` | Present when a card moves between lists |
| `action.display` | Translation key and entities for rendering a human-readable description |
| `action.memberCreator` | The member who triggered the action |
| `action.idMemberCreator` | ID of the member who triggered the action |
| `model` | Full current state of the `idModel` object after the action |

### Example: commentCard

```json
{
  "action": {
    "id": "abc123",
    "idMemberCreator": "member-id",
    "type": "commentCard",
    "date": "2024-01-15T12:00:00.000Z",
    "data": {
      "text": "The comment text",
      "card": { "id": "...", "name": "My Card", "shortLink": "..." },
      "board": { "id": "...", "name": "My Board" },
      "list": { "id": "...", "name": "In Progress" }
    },
    "memberCreator": {
      "id": "...",
      "username": "johndoe",
      "fullName": "John Doe"
    }
  },
  "model": {
    "id": "board-id",
    "name": "My Board",
    "desc": "",
    "closed": false
  }
}
```

### Notes

- Your endpoint must return HTTP `200` within 30 seconds, or Trello treats the delivery as failed
- Trello retries failed deliveries, but after repeated failures the webhook may be deactivated (`active` set to `false`)
- The `model` object can be large (it is the full board/card/list state). Plan your payload parsing accordingly

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:webhooks-payload -->

<!-- SECTION:webhooks-hmac | keywords: HMAC,SHA1,X-Trello-Webhook,signature,validation,secret,verify,security | HMAC signature validation -->
## HMAC Signature Validation

Trello signs every webhook POST with HMAC-SHA1 so you can verify the request is genuinely from Trello.

### How It Works

1. **The secret is the API key** (NOT the token) — this is a common source of confusion
2. Trello computes HMAC-SHA1 over the message `requestBody + callbackURL` (concatenated as raw strings)
3. The signature is base64-encoded and sent in the `X-Trello-Webhook` HTTP header
4. Your server must compute the same HMAC and compare

### Verification Steps

1. Read the raw request body as a string (do NOT parse as JSON first)
2. Concatenate: `rawBody + callbackURL` (the exact URL you registered)
3. Compute HMAC-SHA1 using your API key as the secret
4. Base64-encode the digest
5. Compare to the value in the `X-Trello-Webhook` header

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyTrelloWebhook(request, apiKey, callbackURL) {
  const base64Digest = crypto
    .createHmac('sha1', apiKey)
    .update(request.body + callbackURL)
    .digest('base64');
  return base64Digest === request.headers['x-trello-webhook'];
}
```

### Python Example

```python
import hmac, hashlib, base64

def verify_trello_webhook(body: str, api_key: str, callback_url: str, header_signature: str) -> bool:
    computed = base64.b64encode(
        hmac.new(api_key.encode(), (body + callback_url).encode(), hashlib.sha1).digest()
    ).decode()
    return hmac.compare_digest(computed, header_signature)
```

### Important Notes

- `request.body` must be the **raw string body**, not parsed JSON. If your framework auto-parses JSON, use a raw body middleware
- `callbackURL` must match **exactly** what was used when creating the webhook (including trailing slashes)
- Trello's signature does **not** include a timestamp — implement your own idempotency using `action.id` to prevent replay processing
- HEAD requests sent during webhook creation verification do **not** carry a signature — simply return HTTP 200
- Use constant-time comparison (e.g., `crypto.timingSafeEqual` in Node.js, `hmac.compare_digest` in Python) to prevent timing attacks

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:webhooks-hmac -->
