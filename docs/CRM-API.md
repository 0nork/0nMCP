# CRM API Reference — 0nMCP

> **Owner**: RocketOpp LLC | **Updated**: 2026-03-27
> **Base URL**: `https://services.leadconnectorhq.com`
> **API Version Header**: `Version: 2021-07-28`
> **NEVER say "GHL" or "GoHighLevel"** — always "CRM" or "ROCKET"

---

## Authentication

All requests require: `Authorization: Bearer {PIT_TOKEN}`

### Available PITs

| PIT | Scopes | Use For |
|-----|--------|---------|
| `pit-e789d87e-bc97-429e-abc3-ff46aa47a316` | Agency — locations, users, contacts, tags, fields, values, calendars | Sub-account CRUD, user provisioning |
| `pit-f5f41b5a-32e4-4aee-84f4-a130cd3aad91` | Agent Studio, Knowledge Base, custom fields/values/tags | KB management, agent config, field CRUD |
| `pit-bd4efaef-44c7-410f-9349-85e941572675` | 0nMCP sub-location (rotated 2026-03-21) | Location-level ops for nphConTwfHcVE1oA0uep |

### Scope Limitations (CRITICAL)

| Endpoint | Agency PIT | Agent Studio PIT | Location PIT |
|----------|-----------|-----------------|--------------|
| `POST /locations/` | YES | NO | NO |
| `POST /users/` | YES | NO | NO |
| `GET/POST /locations/{id}/customFields` | YES | YES | NO |
| `GET/POST /locations/{id}/customValues` | YES | YES | NO |
| `GET/POST /locations/{id}/tags` | YES | YES | NO |
| `GET/POST /calendars/` | YES | YES | NO |
| `GET/POST /contacts/` | YES | YES | YES |
| `GET/POST /opportunities/pipelines` | **NO** | **NO** | **NO** |
| `GET/POST /knowledge-bases/` | NO | YES | NO |
| `GET/POST /agent-studio/agents` | NO | YES | NO |
| `POST /knowledge-bases/{id}/faq` | **404 — NOT AVAILABLE** | **404** | **404** |

### Request Headers (always required)

```
Authorization: Bearer {PIT}
Version: 2021-07-28
Content-Type: application/json
```

---

## Key IDs

| Resource | ID | Notes |
|----------|---|-------|
| Agency (Company) | `bknfhTkdDLapbwfZqQNi` | RocketOpp LLC |
| RocketOpp Location | `6MSqx0trfxgLxeHBJE1k` | Mike's main account |
| 0nCore Location | `nphConTwfHcVE1oA0uep` | Template for customer snapshots |
| Mike User ID | `jsQn26FwZxO6NcYKP5dk` | Agency admin |
| Main KB | `OGCRDsT1By985WL7tb2D` | 57 FAQs, powers agent |
| Customer Template KB | `EQEiCoDYud9T4UIERHfz` | Empty, for per-customer personalization |
| Agent (Step 1) | `ac910cf1-7f20-48c3-915a-6df4847116ff` | Published, active |
| Onboarding Calendar | `5rlqrqjRK8ySbNbP0kcf` | Event type, 30min slots |

---

## Locations API

### Create Sub-Location
```
POST /locations/
PIT: Agency PIT only
```
```json
{
  "name": "Company Name",
  "email": "user@example.com",
  "phone": "+15551234567",
  "companyId": "bknfhTkdDLapbwfZqQNi",
  "plan": { "id": "{PLAN_ID}" },
  "snapshotId": "{SNAPSHOT_ID}",
  "settings": {
    "allowDuplicateContact": false,
    "allowDuplicateOpportunity": false
  }
}
```

### Update Location
```
PUT /locations/{locationId}
```

### Suspend Location
```
PUT /locations/{locationId}
Body: { "settings": { "suspended": true } }
```

### Reinstate Location
```
PUT /locations/{locationId}
Body: { "settings": { "suspended": false } }
```

---

## Users API

### Create User (Admin for Sub-Location)
```
POST /users/
PIT: Agency PIT only
```
```json
{
  "companyId": "bknfhTkdDLapbwfZqQNi",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "type": "account",
  "role": "admin",
  "locationIds": ["{locationId}"],
  "permissions": {
    "campaignsEnabled": true,
    "contactsEnabled": true,
    "workflowsEnabled": true,
    "opportunitiesEnabled": true,
    "dashboardStatsEnabled": true,
    "appointmentsEnabled": true,
    "settingsEnabled": true
  }
}
```

---

## Contacts API

### List Contacts
```
GET /contacts/?locationId={id}&limit=100
```

### Create Contact
```
POST /contacts/
```
```json
{
  "locationId": "{locationId}",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "tags": ["0nmcp-customer", "plan-starter"],
  "customFields": [
    { "id": "{fieldId}", "field_value": "value" }
  ]
}
```

### Delete Contact
```
DELETE /contacts/{contactId}
```

> **WARNING**: AI persona contacts (@0nmcp.internal, @0nork.community) are synced to 0nmcp.com forum. NEVER bulk delete. See feedback_never-delete-crm-contacts.md.

---

## Custom Fields API

### List Fields
```
GET /locations/{locationId}/customFields
```

### Create Field
```
POST /locations/{locationId}/customFields
```
```json
{
  "name": "Plan Tier",
  "dataType": "TEXT",
  "placeholder": "starter / pro / agency"
}
```

Supported dataTypes: `TEXT`, `LARGE_TEXT`, `NUMERICAL`, `PHONE`, `MONETORY`, `CHECKBOX`, `SINGLE_OPTIONS`, `MULTIPLE_OPTIONS`, `FLOAT`, `DATE`, `TEXTBOX_LIST`, `FILE_UPLOAD`, `SIGNATURE`

---

## Custom Values API

### List Values
```
GET /locations/{locationId}/customValues
```

### Create Value
```
POST /locations/{locationId}/customValues
```
```json
{
  "name": "System Prompt",
  "value": "You are Jaxx..."
}
```

---

## Tags API

### List Tags
```
GET /locations/{locationId}/tags
```

### Create Tag
```
POST /locations/{locationId}/tags
```
```json
{ "name": "plan-starter" }
```

Error: `400 "The tag name is already exist."` — tag names are unique per location.

---

## Knowledge Base API

### List KBs
```
GET /knowledge-bases/?locationId={id}
PIT: Agent Studio PIT
```

### Create KB
```
POST /knowledge-base/
PIT: Agent Studio PIT
```
```json
{
  "locationId": "{locationId}",
  "name": "My Knowledge Base"
}
```
Note: Creation endpoint uses singular `/knowledge-base/`, listing uses plural `/knowledge-bases/`. The API internally rewrites plural to singular.

### Get KB
```
GET /knowledge-bases/{kbId}?locationId={id}
```

### Add FAQ Content
**NOT AVAILABLE VIA API.** The `POST /knowledge-bases/{id}/faq` endpoint returns 404. FAQs must be added through the CRM UI or will be populated per-customer at provisioning time.

---

## Agent Studio API

### List Agents
```
GET /agent-studio/agents?locationId={id}
PIT: Agent Studio PIT
```

### Get Agent Details
```
GET /agent-studio/agents/{agentId}?locationId={id}
```
Returns full agent config including all versions, nodes, edges, and variables. Response can be 900KB+.

### Execute Agent
```
POST /agent-studio/public-api/agents/{agentId}/execute
```
```json
{
  "message": "User's question",
  "locationId": "{locationId}",
  "versionId": "{versionId}"
}
```
Returns `executionId` for session persistence.

---

## Calendars API

### List Calendars
```
GET /calendars/?locationId={id}
```

### Create Calendar
```
POST /calendars/
```
```json
{
  "locationId": "{locationId}",
  "name": "Onboarding Call",
  "calendarType": "event",
  "slotDuration": 30,
  "autoConfirm": true
}
```
Note: `round_robin` type requires team members to exist first.

---

## Pipelines API

### Create Pipeline
```
POST /opportunities/pipelines
```
**SCOPE NOT AVAILABLE** on any current PIT. Must create via CRM UI.

---

## Snapshots

Cannot be created or applied via API. Must use CRM UI:
1. Settings → Company → Snapshots → Create
2. Select: custom fields, custom values, tags, calendars, KBs, agents
3. EXCLUDE: contacts (AI personas are forum-linked)
4. Apply snapshot ID in location creation: `"snapshotId": "{id}"`

---

## Rate Limits

- 100 requests per minute per location
- 10 requests per second burst
- Token bucket with exponential backoff (handled by 0nMCP ratelimit.js)

## SSL Notes

- Python urllib may fail with `SSL: CERTIFICATE_VERIFY_FAILED` on macOS
- Always use `curl -k` for direct API calls from terminal
- Node.js fetch works fine

---

## 0nCore Location — Full Object Inventory

See `/Users/rocketopp/.claude/projects/-Users-rocketopp/memory/0ncore-crm-state.md` for complete list of all custom fields, values, tags, KBs, agents, and calendars with their IDs.

---

*This document is the single source of truth for CRM API patterns in the 0n ecosystem. Update it every time a new endpoint is discovered, a PIT scope is tested, or an object is created/modified.*
