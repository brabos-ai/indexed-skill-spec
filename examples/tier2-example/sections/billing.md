<!-- SECTION:billing-overview | keywords: billing,stripe,payment,plan,subscription | Billing system overview -->
## Billing Overview

The platform uses Stripe as its payment processor. All billing state
is synchronized between the application database and Stripe, with
Stripe treated as the source of truth for payment status.

### Subscription Plans

Three plans are available, each mapped to a Stripe Price ID:

| Plan       | Price ID                  | Monthly | Seats | Storage |
|------------|---------------------------|---------|-------|---------|
| Starter    | `price_starter_monthly`   | $29     | 5     | 10 GB   |
| Team       | `price_team_monthly`      | $99     | 25    | 100 GB  |
| Enterprise | `price_enterprise_monthly`| $499    | Unlimited | 1 TB |

Annual billing is available at a 20% discount. The corresponding
price IDs use the `_annual` suffix.

### Creating a Subscription

When a user selects a plan, the backend creates a Stripe Checkout
Session:

```python
import stripe

def create_checkout(org_id: str, price_id: str) -> str:
    session = stripe.checkout.Session.create(
        customer=get_or_create_stripe_customer(org_id),
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url="https://app.example.com/billing?status=success",
        cancel_url="https://app.example.com/billing?status=cancel",
        metadata={"org_id": org_id},
    )
    return session.url
```

After successful payment, Stripe sends a `checkout.session.completed`
webhook event, which the platform uses to activate the subscription
in the local database.
<!-- RELATED: #billing-webhooks -->

### Upgrading and Downgrading

Plan changes are handled via the Stripe Customer Portal or the API:

```python
def change_plan(subscription_id: str, new_price_id: str):
    stripe.Subscription.modify(
        subscription_id,
        items=[{
            "id": get_subscription_item_id(subscription_id),
            "price": new_price_id,
        }],
        proration_behavior="create_prorations",
    )
```

Upgrades take effect immediately with prorated charges. Downgrades
are scheduled for the end of the current billing period to avoid
disrupting active usage.
<!-- /SECTION:billing-overview -->

<!-- SECTION:billing-webhooks | keywords: webhook,stripe,event,payment,notification | Stripe webhook handling -->
## Webhook Handling

Stripe sends events to `POST /api/v1/webhooks/stripe`. All webhook
handlers follow a strict processing pipeline to ensure reliability.

### Verification

Every incoming request is verified using the Stripe webhook secret:

```python
import stripe

WEBHOOK_SECRET = os.environ["STRIPE_WEBHOOK_SECRET"]

def handle_webhook(request):
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        return Response(status=400)

    process_event(event)
    return Response(status=200)
```

### Handled Events

The platform processes the following Stripe events:

| Event                              | Action                              |
|------------------------------------|-------------------------------------|
| `checkout.session.completed`       | Activate subscription, provision resources |
| `invoice.payment_succeeded`        | Record payment, reset retry counter |
| `invoice.payment_failed`           | Notify org admins, increment retry counter |
| `customer.subscription.updated`    | Sync plan changes to local DB       |
| `customer.subscription.deleted`    | Deactivate org, schedule data retention |

### Idempotency

Each event is stored by its `event.id` before processing. If a
duplicate event arrives (Stripe retries on non-2xx responses), the
handler returns `200 OK` without reprocessing:

```python
def process_event(event: stripe.Event):
    if WebhookEvent.objects.filter(stripe_id=event.id).exists():
        logger.info(f"Skipping duplicate event {event.id}")
        return

    WebhookEvent.objects.create(
        stripe_id=event.id,
        event_type=event.type,
        payload=event.data,
    )

    handler = EVENT_HANDLERS.get(event.type)
    if handler:
        handler(event.data.object)
```

### Failure Recovery

If a webhook handler raises an exception, the event is marked as
`failed` in the database and added to a retry queue. The retry
worker attempts reprocessing with exponential backoff (1 min, 5 min,
30 min, 2 hours). After four failures, the event is flagged for
manual review and an alert is sent to the on-call channel.

Events older than 72 hours without successful processing trigger a
reconciliation job that compares local subscription state against the
Stripe API to detect and fix any drift.
<!-- RELATED: sections/auth.md#auth-apikey -->
<!-- /SECTION:billing-webhooks -->
