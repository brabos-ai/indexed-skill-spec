<!-- SECTION:auth-overview | keywords: auth,apiKey,APIKey,APIToken,key,token,authentication,credentials | How Trello authentication works -->
## Authentication Overview

Every Trello API request requires two query parameters:

| Parameter | Purpose | How to obtain |
|-----------|---------|---------------|
| `key` | Identifies your application (API key) | Generate at [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin) |
| `token` | Authorizes access to a user's data | User grants via OAuth flow; can be scoped (read/write) and set to expire (1hour, 1day, 30days, never) |

Both parameters are **required** on every API call and must be passed as **query parameters** (never in the request body or headers).

### Example request

```
GET https://api.trello.com/1/boards/{id}?key=YOUR_KEY&token=YOUR_TOKEN
```

### OAuth token grant flow

To obtain a token programmatically, redirect the user to the Trello authorize URL:

```
https://trello.com/1/authorize?expiration={expiration}&name={appName}&scope={scope}&response_type=token&key={apiKey}&callback_method=fragment&return_url={returnUrl}
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `key` | Yes | Your API key |
| `name` | No | Application name shown to the user |
| `expiration` | No | `1hour`, `1day`, `30days`, or `never`. Default: `30days` |
| `scope` | No | `read`, `write`, or `read,write`. Default: `read,write` |
| `response_type` | Yes | Always `token` |
| `callback_method` | No | `fragment` (token in URL hash) or `postMessage` |
| `return_url` | No | URL to redirect to after authorization |

The user approves access, and the token is returned via the chosen callback method. Store it securely — this is the `token` query parameter for all API calls.

### Security considerations

- **API keys** identify your application but do not grant data access on their own.
- **Tokens** grant user-level access to Trello data. Never share tokens publicly.
- Tokens can be scoped to `read` or `read,write` permissions.
- Tokens have configurable expiration: `1hour`, `1day`, `30days`, or `never`.
- Revoke tokens via `DELETE /tokens/{token}/` when no longer needed.
<!-- /SECTION:auth-overview -->

<!-- SECTION:auth-url | keywords: base URL,https://api.trello.com/1,URL construction,endpoint,route | Base URL and endpoint construction -->
## URL Construction

### Base URL

```
https://api.trello.com/1
```

### Pattern

```
{base}/{resource}/{id}?key={key}&token={token}
```

- Resources use their **plural form**: `boards`, `cards`, `lists`, `members`, `organizations`, `actions`, `notifications`, `webhooks`, `tokens`, `labels`, `customFields`, `checklists`, `enterprises`, `search`.
- Nested resources follow the pattern: `{base}/{resource}/{id}/{subresource}`

### Examples

**GET a board:**

```
GET https://api.trello.com/1/boards/5a1b2c3d?key=abc&token=xyz
```

**Create a card (POST with query params):**

```
POST https://api.trello.com/1/cards?idList=5a1b2c3d&name=My+Card&key=abc&token=xyz
```

**Get cards on a list (nested resource):**

```
GET https://api.trello.com/1/lists/5a1b2c3d/cards?key=abc&token=xyz
```

**Update a board field directly:**

```
PUT https://api.trello.com/1/boards/5a1b2c3d/name?value=New+Name&key=abc&token=xyz
```
<!-- /SECTION:auth-url -->

<!-- SECTION:auth-rate-limits | keywords: rate limit,429,Retry-After,throttle,rate limiting,backoff | Rate limiting -->
## Rate Limits

Trello enforces two rate limit windows:

| Scope | Limit | Window |
|-------|-------|--------|
| Per API **token** | 100 requests | 10 seconds |
| Per API **key** (across all tokens) | 300 requests | 10 seconds |

### When limits are exceeded

- The API returns **HTTP 429 Too Many Requests**.
- Check the `Retry-After` response header for the number of seconds to wait before retrying.

### Recommended strategy

1. **Implement exponential backoff** — on 429, wait `Retry-After` seconds, then double the delay on consecutive failures.
2. **Batch requests** — use `GET /batch` to combine up to 10 GET requests into a single API call (see batch-emoji section).
3. **Use field projection** — add `fields=name,idBoard` to reduce payload size and processing time.
4. **Cache responses** — store board/list structures that change infrequently.
<!-- /SECTION:auth-rate-limits -->

<!-- SECTION:auth-pagination | keywords: pagination,fields,filter,limit,page,before,since | Cross-cutting query parameters -->
## Cross-Cutting Query Parameters

These parameters appear across many Trello API endpoints. They control field projection, filtering, and pagination.

### Parameter reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `fields` | string | Comma-separated field projection (e.g., `fields=name,idBoard,closed`). Reduces response payload. Each resource type has its own valid field set. Use `all` for all fields. |
| `filter` | string | Subset filter. Common values: `open`, `closed`, `all`, `mine`, `none`. Resource-specific. |
| `limit` | integer | Maximum number of records returned (e.g., `limit=50`). Default varies by resource. |
| `page` | integer | Zero-based page number for offset pagination. Used by search and action endpoints. |
| `before` | string | ISO 8601 date string. Returns records created before this date. Cursor-based pagination for actions and notifications. |
| `since` | string | ISO 8601 date string. Returns records created since this date. Cursor-based pagination for actions and notifications. |
| `partial` | boolean | Enables prefix matching in search. When `true`, searching "dev" matches "Development". Default `false`. |

### Applicability by resource

| Param | boards | cards | lists | members | actions | notifications | search |
|-------|--------|-------|-------|---------|---------|---------------|--------|
| fields | Yes | Yes | Yes | Yes | Yes | Yes | Yes (per model) |
| filter | Yes | Yes | Yes | - | Yes | Yes | - |
| limit | - | - | - | - | Yes | Yes | Yes (per model) |
| page | - | - | - | - | Yes | Yes | Yes (cards only) |
| before/since | - | - | - | - | Yes | Yes | - |

### Usage examples

**Field projection:**

```
GET /boards/{id}?fields=name,closed,idOrganization&key=...&token=...
```

**Filtering:**

```
GET /boards/{id}/cards?filter=open&key=...&token=...
```

**Paginated actions:**

```
GET /boards/{id}/actions?limit=50&before=2025-01-01T00:00:00Z&key=...&token=...
```

**Search with pagination:**

```
GET /search?query=bug&cards_limit=25&cards_page=2&partial=true&key=...&token=...
```
<!-- /SECTION:auth-pagination -->
