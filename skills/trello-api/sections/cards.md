<!-- SECTION:cards-core | keywords: cards,idCard,idList,due,pos,closed,cover,cardRole | Card CRUD and retrieval -->
## Card CRUD

### POST /cards — Create a new Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | The name for the card. |
| `desc` | string | No | The description for the card. |
| `pos` | string | No | The position of the new card. `top`, `bottom`, or a positive float. |
| `due` | string | No | A due date for the card. |
| `start` | string | No | The start date of a card, or `null`. |
| `dueComplete` | boolean | No | Whether the due date status is complete. |
| `idList` | string | **Yes** | The ID of the list the card should be created in. |
| `idMembers` | array | No | Comma-separated list of member IDs to add to the card. |
| `idLabels` | array | No | Comma-separated list of label IDs to add to the card. |
| `urlSource` | string | No | A URL starting with `http://` or `https://`. Attached to the card upon creation. |
| `fileSource` | string | No | File to attach upon creation. |
| `mimeType` | string | No | The mimeType of the attachment. Max length 256. |
| `idCardSource` | string | No | The ID of a card to copy into the new card. |
| `keepFromSource` | string | No | Properties to copy when using `idCardSource`. `all` or comma-separated list of: `attachments,checklists,customFields,comments,due,start,labels,members,stickers`. |
| `address` | string | No | For use with/by the Map View. |
| `locationName` | string | No | For use with/by the Map View. |
| `coordinates` | string | No | For use with/by the Map View. Format: `latitude,longitude`. |
| `cardRole` | string | No | Display cards differently based on the card name. Values: `board` (name must be a link to a Trello board), `mirror` (name must be a link to a Trello card), `link` (name must be a URL), `separator`. |

### GET /cards/{id} — Get a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of card fields. Defaults: `badges,checkItemStates,closed,dateLastActivity,desc,descData,due,dueComplete,idAttachmentCover,idBoard,idChecklists,idLabels,idList,idMembers,idMembersVoted,idShort,labels,manualCoverAttachment,name,pos,shortLink,shortUrl,start,subscribed,url`. |
| `actions` | string | No | Actions nested resource filter. |
| `attachments` | string | No | `true`, `false`, or `cover`. |
| `attachment_fields` | string | No | `all` or comma-separated list of attachment fields. |
| `members` | boolean | No | Whether to return member objects for members on the card. |
| `member_fields` | string | No | `all` or comma-separated list of member fields. Defaults: `avatarHash,fullName,initials,username`. |
| `membersVoted` | boolean | No | Whether to return member objects for members who voted on the card. |
| `memberVoted_fields` | string | No | `all` or comma-separated list of member fields. |
| `checkItemStates` | boolean | No | Whether to include check item states. |
| `checklists` | string | No | `all` or `none`. |
| `checklist_fields` | string | No | `all` or comma-separated list of: `idBoard,idCard,name,pos`. |
| `board` | boolean | No | Whether to return the board object the card is on. |
| `board_fields` | string | No | `all` or comma-separated list of board fields. |
| `list` | boolean | No | Whether to include the list nested resource. |
| `pluginData` | boolean | No | Whether to include pluginData on the card. |
| `stickers` | boolean | No | Whether to include sticker models. |
| `sticker_fields` | string | No | `all` or comma-separated list of sticker fields. |
| `customFieldItems` | boolean | No | Whether to include the customFieldItems. |

### PUT /cards/{id} — Update a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | The new name for the card. |
| `desc` | string | No | The new description for the card. |
| `closed` | boolean | No | Whether the card should be archived (`true`) or unarchived (`false`). |
| `idMembers` | string | No | Comma-separated list of member IDs. |
| `idAttachmentCover` | string | No | The ID of the image attachment to use as the cover, or `null` for none. |
| `idList` | string | No | The ID of the list the card should be in. |
| `idLabels` | string | No | Comma-separated list of label IDs. |
| `idBoard` | string | No | The ID of the board the card should be on. |
| `pos` | string | No | The position. `top`, `bottom`, or a positive float. |
| `due` | string | No | When the card is due, or `null`. |
| `start` | string | No | The start date of a card, or `null`. |
| `dueComplete` | boolean | No | Whether the due date status is complete. |
| `subscribed` | boolean | No | Whether the member should be subscribed to the card. |
| `address` | string | No | For use with/by the Map View. |
| `locationName` | string | No | For use with/by the Map View. |
| `coordinates` | string | No | For use with/by the Map View. Format: `latitude,longitude`. |
| `cover` | object | No | Updates the card's cover. Options: `color` (`pink`, `yellow`, `lime`, `blue`, `black`, `orange`, `red`, `purple`, `sky`, `green`), `brightness` (`dark`, `light`), `url` (image URL), `idAttachment`, `size` (`normal`, `full`). |

### DELETE /cards/{id} — Delete a Card

Permanently deletes a card. Requires the card `id` (string) as a path parameter.

### GET /cards/{id}/{field} — Get a field on a Card

Returns the value of a single field. The `field` path parameter specifies which field to return.

### GET /cards/{id}/board — Get the Board a Card is on

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of board fields. |

### GET /cards/{id}/list — Get the List of a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of list fields. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:cards-core -->

<!-- SECTION:cards-attachments | keywords: attachments,idAttachment,urlSource,fileSource,setCover,mimeType | Card attachment management -->
## Card Attachments

### GET /cards/{id}/attachments — Get Attachments on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of attachment fields. |
| `filter` | string | No | Use `cover` to restrict to just the cover attachment. |

### POST /cards/{id}/attachments — Create Attachment on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | The name of the attachment. Max length 256. |
| `file` | string | No | The file to attach, as multipart/form-data. |
| `mimeType` | string | No | The mimeType of the attachment. Max length 256. |
| `url` | string | No | A URL to attach. Must start with `http://` or `https://`. |
| `setCover` | boolean | No | Whether to use the new attachment as the card's cover. |

### GET /cards/{id}/attachments/{idAttachment} — Get an Attachment on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | array | No | The attachment fields to include in the response. |

### DELETE /cards/{id}/attachments/{idAttachment} — Delete an Attachment on a Card

Permanently removes an attachment. Requires `id` (card ID) and `idAttachment` (attachment ID) as path parameters.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:cards-attachments -->

<!-- SECTION:cards-checklists | keywords: checklists,checkItems,idChecklist,idCheckItem,checkItemStates | Card checklist and check item management -->
## Card Checklists

### GET /cards/{id}/checklists — Get Checklists on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `checkItems` | string | No | `all` or `none`. |
| `checkItem_fields` | string | No | `all` or comma-separated list of: `name,nameData,pos,state,type,due,dueReminder,idMember`. |
| `filter` | string | No | `all` or `none`. |
| `fields` | string | No | `all` or comma-separated list of: `idBoard,idCard,name,pos`. |

### POST /cards/{id}/checklists — Create Checklist on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | The name of the checklist. |
| `idChecklistSource` | string | No | The ID of a source checklist to copy into the new one. |
| `pos` | string | No | Position on the card. One of: `top`, `bottom`, or a positive number. |

### DELETE /cards/{id}/checklists/{idChecklist} — Delete a Checklist on a Card

Removes a checklist from the card. Requires `id` (card ID) and `idChecklist` (checklist ID) as path parameters.

### GET /cards/{id}/checkItemStates — Get checkItem States on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of: `idCheckItem`, `state`. |

### GET /cards/{id}/checkItem/{idCheckItem} — Get a checkItem on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of: `name,nameData,pos,state,type,due,dueReminder,idMember`. |

### PUT /cards/{id}/checkItem/{idCheckItem} — Update a checkItem on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | The new name for the checklist item. |
| `state` | string | No | One of: `complete`, `incomplete`. |
| `idChecklist` | string | No | The ID of the checklist this item is in. |
| `pos` | string | No | `top`, `bottom`, or a positive float. |
| `due` | string | No | A due date for the checkitem. |
| `dueReminder` | number | No | A dueReminder for the due date on the checkitem. |
| `idMember` | string | No | The ID of the member to assign to the checkitem. |

### DELETE /cards/{id}/checkItem/{idCheckItem} — Delete a checkItem on a Card

Removes a check item from its checklist. Requires `id` (card ID) and `idCheckItem` (check item ID) as path parameters.

### PUT /cards/{idCard}/checklist/{idChecklist}/checkItem/{idCheckItem} — Update checkItem on Checklist on Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idCard` | string | **Yes** | The ID of the Card. |
| `idChecklist` | string | **Yes** | The ID of the checklist. |
| `idCheckItem` | string | **Yes** | The ID of the checklist item to update. |
| `pos` | string | No | `top`, `bottom`, or a positive float. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/checklists.md#checklists-core -->
<!-- /SECTION:cards-checklists -->

<!-- SECTION:cards-labels-members | keywords: idLabels,idMembers,membersVoted,customFieldItems | Card label, member, and custom field management -->
## Card Labels, Members, and Custom Fields

### POST /cards/{id}/idLabels — Add a Label to a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | No | The ID of the label to add. |

### DELETE /cards/{id}/idLabels/{idLabel} — Remove a Label from a Card

Removes an existing label from the card. Requires `id` (card ID) and `idLabel` (label ID) as path parameters.

### POST /cards/{id}/labels — Create a new Label on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `color` | string | **Yes** | A valid label color or `null`. Values: `yellow`, `purple`, `blue`, `red`, `green`, `orange`, `black`, `sky`, `pink`, `lime`. |
| `name` | string | No | A name for the label. |

### GET /cards/{id}/members — Get the Members of a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of member fields. |

### POST /cards/{id}/idMembers — Add a Member to a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | No | The ID of the Member to add to the card. |

### DELETE /cards/{id}/idMembers/{idMember} — Remove a Member from a Card

Removes a member from the card. Requires `id` (card ID) and `idMember` (member ID) as path parameters.

### GET /cards/{id}/membersVoted — Get Members who have voted on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of member fields. |

### POST /cards/{id}/membersVoted — Add Member vote to Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | string | **Yes** | The ID of the member to vote 'yes' on the card. |

### DELETE /cards/{id}/membersVoted/{idMember} — Remove a Member's Vote on a Card

Removes a member's vote. Requires `id` (card ID) and `idMember` (member ID) as path parameters.

### GET /cards/{id}/customFieldItems — Get Custom Field Items for a Card

Returns all custom field items on the card. Requires the card `id` as a path parameter.

### PUT /cards/{idCard}/customField/{idCustomField}/item — Update Custom Field item on Card

Sets or updates a single custom field value on a card.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idCard` | string | **Yes** | ID of the card to set/update the custom field value for. |
| `idCustomField` | string | **Yes** | ID of the Custom Field on the card. |

The request body contains the value object matching the custom field type (text, number, date, checkbox, or list).

### PUT /cards/{idCard}/customFields — Update Multiple Custom Field items on Card

Sets multiple custom field values in a single request.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `customFieldItems` | array (body) | No | An array of objects containing the custom field ID, key and value, and ID of list type option. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/metadata.md#labels-core -->
<!-- /SECTION:cards-labels-members -->

<!-- SECTION:cards-stickers-comments | keywords: stickers,comments,idSticker,image,zIndex,rotate,text | Card stickers, comments, and plugin data -->
## Card Stickers, Comments, and Plugin Data

### GET /cards/{id}/stickers — Get Stickers on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of sticker fields. |

### POST /cards/{id}/stickers — Add a Sticker to a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | string | **Yes** | For custom stickers, the id of the sticker. For default stickers, the string identifier (e.g. `taco-cool`). |
| `top` | number | **Yes** | The top position of the sticker, from -60 to 100. |
| `left` | number | **Yes** | The left position of the sticker, from -60 to 100. |
| `zIndex` | integer | **Yes** | The z-index of the sticker. |
| `rotate` | number | No | The rotation of the sticker in degrees. |

### GET /cards/{id}/stickers/{idSticker} — Get a Sticker on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | `all` or comma-separated list of sticker fields. |

### PUT /cards/{id}/stickers/{idSticker} — Update a Sticker on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `top` | number | **Yes** | The top position of the sticker, from -60 to 100. |
| `left` | number | **Yes** | The left position of the sticker, from -60 to 100. |
| `zIndex` | integer | **Yes** | The z-index of the sticker. |
| `rotate` | number | No | The rotation of the sticker in degrees. |

### DELETE /cards/{id}/stickers/{idSticker} — Delete a Sticker on a Card

Removes a sticker from the card. Requires `id` (card ID) and `idSticker` (sticker ID) as path parameters.

### GET /cards/{id}/actions — Get Actions on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | A comma-separated list of action types to filter by. |
| `page` | number | No | The page of results for actions. Each page has 50 actions. |

### POST /cards/{id}/actions/comments — Add a new comment to a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | **Yes** | The comment text. |

### PUT /cards/{id}/actions/{idAction}/comments — Update Comment Action on a Card

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | **Yes** | The new text for the comment. |

### DELETE /cards/{id}/actions/{idAction}/comments — Delete a comment on a Card

Deletes a comment action. Requires `id` (card ID) and `idAction` (action ID) as path parameters.

### POST /cards/{id}/markAssociatedNotificationsRead — Mark Notifications as read

Marks all notifications associated with the card as read. Requires the card `id` as a path parameter.

### GET /cards/{id}/pluginData — Get pluginData on a Card

Returns pluginData for the card. Requires the card `id` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:cards-stickers-comments -->
