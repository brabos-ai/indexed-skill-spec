<!-- SECTION:auth-overview | keywords: auth,login,oauth,methods | Authentication methods overview -->
## Authentication Overview

The SaaS platform supports three authentication methods, each suited
to different use cases:

1. **OAuth2 Authorization Code** — for end-user browser-based login flows.
2. **JWT Bearer Tokens** — for authenticated API requests after login.
3. **API Keys** — for server-to-server integrations and CI/CD pipelines.

### Choosing a Method

| Method   | Use Case                        | Token Lifetime |
|----------|---------------------------------|----------------|
| OAuth2   | User login via browser          | Session-based  |
| JWT      | API calls from frontend/mobile  | 15 min access, 7 day refresh |
| API Key  | Automated backend services      | Until revoked  |

### OAuth2 Flow

The platform implements the Authorization Code flow with PKCE:

```
GET /oauth/authorize?response_type=code
    &client_id=CLIENT_ID
    &redirect_uri=https://app.example.com/callback
    &scope=read+write
    &code_challenge=CHALLENGE
    &code_challenge_method=S256
    &state=RANDOM_STATE
```

After the user authenticates, the authorization server redirects back
with a `code` parameter. Exchange it for tokens:

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=https://app.example.com/callback
&client_id=CLIENT_ID
&code_verifier=VERIFIER
```

The response contains an `access_token` (JWT) and a `refresh_token`.
Store the refresh token securely; it is required for silent renewal.
<!-- RELATED: #auth-jwt -->
<!-- /SECTION:auth-overview -->

<!-- SECTION:auth-jwt | keywords: jwt,token,bearer,refresh,expiration | JWT token implementation -->
## JWT Implementation

### Token Structure

Access tokens are signed JWTs (RS256) with the following claims:

```json
{
  "sub": "user_8xK2mP",
  "iss": "https://auth.example.com",
  "aud": "https://api.example.com",
  "iat": 1710000000,
  "exp": 1710000900,
  "scope": "read write",
  "org_id": "org_3nQ7vR",
  "role": "admin"
}
```

- `exp` is set to 15 minutes after `iat`.
- The `org_id` claim determines tenant-scoped access.
- The `role` claim is one of: `owner`, `admin`, `member`, `viewer`.

### Validating Tokens

All API services must validate incoming tokens:

1. Verify the RS256 signature against the JWKS endpoint at
   `https://auth.example.com/.well-known/jwks.json`.
2. Check that `exp` has not passed (allow 30 seconds of clock skew).
3. Confirm `aud` matches the service's expected audience.
4. Extract `org_id` and apply tenant isolation to database queries.

```python
from jose import jwt, JWTError

JWKS = fetch_jwks("https://auth.example.com/.well-known/jwks.json")

def validate_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWKS,
            algorithms=["RS256"],
            audience="https://api.example.com",
            options={"leeway": 30},
        )
        return payload
    except JWTError as e:
        raise AuthenticationError(f"Invalid token: {e}")
```

### Refreshing Tokens

When the access token expires, use the refresh token:

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=REFRESH_TOKEN
&client_id=CLIENT_ID
```

Refresh tokens are single-use. Each response includes a new refresh
token that replaces the previous one (rotation). If a refresh token is
reused, the server revokes the entire token family as a security measure.
<!-- RELATED: sections/billing.md#billing-webhooks -->
<!-- /SECTION:auth-jwt -->

<!-- SECTION:auth-apikey | keywords: apikey,key,secret,rotate,revoke | API Key management -->
## API Key Management

API keys provide long-lived credentials for server-to-server
communication. They bypass the OAuth2 flow entirely and are ideal for
background jobs, CI/CD pipelines, and third-party integrations.

### Creating a Key

Keys are created through the admin dashboard or the management API:

```
POST /api/v1/api-keys
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "name": "CI Pipeline - Production",
  "scopes": ["deployments:read", "deployments:write"],
  "expires_at": "2027-01-01T00:00:00Z"
}
```

The response includes the full key **once**. It is not stored in
plaintext — only a SHA-256 hash is persisted.

```json
{
  "id": "key_9aB3cD",
  "secret": "sk_live_YOUR_KEY_HERE",
  "created_at": "2026-03-08T12:00:00Z",
  "expires_at": "2027-01-01T00:00:00Z"
}
```

### Using a Key

Pass the key in the `X-API-Key` header:

```
GET /api/v1/deployments
X-API-Key: sk_live_YOUR_KEY_HERE
```

The gateway hashes the incoming key and looks up the matching record.
Requests are scoped to the permissions defined at creation time.

### Rotating and Revoking Keys

**Rotation** creates a new key and sets a grace period on the old one:

```
POST /api/v1/api-keys/key_9aB3cD/rotate
Authorization: Bearer <admin-jwt>

{
  "grace_period_hours": 24
}
```

During the grace period, both old and new keys are accepted. After it
expires, the old key is automatically revoked.

**Revocation** is immediate and permanent:

```
DELETE /api/v1/api-keys/key_9aB3cD
Authorization: Bearer <admin-jwt>
```

Revoked keys return `401 Unauthorized` on all subsequent requests.
Revocation events are published to the audit log and can trigger
webhook notifications.
<!-- /SECTION:auth-apikey -->
