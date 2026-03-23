# CRM Marketplace Apps — 0nMCP

Build, publish, and sell AI-powered apps on the CRM marketplace using 0nMCP as the execution engine.

## Overview

The CRM marketplace lets developers publish apps that CRM users can install into their locations. Each app uses OAuth to connect securely, receives webhook events, and leverages 0nMCP's 1,100+ tools to deliver AI-powered automation.

## Directory Structure

```
marketplace/
├── apps/
│   ├── 0n-autoresponder/   — AI auto-responses for conversations
│   ├── 0n-lead-scorer/     — AI-powered lead scoring
│   └── 0n-content-ai/      — AI content generation
├── lib/
│   ├── oauth.js            — Shared OAuth flow handler
│   ├── webhook.js          — Shared webhook verification + routing
│   └── installer.js        — App installation helper
└── templates/
    ├── app.json.template   — Manifest template for new apps
    └── handler.js.template — Webhook handler template
```

## Creating a New App

### 1. Copy the templates

```bash
mkdir marketplace/apps/my-new-app
cp marketplace/templates/app.json.template marketplace/apps/my-new-app/app.json
cp marketplace/templates/handler.js.template marketplace/apps/my-new-app/handler.js
```

### 2. Edit app.json

Update the manifest with your app's details:

```json
{
  "name": "My App Name",
  "slug": "my-app-name",
  "description": "What your app does",
  "version": "1.0.0",
  "scopes": ["contacts.readonly", "contacts.write"],
  "webhook_url": "https://0nmcp.com/api/marketplace/webhooks/my-app-name",
  "pricing": {
    "type": "subscription",
    "monthly": 29,
    "trial_days": 14
  }
}
```

### 3. Implement handler.js

Your handler receives webhook events from the CRM and processes them:

```js
export async function handle(event, context) {
  // event.type — the CRM event type (e.g., "ConversationMessage")
  // event.data — the event payload from CRM
  // context.locationId — the CRM location that triggered the event
  // context.accessToken — OAuth access token for that location
  // context.config — app-specific configuration

  // Use 0nMCP tools via context.execute()
  const result = await context.execute('crm_conversations_list', {
    locationId: context.locationId
  });

  return { success: true, data: result };
}
```

### 4. Create install.js

Handle what happens when a user installs your app:

```js
export async function onInstall(locationId, accessToken, config) {
  // Set up custom fields, tags, or webhooks for this location
}

export async function onUninstall(locationId) {
  // Clean up resources
}
```

### 5. Register in CRM Developer Console

1. Go to the CRM developer marketplace portal
2. Create a new app listing
3. Set your OAuth redirect URI to: `https://0nmcp.com/api/marketplace/oauth/callback`
4. Add the scopes from your app.json
5. Copy the Client ID and Client Secret
6. Set environment variables:
   ```
   CRM_APP_CLIENT_ID=your_client_id
   CRM_APP_CLIENT_SECRET=your_client_secret
   ```

### 6. Configure Webhooks

Register webhook subscriptions for the events your app needs:
- `ConversationMessage` — New messages in conversations
- `ContactCreate` — New contacts created
- `ContactUpdate` — Contact data updated
- `OpportunityCreate` — New opportunities
- `NoteCreate` — New notes added
- `TaskCreate` — New tasks created
- `AppointmentCreate` — New appointments booked

## OAuth Flow

The shared OAuth library (`lib/oauth.js`) handles the full flow:

1. **Authorization**: User clicks "Install" on CRM marketplace, redirected to your app
2. **Consent**: User selects which location to connect
3. **Callback**: CRM redirects back with an authorization code
4. **Token Exchange**: Code exchanged for access + refresh tokens
5. **Storage**: Tokens stored per-location in Supabase
6. **Refresh**: Tokens auto-refreshed before expiry

```
User clicks Install → CRM OAuth → Your Redirect URI → Exchange Code → Store Tokens
```

## Webhook Security

All incoming webhooks are verified using HMAC signatures before processing. The shared webhook library (`lib/webhook.js`) handles:

- Signature verification against your app secret
- Timestamp validation (5-minute tolerance)
- Event routing to the correct app handler
- Automatic retry on transient failures

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CRM_AGENCY_PIT` | Agency-level Private Integration Token |
| `CRM_APP_CLIENT_ID` | OAuth app Client ID |
| `CRM_APP_CLIENT_SECRET` | OAuth app Client Secret |
| `CRM_WEBHOOK_SECRET` | Webhook signing secret |
| `SUPABASE_URL` | Supabase project URL (for token storage) |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Anthropic API key (for AI features) |

## Pricing Models

Apps support three pricing models in app.json:

- **subscription**: Monthly recurring charge (`monthly` field)
- **one-time**: Single purchase price (`price` field)
- **usage**: Per-execution billing (`per_execution` field)

All pricing flows through Stripe via the 0n Marketplace billing system.

## Available CRM Scopes

Refer to the CRM API documentation for the full list. Common scopes:

| Scope | Description |
|-------|-------------|
| `contacts.readonly` / `.write` | Read/write contacts |
| `conversations.readonly` / `.write` | Read/write conversations |
| `conversations/message.readonly` / `.write` | Read/write messages |
| `opportunities.readonly` / `.write` | Read/write opportunities |
| `locations.readonly` / `.write` | Read/write location settings |
| `locations/customFields.readonly` / `.write` | Read/write custom fields |
| `locations/customValues.readonly` / `.write` | Read/write custom values |
| `locations/tags.readonly` / `.write` | Read/write tags |
| `calendars.readonly` / `.write` | Read/write calendars |
| `users.readonly` / `.write` | Read/write users |

## Publishing to Marketplace

1. Test your app locally with `0nmcp serve`
2. Ensure all webhook handlers return proper responses
3. Submit your app for review in the CRM developer portal
4. Once approved, your app appears in the CRM marketplace
5. Users can install it directly from within their CRM account

## Support

- GitHub: https://github.com/0nork/0nMCP
- Website: https://0nmcp.com
- Email: hello@0nork.com
