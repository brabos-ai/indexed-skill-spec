---
name: api-rate-limiting
description: >
  Rate limiting strategies, configuration, and troubleshooting
  for API endpoints.
indexed-skill: tier 1
---
# API Rate Limiting

Comprehensive guide for implementing and managing API rate limiting.

<!-- INDEX
@rate-overview | rate-limiting | Rate limiting concepts and strategies
@rate-config | configuration | How to configure rate limits per endpoint
@rate-headers | headers | Rate limit response headers and client handling
@rate-troubleshoot | troubleshooting | Common rate limiting issues and fixes
-->

<!-- SECTION:rate-overview | keywords: rate,limit,throttle,quota,strategy | Rate limiting concepts and available strategies -->
## Rate Limiting Overview

Rate limiting controls how many requests a client can make to an API within a
given time window. It protects backend services from abuse, ensures fair usage
across consumers, and prevents resource exhaustion during traffic spikes.

### Common Strategies

- **Fixed Window**: Counts requests in fixed time intervals (e.g., 100 requests
  per minute). Simple to implement but susceptible to burst traffic at window
  boundaries.
- **Sliding Window**: Tracks requests over a rolling time period, smoothing out
  burst edges. More accurate than fixed window but requires more memory.
- **Token Bucket**: Tokens are added to a bucket at a steady rate. Each request
  consumes a token. Allows short bursts up to the bucket capacity while
  enforcing an average rate over time.
- **Leaky Bucket**: Requests are queued and processed at a constant rate,
  regardless of arrival pattern. Good for smoothing out traffic but adds
  latency under load.

### Choosing a Strategy

| Strategy       | Burst Tolerance | Memory Cost | Complexity |
|----------------|-----------------|-------------|------------|
| Fixed Window   | Low             | Low         | Low        |
| Sliding Window | Medium          | Medium      | Medium     |
| Token Bucket   | High            | Low         | Medium     |
| Leaky Bucket   | None            | Medium      | Medium     |

For most REST APIs, **token bucket** offers the best balance between burst
tolerance and simplicity. Use sliding window when you need precise per-second
accuracy for billing or compliance purposes.
<!-- /SECTION:rate-overview -->

<!-- SECTION:rate-config | keywords: config,configure,limit,endpoint,tier,plan,redis | How to configure rate limits per endpoint -->
## Configuration

Rate limits are typically defined per endpoint, per authentication tier, or
both. Configuration can live in application code, environment variables, or a
centralized config store like Consul or etcd.

### Per-Endpoint Configuration

```yaml
rate_limits:
  - endpoint: "POST /api/v1/messages"
    requests: 60
    window: "1m"
    strategy: token_bucket
  - endpoint: "GET /api/v1/users/*"
    requests: 300
    window: "1m"
    strategy: sliding_window
  - endpoint: "POST /api/v1/uploads"
    requests: 10
    window: "1h"
    strategy: fixed_window
```

### Per-Plan Tiers

```yaml
plans:
  free:
    global_rpm: 60
    burst_capacity: 10
  pro:
    global_rpm: 600
    burst_capacity: 100
  enterprise:
    global_rpm: 6000
    burst_capacity: 1000
```

### Backend Store

For distributed deployments, use Redis to share counters across instances.
Set the `RATE_LIMIT_STORE` environment variable:

```bash
RATE_LIMIT_STORE=redis://redis-cluster:6379/0
RATE_LIMIT_KEY_PREFIX=rl:
```

When Redis is unavailable, the limiter falls back to in-memory counters with
a warning logged at `WARN` level. Monitor the `rate_limiter.fallback` metric
to detect this condition.
<!-- /SECTION:rate-config -->

<!-- SECTION:rate-headers | keywords: header,response,retry,remaining,reset,client,429 | Rate limit response headers and client handling -->
## Response Headers

Every rate-limited response includes standard headers so clients can track
their usage and react before hitting limits.

### Standard Headers

| Header                  | Description                                      |
|-------------------------|--------------------------------------------------|
| `X-RateLimit-Limit`     | Maximum requests allowed in the current window   |
| `X-RateLimit-Remaining` | Requests remaining in the current window         |
| `X-RateLimit-Reset`     | Unix timestamp when the current window resets     |
| `Retry-After`           | Seconds to wait before retrying (on 429 only)    |

### Example 429 Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1709942400
Retry-After: 23

{
  "error": "rate_limit_exceeded",
  "message": "Request limit of 60 per minute exceeded. Retry after 23 seconds.",
  "retry_after": 23
}
```

### Client-Side Handling

Clients should implement exponential backoff when receiving 429 responses.
Always respect the `Retry-After` header rather than using a fixed delay.
A recommended pattern:

1. On 429, read the `Retry-After` value.
2. Wait the specified duration plus a small random jitter (0-500ms).
3. Retry the request. If 429 persists, double the wait time up to a cap.
4. After 3-5 retries, surface the error to the caller.

Proactive clients can also monitor `X-RateLimit-Remaining` and throttle
outgoing requests before the limit is reached.
<!-- /SECTION:rate-headers -->

<!-- SECTION:rate-troubleshoot | keywords: troubleshoot,debug,error,429,spike,bypass,whitelist | Common rate limiting issues and fixes -->
## Troubleshooting

### Unexpected 429 Errors

1. **Shared API key**: Multiple services using the same key share the same
   quota. Issue separate keys per service or deploy a client-side token pool.
2. **Clock skew**: If your rate limiter uses timestamps, ensure NTP is running
   on all nodes. Skew of more than 2 seconds can cause premature limit trips.
3. **Miscounted preflight requests**: CORS preflight (`OPTIONS`) requests may
   count against limits. Exclude them in your middleware configuration.

### Traffic Spikes

When legitimate traffic spikes trigger limits:

- Temporarily increase the burst capacity via config without changing the
  sustained rate.
- Enable request queuing (leaky bucket mode) for non-latency-sensitive
  endpoints.
- Scale Redis cluster read replicas if counter reads become a bottleneck.

### Bypassing Limits for Internal Services

Internal services calling the API through a service mesh can be exempted by
matching on the `X-Internal-Service` header or source IP range:

```yaml
bypass_rules:
  - match:
      header: "X-Internal-Service"
      value: "true"
    source_cidrs:
      - "10.0.0.0/8"
      - "172.16.0.0/12"
```

Never bypass rate limits based solely on a header without also verifying the
source network. Headers can be spoofed by external callers.

### Monitoring Checklist

- Alert on `rate_limiter.rejected` count exceeding 5% of total requests.
- Dashboard the p99 latency of rate-limit middleware (should be under 2ms).
- Track `rate_limiter.fallback` events to catch Redis connectivity issues.
- Review per-key usage weekly to identify clients that need plan upgrades.
<!-- /SECTION:rate-troubleshoot -->
