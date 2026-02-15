// ============================================================
// 0nMCP — Engine: API Key Validator
// ============================================================
// Verifies API credentials by making lightweight, read-only
// test calls to each service. All calls are non-destructive.
// ============================================================

import { SERVICE_CATALOG } from "../catalog.js";

const TIMEOUT_MS = 10000;

// ── Verification endpoints per service ─────────────────────

const VERIFICATION_ENDPOINTS = {
  stripe: {
    url: "https://api.stripe.com/v1/balance",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status === 200,
  },
  openai: {
    url: "https://api.openai.com/v1/models",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status === 200,
  },
  slack: {
    url: "https://slack.com/api/auth.test",
    method: "POST",
    headers: (c) => ({ Authorization: `Bearer ${c.botToken}`, "Content-Type": "application/json" }),
    check: (r, d) => d?.ok === true,
  },
  discord: {
    url: "https://discord.com/api/v10/users/@me",
    method: "GET",
    headers: (c) => ({ Authorization: `Bot ${c.botToken}` }),
    check: (r) => r.status === 200,
  },
  github: {
    url: "https://api.github.com/user",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.token}`, "User-Agent": "0nMCP-Engine", Accept: "application/vnd.github+json" }),
    check: (r) => r.status === 200,
  },
  twilio: {
    url: (c) => `https://api.twilio.com/2010-04-01/Accounts/${c.accountSid}.json`,
    method: "GET",
    headers: (c) => ({ Authorization: "Basic " + Buffer.from(`${c.accountSid}:${c.authToken}`).toString("base64") }),
    check: (r) => r.status === 200,
  },
  sendgrid: {
    url: "https://api.sendgrid.com/v3/scopes",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status === 200,
  },
  resend: {
    url: "https://api.resend.com/domains",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status === 200,
  },
  airtable: {
    url: "https://api.airtable.com/v0/meta/bases",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status === 200,
  },
  notion: {
    url: "https://api.notion.com/v1/users/me",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}`, "Notion-Version": "2022-06-28" }),
    check: (r) => r.status === 200,
  },
  linear: {
    url: "https://api.linear.app/graphql",
    method: "POST",
    headers: (c) => ({ Authorization: c.apiKey, "Content-Type": "application/json" }),
    body: JSON.stringify({ query: "{ viewer { id } }" }),
    check: (r, d) => !!d?.data?.viewer?.id,
  },
  shopify: {
    url: (c) => `https://${c.store}.myshopify.com/admin/api/2024-01/shop.json`,
    method: "GET",
    headers: (c) => ({ "X-Shopify-Access-Token": c.accessToken }),
    check: (r) => r.status === 200,
  },
  hubspot: {
    url: "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.accessToken}` }),
    check: (r) => r.status === 200,
  },
  supabase: {
    url: (c) => `https://${c.projectRef}.supabase.co/rest/v1/`,
    method: "GET",
    headers: (c) => ({ apikey: c.apiKey, Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status <= 404, // 200 or 404 both mean auth works
  },
  calendly: {
    url: "https://api.calendly.com/users/me",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.apiKey}` }),
    check: (r) => r.status === 200,
  },
  google_calendar: {
    url: "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}` }),
    check: (r) => r.status === 200,
  },
  gmail: {
    url: "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}` }),
    check: (r) => r.status === 200,
  },
  google_sheets: {
    url: "https://sheets.googleapis.com/v4/spreadsheets",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}` }),
    check: (r) => r.status === 200 || r.status === 400, // 400 = auth works, no spreadsheet ID
  },
  google_drive: {
    url: "https://www.googleapis.com/drive/v3/about?fields=user",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}` }),
    check: (r) => r.status === 200,
  },
  jira: {
    url: (c) => `https://${c.domain}.atlassian.net/rest/api/3/myself`,
    method: "GET",
    headers: (c) => ({ Authorization: "Basic " + Buffer.from(`${c.email}:${c.apiToken}`).toString("base64"), Accept: "application/json" }),
    check: (r) => r.status === 200,
  },
  zendesk: {
    url: (c) => `https://${c.subdomain}.zendesk.com/api/v2/users/me.json`,
    method: "GET",
    headers: (c) => ({ Authorization: "Basic " + Buffer.from(`${c.email}/token:${c.apiToken}`).toString("base64") }),
    check: (r) => r.status === 200,
  },
  mailchimp: {
    url: (c) => {
      const dc = c.apiKey.includes("-") ? c.apiKey.split("-").pop() : "us1";
      return `https://${dc}.api.mailchimp.com/3.0/`;
    },
    method: "GET",
    headers: (c) => ({ Authorization: "Basic " + Buffer.from(`anystring:${c.apiKey}`).toString("base64") }),
    check: (r) => r.status === 200,
  },
  zoom: {
    url: "https://api.zoom.us/v2/users/me",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}` }),
    check: (r) => r.status === 200,
  },
  microsoft: {
    url: "https://graph.microsoft.com/v1.0/me",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}` }),
    check: (r) => r.status === 200,
  },
  mongodb: {
    url: (c) => `https://data.mongodb-api.com/app/${c.appId}/endpoint/data/v1/action/find`,
    method: "POST",
    headers: (c) => ({ "api-key": c.apiKey, "Content-Type": "application/json" }),
    body: JSON.stringify({ dataSource: "Cluster0", database: "test", collection: "test" }),
    check: (r) => r.status === 200 || r.status === 400, // 400 = auth works, bad params
  },
  crm: {
    url: "https://services.leadconnectorhq.com/contacts/?limit=1",
    method: "GET",
    headers: (c) => ({ Authorization: `Bearer ${c.access_token}`, Version: "2021-07-28" }),
    check: (r) => r.status === 200,
  },
};

/**
 * Verify credentials for a single service.
 * @param {string} service
 * @param {Record<string, string>} credentials
 * @returns {Promise<{ valid: boolean, status: number, message: string, latency_ms: number }>}
 */
export async function verifyCredentials(service, credentials) {
  const endpoint = VERIFICATION_ENDPOINTS[service];
  if (!endpoint) {
    return { valid: false, status: 0, message: "No verification endpoint available", latency_ms: 0, skipped: true };
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = typeof endpoint.url === "function" ? endpoint.url(credentials) : endpoint.url;
    const headers = endpoint.headers(credentials);
    const options = { method: endpoint.method, headers, signal: controller.signal };

    if (endpoint.body && endpoint.method !== "GET") {
      options.body = endpoint.body;
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    const latency_ms = Date.now() - start;

    const valid = endpoint.check(response, data);
    return {
      valid,
      status: response.status,
      message: valid ? "Credentials verified" : `Verification failed (HTTP ${response.status})`,
      latency_ms,
    };
  } catch (err) {
    return {
      valid: false,
      status: 0,
      message: err.name === "AbortError" ? "Verification timed out" : err.message,
      latency_ms: Date.now() - start,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Verify all connected services in parallel.
 * @param {Record<string, { credentials: Record<string, string> }>} connections
 * @returns {Promise<{ results: Record<string, object>, summary: { total: number, valid: number, invalid: number, skipped: number } }>}
 */
export async function verifyAll(connections) {
  const entries = Object.entries(connections);
  const results = {};
  const summary = { total: entries.length, valid: 0, invalid: 0, skipped: 0 };

  // Run in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const promises = batch.map(([service, conn]) =>
      verifyCredentials(service, conn.credentials).then(r => ({ service, ...r }))
    );
    const batchResults = await Promise.allSettled(promises);

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        const r = result.value;
        results[r.service] = r;
        if (r.skipped) summary.skipped++;
        else if (r.valid) summary.valid++;
        else summary.invalid++;
      }
    }
  }

  return { results, summary };
}
