<!-- SECTION:enterprises-core | keywords: enterprises,idEnterprise,auditlog,admins,signupUrl | Enterprise retrieval, audit log, admin listing, signup URL, and token creation -->
## Enterprise Core

### GET /enterprises/{id} — Get an Enterprise

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of: `id`, `name`, `displayName`, `prefs`, `ssoActivationFailed`, `idAdmins`, `idMembers` (and others). |
| `members` | string | No | One of: `none`, `normal`, `admins`, `owners`, `all`. |
| `member_fields` | string | No | One of: `avatarHash`, `fullName`, `initials`, `username`. |
| `member_filter` | string | No | SCIM-style query to filter members. Takes precedence over the `members` value. |
| `member_sort` | string | No | SCIM-style sorting value. Prefix with `-` to sort descending. |
| `member_sortBy` | string | No | Deprecated: use `member_sort`. SCIM-style sorting value. |
| `member_sortOrder` | string | No | Deprecated: use `member_sort`. One of: `ascending`, `descending`, `asc`, `desc`. |
| `member_startIndex` | integer | No | Any integer between 0 and 100. |
| `member_count` | integer | No | 0 to 100. |
| `organizations` | string | No | One of: `none`, `members`, `public`, `all`. |
| `organization_fields` | string | No | Any valid value the nested organization field resource accepts. |
| `organization_paid_accounts` | boolean | No | Whether to include paid account information in workspace objects. |
| `organization_memberships` | string | No | Comma-separated list of: `me`, `normal`, `admin`, `active`, `deactivated`. |

### GET /enterprises/{id}/auditlog — Get Enterprise Audit Log

Returns the audit log for the enterprise. Requires the enterprise `id` path parameter.

### GET /enterprises/{id}/admins — Get Enterprise Admins

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | Any valid value that the nested member field resource accepts. |

### GET /enterprises/{id}/signupUrl — Get Enterprise Signup URL

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `authenticate` | boolean | No | Whether to require authentication. |
| `confirmationAccepted` | boolean | No | Whether confirmation has been accepted. |
| `returnUrl` | string | No | Any valid URL for redirect after signup. |
| `tosAccepted` | boolean | No | Whether the user has consented to the Trello ToS prior to being redirected. |

### POST /enterprises/{id}/tokens — Create an Enterprise Token

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `expiration` | string | No | One of: `1hour`, `1day`, `30days`, `never`. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:enterprises-core -->

<!-- SECTION:enterprises-members | keywords: licensed,deactivated,managed,admin,cursor,search | Enterprise member listing, querying, licensing, deactivation, and admin management -->
## Enterprise Members

### GET /enterprises/{id}/members — List Enterprise Members

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of valid member fields. |
| `filter` | string | No | SCIM-style query to filter members. Takes precedence over the all/normal/admins value. |
| `sort` | string | No | SCIM-style sorting value. Prefix with `-` to sort descending. |
| `sortBy` | string | No | Deprecated: use `sort`. SCIM-style sorting value. |
| `sortOrder` | string | No | Deprecated: use `sort`. One of: `ascending`, `descending`, `asc`, `desc`. |
| `startIndex` | integer | No | Any integer between 0 and 9999. |
| `count` | string | No | SCIM-style filter. |
| `organization_fields` | string | No | Any valid value the nested organization field resource accepts. |
| `board_fields` | string | No | Any valid value the nested board resource accepts. |

### GET /enterprises/{id}/members/query — Query Enterprise Members

Advanced member query with boolean filters and cursor-based pagination.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `licensed` | boolean | No | When `true`, returns members who possess a license; when `false`, returns those who do not. |
| `deactivated` | boolean | No | When `true`, returns deactivated members; when `false`, returns active members. |
| `collaborator` | boolean | No | When `true`, returns members who are guests on boards but do not possess a license. |
| `managed` | boolean | No | When `true`, returns members managed by the enterprise; when `false`, returns unmanaged members. |
| `admin` | boolean | No | When `true`, returns enterprise administrators; when `false`, returns non-admin members. |
| `activeSince` | string | No | Returns only members active since this date (inclusive). |
| `inactiveSince` | string | No | Returns only members inactive since this date (inclusive). |
| `search` | string | No | Returns members with email or full name matching the search value. |
| `cursor` | string | No | Cursor to return the next set of results (from a previous response). |

### GET /enterprises/{id}/members/{idMember} — Get a Single Enterprise Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of valid member fields. |
| `organization_fields` | string | No | Any valid value the nested organization field resource accepts. |
| `board_fields` | string | No | Any valid value the nested board resource accepts. |

### PUT /enterprises/{id}/members/{idMember}/licensed — Update Member License

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | boolean | **Yes** | `true` to grant an Enterprise license, `false` to remove it. |

### PUT /enterprises/{id}/members/{idMember}/deactivated — Deactivate or Reactivate a Member

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | boolean | **Yes** | `true` to deactivate, `false` to reactivate. |
| `fields` | string | No | Comma-separated list of valid member fields. |
| `organization_fields` | string | No | Any valid value the nested organization resource accepts. |
| `board_fields` | string | No | Any valid value the nested board resource accepts. |

### PUT /enterprises/{id}/admins/{idMember} — Make a Member an Enterprise Admin

Grants admin privileges to a member. Requires `idMember` as a path parameter.

### DELETE /enterprises/{id}/admins/{idMember} — Remove an Enterprise Admin

Revokes admin privileges from a member. Requires `idMember` as a path parameter.

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- RELATED: sections/auth.md#auth-pagination -->
<!-- /SECTION:enterprises-members -->

<!-- SECTION:enterprises-orgs | keywords: claimableOrganizations,pendingOrganizations,transferrable | Enterprise organization management, claims, transfers, and join requests -->
## Enterprise Organizations

### GET /enterprises/{id}/organizations — List Enterprise Organizations

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | string | No | Comma-separated list of organization fields. |
| `filter` | string | No | Filter for organizations. |
| `startIndex` | integer | No | Any integer greater than or equal to 1. |
| `count` | integer | No | Any integer between 0 and 100. |

### PUT /enterprises/{id}/organizations — Transfer an Organization to the Enterprise

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idOrganization` | string | **Yes** | ID of the Organization to transfer to the Enterprise. |

### GET /enterprises/{id}/organizations/bulk/{idOrganizations} — Get Multiple Organizations

Returns multiple organizations by their IDs (comma-separated in the `idOrganizations` path parameter).

### DELETE /enterprises/{id}/organizations/{idOrg} — Remove an Organization from the Enterprise

Removes an organization from the enterprise. Requires `idOrg` as a path parameter.

### GET /enterprises/{id}/claimableOrganizations — Get Claimable Organizations

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `limit` | integer | No | Limits the number of workspaces returned. |
| `cursor` | string | No | Cursor specifying the sort order for returning matching documents. |
| `name` | string | No | Name of the enterprise to retrieve workspaces for. |
| `activeSince` | string | No | Date in `YYYY-MM-DD` format for activeness threshold. |
| `inactiveSince` | string | No | Date in `YYYY-MM-DD` format for inactiveness threshold. |

### GET /enterprises/{id}/pendingOrganizations — Get Pending Organizations

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `activeSince` | string | No | Date in `YYYY-MM-DD` format for activeness threshold. |
| `inactiveSince` | string | No | Date in `YYYY-MM-DD` format for inactiveness threshold. |

### GET /enterprises/{id}/transferrable/organization/{idOrganization} — Check if an Organization is Transferrable

Checks whether a specific organization can be transferred to the enterprise. Requires `idOrganization` as a path parameter.

### GET /enterprises/{id}/transferrable/bulk/{idOrganizations} — Check Multiple Organizations for Transferrability

Checks whether multiple organizations (comma-separated `idOrganizations` path parameter) can be transferred to the enterprise.

### PUT /enterprises/{id}/enterpriseJoinRequest/bulk — Bulk Enterprise Join Request

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `idOrganizations` | array | **Yes** | An array of IDs of organizations to send join requests to. |

<!-- RELATED: sections/auth.md#auth-overview -->
<!-- /SECTION:enterprises-orgs -->
