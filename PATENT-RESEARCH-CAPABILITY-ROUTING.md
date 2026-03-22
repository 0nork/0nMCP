# Patent Research Brief: Universal Capability Routing & Field Resolution System

**Prepared for:** Patent Attorney / Prior Art Research
**Inventor:** Michael A. Mento Jr.
**Assignee:** RocketOpp LLC
**Date:** March 21, 2026
**Related Patents:** US Provisional #63/990,046 (0nVault Container System), US Provisional #63/968,814 (Seal of Truth)

---

## 1. INVENTION SUMMARY

The invention is a **Universal Capability Routing and Field Resolution System** for AI-driven workflow orchestration across heterogeneous SaaS APIs. It comprises two interdependent components:

### Component A: Universal Field Resolution (.0n Field Standard)

A canonical field naming convention (fields suffixed with `.0n`) that automatically resolves to the correct API-specific field name for any connected third-party service at runtime. A single canonical identifier (e.g., `company.0n`) maps to the service-specific field format required by each API (e.g., `companyName` for one CRM, `properties.company` for another, `CompanyName` for an accounting system, `organizationName` for a professional network).

The system maintains a mapping registry of canonical-to-service field translations. When a workflow file references `company.0n`, the resolver inspects which service the data is being sent to and translates the field name, nested path structure, data type, and composite field behavior (e.g., splitting `fullname.0n` into `firstName` + `lastName` for services that require separate fields) automatically.

### Component B: Capability-Based Service Routing

A runtime routing mechanism where workflow authors specify desired **capabilities** (e.g., `emailsender.0n`, `payment.0n`, `calendar.0n`) rather than specific services. At execution time, the system:

1. Inspects the user's locally-stored credential manifest (`~/.0n/connections/`) to determine which services are connected and authenticated
2. Matches the requested capability to all available services that can fulfill it
3. Selects the optimal service based on priority, availability, and health status
4. Executes the API call using the selected service's specific authentication, endpoint structure, and field format
5. If the primary service fails (rate limit, downtime, authentication error), automatically falls through to the next available service that provides the same capability
6. Returns the result to the workflow in a normalized format regardless of which service fulfilled the request

This creates **portable workflow files** — a workflow authored by one user works for any other user regardless of which specific SaaS services they have connected, so long as they have at least one service providing each required capability.

---

## 2. THE PROBLEM THIS SOLVES

### Current State of the Art

Every existing workflow automation platform (Zapier, Make/Integromat, n8n, Tray.io, Workato, Apache Camel, MuleSoft, Microsoft Power Automate, IFTTT) requires the workflow author to:

1. **Explicitly select a specific service** at each step (e.g., "SendGrid: Send Email" not "Send Email")
2. **Manually map fields** between services (e.g., map the output field `contact.firstName` from Step 1 to the input field `properties.firstname` in Step 2)
3. **Hardcode service-specific configurations** into the workflow definition
4. **Rebuild workflows** when switching from one service to another (e.g., migrating from SendGrid to Resend requires rewriting every email step)
5. **Accept single points of failure** — if the hardcoded service is down, the workflow fails with no automatic fallback

This creates three critical problems:

**Problem 1: Non-portability.** A workflow built for User A's stack (SendGrid + Stripe + HubSpot) cannot be used by User B who has (Resend + Square + Pipedrive) without complete reconstruction.

**Problem 2: Fragile execution.** When a service experiences downtime, every workflow using that service fails. There is no automatic failover to alternative services that provide the same capability.

**Problem 3: Field mapping complexity.** The same logical data (a company name, an email address, a phone number) is represented differently across every API. Users must manually discover and configure these mappings for every workflow step, across every service pair. This is the #1 source of integration errors and the #1 barrier to adoption for non-technical users.

### How This Invention Solves It

The user writes a workflow once using canonical `.0n` field names and capability identifiers. The system handles all service selection, field translation, and failover automatically. The workflow is portable, resilient, and requires zero field mapping knowledge from the user.

---

## 3. DETAILED TECHNICAL ARCHITECTURE

### 3.1 Canonical Field Registry

The system maintains a registry of canonical fields, each defined by:

```
{
  "canonical_name": "company.0n",
  "label": "Company Name",
  "data_type": "string",
  "mappings": {
    "service_a": "companyName",
    "service_b": "properties.company",
    "service_c": "CompanyName",
    "service_d": "organizationName",
    "service_e": "org_name",
    "service_f": "companies[0].name",
    "service_g": "properties.Company.rich_text[0].text.content",
    "service_h": "BillAddr.Line1"
  }
}
```

The registry handles:
- **Simple mappings**: `email.0n` → `email` (direct key rename)
- **Nested path mappings**: `email.0n` → `properties.email` (dot-notation traversal into nested objects)
- **Array access mappings**: `email.0n` → `attendees[0].email` (indexed array access)
- **Composite field mappings**: `fullname.0n` → `["firstName", "lastName"]` (single value split into multiple fields)
- **Reverse resolution**: Given a service-specific field name, determine the canonical `.0n` identifier

### 3.2 Capability Registry

Each service in the catalog declares its capabilities:

```
{
  "service": "sendgrid",
  "capabilities": ["email_send", "email_template", "contact_list"],
  "priority": 1,
  "health_check_endpoint": "/v3/api_keys"
}
```

Capability categories include but are not limited to:
- `emailsender.0n` — maps to: SendGrid, Resend, CRM, Gmail, Mailchimp, Microsoft
- `payment.0n` — maps to: Stripe, Square, QuickBooks, PayPal
- `crm.0n` — maps to: CRM platform, HubSpot, Salesforce, Pipedrive
- `calendar.0n` — maps to: Google Calendar, Calendly, CRM Calendar, Microsoft
- `storage.0n` — maps to: Google Drive, Dropbox, Supabase Storage, Azure Blob
- `messaging.0n` — maps to: Slack, Discord, Twilio SMS, WhatsApp
- `social.0n` — maps to: LinkedIn, X/Twitter, Instagram, Facebook, TikTok

### 3.3 Runtime Resolution Algorithm

When a workflow step specifies a capability (e.g., `emailsender.0n`):

```
FUNCTION resolveCapability(capabilityId, userData):
  1. LOAD user's credential manifest from ~/.0n/connections/
  2. FILTER services that provide the requested capability
  3. FILTER to only services with valid, non-expired credentials
  4. SORT by priority (user-configurable, with system defaults)
  5. FOR each candidate service (in priority order):
     a. RESOLVE all .0n field names to the service's specific field format
     b. ATTEMPT the API call with the service's authentication
     c. IF success: RETURN normalized result
     d. IF failure (rate limit, timeout, auth error):
        - LOG failure reason
        - CONTINUE to next candidate
  6. IF all candidates exhausted: RETURN error with list of attempted services
```

### 3.4 Portable Workflow File Format

Workflow files (`.0n` format, as defined in the 0n-spec standard) use capability identifiers and canonical fields:

```json
{
  "$0n": { "type": "workflow", "version": "1.1.0" },
  "name": "Welcome New Customer",
  "steps": [
    {
      "action": "emailsender.0n",
      "inputs": {
        "email.0n": "{{contact.email.0n}}",
        "fullname.0n": "{{contact.fullname.0n}}",
        "subject.0n": "Welcome to {{company.0n}}!",
        "message.0n": "Hi {{firstname.0n}}, thanks for joining."
      }
    },
    {
      "action": "crm.0n",
      "method": "create_contact",
      "inputs": {
        "email.0n": "{{contact.email.0n}}",
        "fullname.0n": "{{contact.fullname.0n}}",
        "company.0n": "{{contact.company.0n}}",
        "tags.0n": ["new-customer", "welcome-sent"],
        "source.0n": "0n-workflow"
      }
    }
  ]
}
```

This workflow runs identically whether the user has SendGrid or Resend (for email), and whether they use HubSpot or Salesforce (for CRM). The `.0n` fields resolve to the correct format for whichever service is selected at runtime.

---

## 4. PRIOR ART ANALYSIS

### 4.1 Zapier (Zapier, Inc.)

Zapier requires explicit service selection at each workflow step ("Zap step"). Users must choose "SendGrid" not "send email." Field mapping is manual — users map output fields from one step to input fields of the next via a visual mapper. There is no canonical field standard, no automatic field resolution, and no capability-based service routing. Workflows are non-portable between users with different service stacks. No automatic failover exists.

**Key differentiator:** 0n resolves fields and services automatically. Zapier requires manual configuration at every step.

### 4.2 Make (formerly Integromat, Celonis SE)

Make uses a visual workflow builder with explicit service modules. Each module is bound to a specific service. Field mapping is manual via a drag-and-drop interface. There is no universal field schema. Workflows cannot run on alternative services without reconstruction. No failover routing.

**Key differentiator:** Same as Zapier — 0n's canonical fields and capability routing are entirely absent from Make's architecture.

### 4.3 n8n (n8n GmbH)

n8n is open-source and provides "nodes" for each service. Like Zapier and Make, each node is hardcoded to a specific service. Field mapping is manual via expressions. n8n does support "error handling" nodes that can catch failures, but this requires the workflow author to explicitly build failover logic for each step. There is no automatic capability-based routing.

**Key differentiator:** n8n's error handling is manual and per-step. 0n's capability routing is automatic and system-wide.

### 4.4 Apache Camel (Apache Software Foundation)

Apache Camel is an enterprise integration framework that uses "components" (endpoints) for each service. Routes are defined in Java/XML/YAML with explicit component selection. Camel's "Content-Based Router" can route messages based on content, but this is content inspection, not capability-based service routing. There is no universal field schema. Camel does not inspect credential availability to select services.

**Key differentiator:** Camel routes are statically defined. 0n's routing is dynamic based on runtime credential availability.

### 4.5 MuleSoft (Salesforce, Inc.)

MuleSoft's Anypoint Platform provides "connectors" for services with a DataWeave transformation language for field mapping. DataWeave is powerful but requires explicit transformation scripts — there is no automatic canonical-to-service field resolution. Service selection is hardcoded in the flow definition. There is no capability abstraction layer.

**Key differentiator:** MuleSoft requires transformation scripts. 0n resolves fields automatically via registry lookup.

### 4.6 Microsoft Power Automate (Microsoft Corp.)

Power Automate uses "connectors" with explicit service binding. Dynamic content picker assists with field mapping but does not provide canonical field names. No capability-based routing. No automatic fallback.

**Key differentiator:** Same gap — no canonical fields, no capability routing.

### 4.7 Workato (Workato, Inc.)

Workato provides "recipes" with service-specific actions. Its "data mapping" uses a visual tree mapper. Workato does offer "secondary connectors" for some integrations but these must be explicitly configured, not automatically resolved. No universal field schema.

**Key differentiator:** Workato's secondary connectors are manually configured. 0n's fallback is automatic.

### 4.8 Tray.io (Tray.io, Inc.)

Tray uses a visual builder with explicit service selection. Has a "universal connector" for generic HTTP requests but this requires manual endpoint configuration, not automatic service routing. No canonical fields.

**Key differentiator:** Tray's "universal connector" is a generic HTTP client, not a capability router.

### 4.9 Model Context Protocol (MCP, Anthropic)

MCP provides a standard for AI models to discover and invoke tools exposed by servers. MCP handles tool discovery and invocation but does NOT provide:
- Field name normalization across services
- Capability-based routing (the AI must specify which tool/server to use)
- Automatic fallback between services
- Portable workflow files

**Key differentiator:** MCP is a tool invocation protocol. 0n's system is a capability resolution and field normalization layer that operates ON TOP of protocols like MCP.

### 4.10 GraphQL Federation (Apollo, Inc.)

GraphQL Federation allows querying across multiple data sources with a unified schema. However, Federation is for data querying, not action execution. It does not route capabilities, handle failover between services, or normalize field names across heterogeneous REST APIs.

**Key differentiator:** GraphQL Federation unifies data queries. 0n unifies action execution across heterogeneous APIs.

### 4.11 Kubernetes Service Mesh (CNCF)

Kubernetes service meshes (Istio, Linkerd) provide service discovery, load balancing, and failover for microservices. However, this operates at the network/infrastructure layer for services the user operates, not at the application layer across third-party SaaS APIs with heterogeneous authentication, field formats, and endpoint structures.

**Key differentiator:** Service meshes route network traffic. 0n routes API capability requests with field transformation.

---

## 5. CLAIMS OF NOVELTY

Based on the prior art analysis, the following aspects of the invention appear to be novel:

### Claim 1: Canonical Field Resolution System
A system and method for automatically translating canonical field identifiers (suffixed with a standard namespace indicator, e.g., `.0n`) into service-specific API field names, nested paths, array indices, and composite field structures, using a pre-defined mapping registry, at workflow runtime, without user intervention.

### Claim 2: Capability-Based Service Routing
A system and method for routing workflow action requests to available third-party services based on declared capability categories rather than explicit service identifiers, wherein the system inspects locally-stored credential manifests to determine which services are authenticated and available, selects an optimal service based on priority and health, and automatically fails over to alternative services providing the same capability upon primary service failure.

### Claim 3: Portable Workflow Files
A workflow definition format wherein steps specify capabilities and canonical field names rather than specific services and service-specific field formats, enabling the same workflow file to execute correctly across different users' service stacks without modification, provided each user has at least one authenticated service for each required capability.

### Claim 4: Combined Field Resolution and Capability Routing
The combination of Claims 1 and 2 operating together, wherein a workflow step specifying a capability (e.g., `emailsender.0n`) with canonical field inputs (e.g., `email.0n`, `subject.0n`) triggers simultaneous service selection (choosing which email service to use) and field translation (converting canonical fields to the selected service's format), in a single atomic resolution operation.

### Claim 5: Reverse Field Resolution
A method for determining the canonical field identifier given a service-specific field name and service identifier, enabling normalization of incoming data from any service into the universal canonical format for storage, comparison, or forwarding to other services.

---

## 6. COMMERCIAL SIGNIFICANCE

This system is the core differentiation of the 0nMCP platform (npm: `0nmcp`, 1,171 tools across 54 services). It enables:

1. **One-command onboarding** (`npx 0nmcp install`) — users connect their services and immediately run any workflow from the marketplace without field mapping
2. **Workflow marketplace** — workflows authored by any user work for all users, creating a network effect
3. **Reduced integration failure** — automatic fallback eliminates single-service dependency
4. **Non-technical accessibility** — users describe outcomes, never think about API field structures
5. **Platform lock-in for 0n** — the more services mapped, the more valuable the canonical standard becomes; competitors cannot replicate without building and maintaining the same mapping registry

---

## 7. RECOMMENDED PATENT FILING STRATEGY

1. **Utility Patent Application** — File for the combined system (field resolution + capability routing + portable workflows)
2. **Continuation Applications** — File separately for:
   - The field resolution registry and resolver algorithm
   - The capability-based service routing with automatic failover
   - The portable workflow file format specification
3. **International Filing** — Consider PCT filing for international protection given the global SaaS market

---

## 8. EXISTING IP PORTFOLIO

- **US Provisional #63/968,814** — Seal of Truth (content-addressed integrity verification), filed December 2025
- **US Provisional #63/990,046** — 0nVault Container System (7-layer encrypted portable containers), filed February 24, 2026
- **Proposed**: This filing would be the third provisional, covering the capability routing and field resolution system

---

**Prepared by:** AI Research Assistant (Claude Opus 4.6)
**For review by:** Michael A. Mento Jr., Inventor
**Next step:** Forward to patent attorney for prior art search and provisional application drafting
