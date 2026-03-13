<!-- SECTION:tokens-core | keywords: tokens,token,fields,webhooks,/tokens/{token},DELETE /tokens/{token},revoke,introspection | Token management -->
## Tokens

Tokens represent authorization grants. Use these endpoints to inspect token metadata and revoke tokens.

### GET /tokens/{token} — Get token info

Retrieve information about a token, including its permissions and expiration.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `token` | string | Yes (path) | — | The token string |
| `fields` | string | No | `all` | `all` or comma-separated list of: `dateCreated`, `dateExpires`, `idMember`, `identifier`, `permissions` |
| `webhooks` | boolean | No | `false` | Whether to include webhooks registered on this token |

Returns a `Token` object:

```json
{
  "id": "...",
  "identifier": "My App Token",
  "idMember": "...",
  "dateCreated": "2025-01-15T10:30:00.000Z",
  "dateExpires": null,
  "permissions": [
    {
      "idModel": "*",
      "modelType": "Member",
      "read": true,
      "write": true
    }
  ]
}
```

### GET /tokens/{token}/member — Get token's member

Retrieve the member (user) the token was issued for.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `token` | string | Yes (path) | — | The token string |
| `fields` | string | No | `all` | `all` or comma-separated list of valid Member fields |

Returns a `Member` object.

### DELETE /tokens/{token}/ — Revoke a token

Permanently revokes the token. All webhooks registered under this token will also be removed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes (path) | The token string to revoke |

> **Note:** Webhook CRUD on tokens (GET/POST/PUT/DELETE `/tokens/{token}/webhooks`) is documented in the webhooks section.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/webhooks.md#webhooks-crud -->
<!-- /SECTION:tokens-core -->

<!-- SECTION:plugins-core | keywords: plugins,idPlugin,listing,compliance,memberPrivacy,/plugins/{id},Power-Up | Power-Up (plugin) metadata -->
## Plugins (Power-Ups)

Manage Power-Up metadata, listings, and compliance information.

### GET /plugins/{id}/ — Get a plugin

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the Power-Up |

Returns a `Plugin` object.

### PUT /plugins/{id}/ — Update a plugin

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the Power-Up |

Returns the updated `Plugin` object.

### POST /plugins/{idPlugin}/listing — Create a listing

Create a new locale-specific listing for your Power-Up.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idPlugin` | TrelloID | Yes (path) | The ID of the Power-Up |

Request body (JSON):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `description` | string | No | The description to show for the given locale |
| `locale` | string | No | The locale this listing should be displayed for |
| `overview` | string | No | The overview to show for the given locale |
| `name` | string | No | The name to use for the given locale |

Returns a `PluginListing` object.

### PUT /plugins/{idPlugin}/listings/{idListing} — Update a listing

Update an existing locale-specific listing for your Power-Up.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `idPlugin` | TrelloID | Yes (path) | The ID of the Power-Up |
| `idListing` | TrelloID | Yes (path) | The ID of the existing listing to update |

Request body (JSON):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `description` | string | No | The description to show for the given locale |
| `locale` | string | No | The locale this listing should be displayed for |
| `overview` | string | No | The overview to show for the given locale |
| `name` | string | No | The name to use for the given locale |

Returns a `PluginListing` object.

### GET /plugins/{id}/compliance/memberPrivacy — Member privacy compliance

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the Power-Up |

Returns compliance data related to member privacy for the Power-Up.

> **Note:** To enable a Power-Up on a board, use `POST /boards/{id}/boardPlugins` — see the boards section.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:plugins-core -->
