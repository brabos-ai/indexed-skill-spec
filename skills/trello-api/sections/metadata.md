<!-- SECTION:labels-core | keywords: labels,idLabel,color,idBoard,/labels/{id},POST /labels,DELETE /labels | Label CRUD -->
## Labels

Labels are colored tags attached to cards for visual categorization. Labels are defined at the board level.

### POST /labels — Create a label

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name for the label |
| `color` | Color | Yes | The color for the label (see color enum below) |
| `idBoard` | string | Yes | The ID of the Board to create the Label on |

### GET /labels/{id} — Get a label

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | TrelloID | Yes (path) | — | The ID of the Label |
| `fields` | string | No | `all` | `all` or comma-separated list of label fields |

### PUT /labels/{id} — Update a label

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the Label |
| `name` | string | No | The new name for the label |
| `color` | Color | No | The new color for the label |

### DELETE /labels/{id} — Delete a label

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | The ID of the Label |

### PUT /labels/{id}/{field} — Update a single field

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes (path) | The ID of the label |
| `field` | string | Yes (path) | The field to update: `color` or `name` |
| `value` | string | Yes | The new value for the field |

### Color enum

Valid label colors: `yellow`, `purple`, `blue`, `red`, `green`, `orange`, `black`, `sky`, `pink`, `lime`, `null` (no color / colorless label).

> **Note:** Boards also support label creation via `POST /boards/{id}/labels` — see the boards section.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:labels-core -->

<!-- SECTION:customfields-core | keywords: customFields,idCustomField,type,display,fieldGroup,checkbox,list | Custom Field definitions -->
## Custom Fields

Custom Fields allow boards to define additional structured data on cards. Fields are defined at the board level; values are set per card.

### POST /customFields — Create a Custom Field

Request body (JSON):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `idModel` | TrelloID | Yes | The ID of the board to define the field on |
| `modelType` | string | Yes | Always `"board"` |
| `name` | string | Yes | The name of the Custom Field |
| `type` | string | Yes | Field type: `text`, `number`, `date`, `checkbox`, or `list` |
| `options` | string | No | Used when type is `checkbox` |
| `pos` | string or number | Yes | Position of the field (`top`, `bottom`, or a positive number) |
| `display_cardFront` | boolean | No | Whether to show this field on the front of cards. Default: `true` |

Returns a `CustomField` object.

### GET /customFields/{id} — Get a Custom Field

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | ID of the Custom Field |

Returns a `CustomField` object.

### PUT /customFields/{id} — Update a Custom Field definition

Request body (JSON):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | No | The name of the Custom Field |
| `pos` | string or number | No | Position of the field |
| `display/cardFront` | boolean | No | Whether to display this field on the front of cards |

Returns a `CustomField` object.

### DELETE /customFields/{id} — Delete a Custom Field

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | ID of the Custom Field |

Permanently removes the Custom Field definition and all values set on cards.

### Setting values on cards

- **Single field:** `PUT /cards/{idCard}/customField/{idCustomField}/item`
- **Bulk update:** `PUT /cards/{idCard}/customFields`

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:customfields-core -->

<!-- SECTION:customfields-options | keywords: customFieldOption,idCustomFieldOption,options,dropdown,list type | Custom Field dropdown options -->
## Custom Field Options (type=list)

For Custom Fields of type `list`, you manage dropdown options via these endpoints.

### GET /customFields/{id}/options — Get all options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | ID of the Custom Field (must be type `list`) |

Returns an array of option objects.

### POST /customFields/{id}/options — Add an option

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | ID of the Custom Field |

Request body (JSON):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | object | Yes | Object with `text` property: `{ "text": "Option Label" }` |
| `color` | string | No | Color for the option (same enum as labels) |
| `pos` | string or number | No | Position: `top`, `bottom`, or a positive number |

### GET /customFields/{id}/options/{idCustomFieldOption} — Get a specific option

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | ID of the Custom Field |
| `idCustomFieldOption` | TrelloID | Yes (path) | ID of the option to retrieve |

### DELETE /customFields/{id}/options/{idCustomFieldOption} — Delete an option

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | TrelloID | Yes (path) | ID of the Custom Field |
| `idCustomFieldOption` | TrelloID | Yes (path) | ID of the option to delete |

### Setting a list value on a card

```
PUT /cards/{idCard}/customField/{idCustomField}/item
Content-Type: application/json

{
  "idValue": "{idCustomFieldOption}"
}
```

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:customfields-options -->

<!-- SECTION:batch-emoji | keywords: batch,urls,emoji,locale,spritesheets,compliance | Batch requests, emoji, and application compliance -->
## Utility Endpoints

### GET /batch — Batch requests

Combine up to 10 GET requests into a single API call. Useful for reducing rate limit consumption.

```
GET https://api.trello.com/1/batch?urls={urls}&key={key}&token={token}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `urls` | string | Yes | Comma-separated list of API routes (max 10). Routes begin with `/` and exclude the API version. Example: `urls=/members/trello,/cards/{cardId}` |

#### Response

Returns an array of response objects, one per requested URL:

```json
[
  { "200": { /* response body for first URL */ } },
  { "200": { /* response body for second URL */ } },
  { "statusCode": 404 }
]
```

Each element has either a `200` key with the response body, or a `statusCode` key indicating the error.

#### Example

```
GET /batch?urls=/boards/abc123,/boards/abc123/lists,/boards/abc123/members&key=...&token=...
```

### GET /emoji — Emoji catalog

List all available Trello emoji.

```
GET https://api.trello.com/1/emoji?key={key}&token={token}
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `locale` | string | No | member's locale | Locale for emoji descriptions and names |
| `spritesheets` | boolean | No | `false` | `true` to include spritesheet URLs in the response |

Returns an `Emoji` object catalog.

> **Note:** This endpoint does not require authentication (no security requirement in spec), but including key/token is standard practice.

### GET /applications/{key}/compliance — Application compliance

Retrieve compliance data for your application.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | string | Yes (path) | Your application's API key |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:batch-emoji -->
