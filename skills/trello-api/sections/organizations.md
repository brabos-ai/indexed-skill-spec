<!-- SECTION:orgs-core | keywords: organizations,idOrganization,displayName,name,desc,permissionLevel | Organization CRUD, boards, actions, plugins, logo, tags, and preferences -->
## Organization CRUD and Resources

### POST /organizations — Create an Organization

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | string | **Yes** | The name to display for the Organization. |
| `desc` | string | No | The description for the organization. |
| `name` | string | No | A string with at least 3 characters. Only lowercase letters, underscores, and numbers are allowed. |
| `website` | string | No | A URL starting with `http://` or `https://`. |

### GET /organizations/{id} — Get an Organization

Retrieves an organization by its ID or name. The `id` path parameter is required.

### PUT /organizations/{id} — Update an Organization

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | A new name. At least 3 lowercase letters, underscores, and numbers. Must be unique. |
| `displayName` | string | No | A new display name. At least 1 character, not beginning or ending with a space. |
| `desc` | string | No | A new description for the organization. |
| `website` | string | No | A URL starting with `http://`, `https://`, or `null`. |
| `prefs/associatedDomain` | string | No | The Google Apps domain to link this org to. |
| `prefs/externalMembersDisabled` | boolean | No | Whether non-workspace members can be added to boards inside the Workspace. |
| `prefs/googleAppsVersion` | integer | No | `1` or `2`. |
| `prefs/boardVisibilityRestrict/org` | string | No | Who can make Workspace visible boards. One of: `admin`, `none`, `org`. |
| `prefs/boardVisibilityRestrict/private` | string | No | Who can make private boards. One of: `admin`, `none`, `org`. |
| `prefs/boardVisibilityRestrict/public` | string | No | Who can make public boards. One of: `admin`, `none`, `org`. |
| `prefs/orgInviteRestrict` | string | No | An email address with optional wildcard characters (e.g. `subdomain.*.trello.com`). |
| `prefs/permissionLevel` | string | No | Whether the Workspace page is publicly visible. One of: `private`, `public`. |

### DELETE /organizations/{id} — Delete an Organization

Permanently deletes an organization. Requires the `id` path parameter.

### GET /organizations/{id}/{field} — Get a specific field on an Organization

Returns the value of a single organization field. The `field` path parameter specifies which field.

### GET /organizations/{id}/boards — Get Boards in an Organization

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | `all` or comma-separated list of: `open`, `closed`, `members`, `organization`, `public`. |
| `fields` | string | No | `all` or comma-separated list of board fields. |

### GET /organizations/{id}/actions — Get Actions for an Organization

Returns actions for the organization. The `id` path parameter is required.

### GET /organizations/{id}/pluginData — Get Plugin Data for an Organization

Returns plugin data associated with the organization.

### POST /organizations/{id}/logo — Upload an Organization logo

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | No | Image file for the logo. |

### DELETE /organizations/{id}/logo — Delete an Organization logo

Removes the organization's logo.

### DELETE /organizations/{id}/prefs/associatedDomain — Remove Associated Domain

Removes the Google Apps associated domain from the organization.

### DELETE /organizations/{id}/prefs/orgInviteRestrict — Remove Org Invite Restriction

Removes the email-based invitation restriction from the organization.

### GET /organizations/{id}/tags — List Organization Tags

Returns all tags for the organization.

### POST /organizations/{id}/tags — Create an Organization Tag

Creates a new tag for the organization.

### DELETE /organizations/{id}/tags/{idTag} — Delete an Organization Tag

Deletes a tag. Requires `idTag` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:orgs-core -->

<!-- SECTION:orgs-members | keywords: orgMembers,idMember,type,deactivated,newBillableGuests,memberships | Organization member management, memberships, deactivation, and billable guests -->
## Organization Members

### GET /organizations/{id}/members — List Organization Members

Returns all members of the organization.

### PUT /organizations/{id}/members — Invite a Member to an Organization

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | **Yes** | An email address. |
| `fullName` | string | **Yes** | Name for the member, at least 1 character not beginning or ending with a space. |
| `type` | string | No | One of: `admin`, `normal`. |

### PUT /organizations/{id}/members/{idMember} — Update a Member's Role

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | **Yes** | One of: `admin`, `normal`. |

### DELETE /organizations/{id}/members/{idMember} — Remove a Member

Removes a member from the organization. The member will remain on any boards they were added to individually.

### DELETE /organizations/{id}/members/{idMember}/all — Remove a Member from all Boards

Removes a member from the organization and all organization boards.

### PUT /organizations/{id}/members/{idMember}/deactivated — Deactivate or Reactivate a Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | boolean | **Yes** | `true` to deactivate, `false` to reactivate. |

### GET /organizations/{id}/memberships — List Organization Memberships

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filter` | string | No | `all` or comma-separated list of: `active`, `admin`, `deactivated`, `me`, `normal`. |
| `member` | boolean | No | Whether to include the Member objects with the Memberships. |

### GET /organizations/{id}/memberships/{idMembership} — Get a Membership

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `member` | boolean | No | Whether to include the Member object in the response. |

### GET /organizations/{id}/newBillableGuests/{idBoard} — Get New Billable Guests for a Board

Returns members who would become new billable guests if the board were added to the organization. Requires `idBoard` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:orgs-members -->

<!-- SECTION:orgs-exports | keywords: exports,attachments,/organizations/{id}/exports | Organization data exports — creation and status polling -->
## Organization Exports

### POST /organizations/{id}/exports — Create an Export

Initiates an export of the organization's data. The export is processed asynchronously.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `attachments` | boolean | No | Whether the CSV should include attachments. |

### GET /organizations/{id}/exports — Get Export Status

Poll this endpoint to check the status of an export job. Returns an array of export objects.

**Export object fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the export. |
| `status` | string | One of: `pending`, `processing`, `completed`, `error`. |
| `startedAt` | string | ISO 8601 timestamp when the export started. |
| `completedAt` | string | ISO 8601 timestamp when the export completed (if applicable). |
| `url` | string | Download URL for the export (available when `completed`). |
| `size` | integer | Size of the export file in bytes. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:orgs-exports -->
