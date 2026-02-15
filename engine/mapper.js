// ============================================================
// 0nMCP — Engine: Environment Variable Mapper
// ============================================================
// Maps common environment variable names to 0nMCP service
// keys and credential fields. Supports exact match, pattern
// match, and fuzzy matching.
// ============================================================

import { SERVICE_CATALOG } from "../catalog.js";

// ── Exact Env Var → Service Mapping (~75 entries) ──────────

const ENV_MAP = {
  // Stripe
  STRIPE_SECRET_KEY: { service: "stripe", field: "apiKey" },
  STRIPE_API_KEY: { service: "stripe", field: "apiKey" },
  STRIPE_KEY: { service: "stripe", field: "apiKey" },
  STRIPE_SK: { service: "stripe", field: "apiKey" },

  // OpenAI
  OPENAI_API_KEY: { service: "openai", field: "apiKey" },
  OPENAI_KEY: { service: "openai", field: "apiKey" },

  // Slack
  SLACK_BOT_TOKEN: { service: "slack", field: "botToken" },
  SLACK_TOKEN: { service: "slack", field: "botToken" },
  SLACK_OAUTH_TOKEN: { service: "slack", field: "botToken" },

  // Discord
  DISCORD_BOT_TOKEN: { service: "discord", field: "botToken" },
  DISCORD_TOKEN: { service: "discord", field: "botToken" },

  // GitHub
  GITHUB_TOKEN: { service: "github", field: "token" },
  GITHUB_PAT: { service: "github", field: "token" },
  GH_TOKEN: { service: "github", field: "token" },
  GITHUB_PERSONAL_ACCESS_TOKEN: { service: "github", field: "token" },

  // Twilio
  TWILIO_ACCOUNT_SID: { service: "twilio", field: "accountSid" },
  TWILIO_AUTH_TOKEN: { service: "twilio", field: "authToken" },
  TWILIO_SID: { service: "twilio", field: "accountSid" },

  // SendGrid
  SENDGRID_API_KEY: { service: "sendgrid", field: "apiKey" },
  SENDGRID_KEY: { service: "sendgrid", field: "apiKey" },

  // Resend
  RESEND_API_KEY: { service: "resend", field: "apiKey" },
  RESEND_KEY: { service: "resend", field: "apiKey" },

  // Airtable
  AIRTABLE_API_KEY: { service: "airtable", field: "apiKey" },
  AIRTABLE_PAT: { service: "airtable", field: "apiKey" },
  AIRTABLE_TOKEN: { service: "airtable", field: "apiKey" },

  // Notion
  NOTION_API_KEY: { service: "notion", field: "apiKey" },
  NOTION_TOKEN: { service: "notion", field: "apiKey" },
  NOTION_INTEGRATION_TOKEN: { service: "notion", field: "apiKey" },

  // Linear
  LINEAR_API_KEY: { service: "linear", field: "apiKey" },
  LINEAR_TOKEN: { service: "linear", field: "apiKey" },

  // Shopify
  SHOPIFY_ACCESS_TOKEN: { service: "shopify", field: "accessToken" },
  SHOPIFY_ADMIN_TOKEN: { service: "shopify", field: "accessToken" },
  SHOPIFY_STORE: { service: "shopify", field: "store" },
  SHOPIFY_STORE_DOMAIN: { service: "shopify", field: "store" },

  // HubSpot
  HUBSPOT_ACCESS_TOKEN: { service: "hubspot", field: "accessToken" },
  HUBSPOT_API_KEY: { service: "hubspot", field: "accessToken" },
  HUBSPOT_TOKEN: { service: "hubspot", field: "accessToken" },

  // Supabase
  SUPABASE_KEY: { service: "supabase", field: "apiKey" },
  SUPABASE_ANON_KEY: { service: "supabase", field: "apiKey" },
  SUPABASE_SERVICE_KEY: { service: "supabase", field: "apiKey" },
  SUPABASE_SERVICE_ROLE_KEY: { service: "supabase", field: "apiKey" },
  SUPABASE_API_KEY: { service: "supabase", field: "apiKey" },
  SUPABASE_PROJECT_REF: { service: "supabase", field: "projectRef" },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: { service: "supabase", field: "apiKey" },
  NEXT_PUBLIC_SUPABASE_URL: { service: "supabase", field: "projectRef", transform: "extractSupabaseRef" },

  // Calendly
  CALENDLY_API_KEY: { service: "calendly", field: "apiKey" },
  CALENDLY_TOKEN: { service: "calendly", field: "apiKey" },

  // Google Services
  GOOGLE_ACCESS_TOKEN: { service: "google_calendar", field: "access_token" },
  GMAIL_ACCESS_TOKEN: { service: "gmail", field: "access_token" },
  GOOGLE_SHEETS_TOKEN: { service: "google_sheets", field: "access_token" },
  GOOGLE_SHEETS_ACCESS_TOKEN: { service: "google_sheets", field: "access_token" },
  GOOGLE_DRIVE_TOKEN: { service: "google_drive", field: "access_token" },
  GOOGLE_DRIVE_ACCESS_TOKEN: { service: "google_drive", field: "access_token" },
  GOOGLE_CALENDAR_ACCESS_TOKEN: { service: "google_calendar", field: "access_token" },

  // Jira
  JIRA_EMAIL: { service: "jira", field: "email" },
  JIRA_API_TOKEN: { service: "jira", field: "apiToken" },
  JIRA_TOKEN: { service: "jira", field: "apiToken" },
  JIRA_DOMAIN: { service: "jira", field: "domain" },
  ATLASSIAN_EMAIL: { service: "jira", field: "email" },
  ATLASSIAN_API_TOKEN: { service: "jira", field: "apiToken" },

  // Zendesk
  ZENDESK_EMAIL: { service: "zendesk", field: "email" },
  ZENDESK_API_TOKEN: { service: "zendesk", field: "apiToken" },
  ZENDESK_TOKEN: { service: "zendesk", field: "apiToken" },
  ZENDESK_SUBDOMAIN: { service: "zendesk", field: "subdomain" },

  // Mailchimp
  MAILCHIMP_API_KEY: { service: "mailchimp", field: "apiKey" },
  MAILCHIMP_KEY: { service: "mailchimp", field: "apiKey" },

  // Zoom
  ZOOM_ACCESS_TOKEN: { service: "zoom", field: "access_token" },
  ZOOM_TOKEN: { service: "zoom", field: "access_token" },

  // Microsoft 365
  MICROSOFT_ACCESS_TOKEN: { service: "microsoft", field: "access_token" },
  MS_ACCESS_TOKEN: { service: "microsoft", field: "access_token" },
  AZURE_AD_TOKEN: { service: "microsoft", field: "access_token" },

  // MongoDB
  MONGODB_API_KEY: { service: "mongodb", field: "apiKey" },
  MONGODB_APP_ID: { service: "mongodb", field: "appId" },
  MONGO_API_KEY: { service: "mongodb", field: "apiKey" },
  MONGO_APP_ID: { service: "mongodb", field: "appId" },

  // CRM
  CRM_ACCESS_TOKEN: { service: "crm", field: "access_token" },
  CRM_TOKEN: { service: "crm", field: "access_token" },
};

// ── Service name aliases for fuzzy matching ────────────────

const SERVICE_ALIASES = {
  stripe_api: "stripe",
  open_ai: "openai",
  send_grid: "sendgrid",
  air_table: "airtable",
  hub_spot: "hubspot",
  mail_chimp: "mailchimp",
  google_cal: "google_calendar",
  gcal: "google_calendar",
  gsheets: "google_sheets",
  gdrive: "google_drive",
  ms365: "microsoft",
  outlook: "microsoft",
  teams: "microsoft",
  onedrive: "microsoft",
  mongo: "mongodb",
  gh: "github",
};

// ── Value transformations ──────────────────────────────────

const TRANSFORMS = {
  extractSupabaseRef(value) {
    // Extract project ref from Supabase URL: https://{ref}.supabase.co
    const match = value.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/);
    return match ? match[1] : value;
  },
};

/**
 * Map parsed entries to 0nMCP services.
 * @param {Array<{ key: string, value: string }>} entries
 * @returns {{ mapped: Array<MappedCredential>, unmapped: Array<{ key: string, value: string }> }}
 */
export function mapEnvVars(entries) {
  const mapped = [];
  const unmapped = [];

  for (const entry of entries) {
    // Check for direct JSON path format: "stripe.apiKey"
    if (entry.key.includes(".")) {
      const [service, field] = entry.key.split(".", 2);
      if (SERVICE_CATALOG[service]) {
        mapped.push({
          service,
          field,
          value: entry.value,
          envVar: entry.key,
          confidence: "exact",
        });
        continue;
      }
    }

    // Exact match
    const upperKey = entry.key.toUpperCase();
    const exact = ENV_MAP[upperKey] || ENV_MAP[entry.key];
    if (exact) {
      let value = entry.value;
      if (exact.transform && TRANSFORMS[exact.transform]) {
        value = TRANSFORMS[exact.transform](value);
      }
      mapped.push({
        service: exact.service,
        field: exact.field,
        value,
        envVar: entry.key,
        confidence: "exact",
      });
      continue;
    }

    // Pattern match: {SERVICE}_API_KEY, {SERVICE}_SECRET_KEY, {SERVICE}_TOKEN
    const patternResult = patternMatch(upperKey, entry.value);
    if (patternResult) {
      mapped.push({ ...patternResult, envVar: entry.key, confidence: "pattern" });
      continue;
    }

    unmapped.push(entry);
  }

  return { mapped, unmapped };
}

/**
 * Try pattern matching against known service names.
 */
function patternMatch(key, value) {
  const patterns = [
    { regex: /^([A-Z_]+?)_(?:SECRET_KEY|API_KEY|APIKEY)$/i, field: "apiKey" },
    { regex: /^([A-Z_]+?)_(?:BOT_TOKEN|BOT_KEY)$/i, field: "botToken" },
    { regex: /^([A-Z_]+?)_(?:ACCESS_TOKEN|OAUTH_TOKEN)$/i, field: "access_token" },
    { regex: /^([A-Z_]+?)_(?:AUTH_TOKEN)$/i, field: "authToken" },
    { regex: /^([A-Z_]+?)_(?:TOKEN|KEY)$/i, field: "apiKey" },
  ];

  for (const { regex, field } of patterns) {
    const match = key.match(regex);
    if (!match) continue;

    const rawName = match[1].toLowerCase().replace(/_/g, "");
    // Check catalog directly
    if (SERVICE_CATALOG[rawName]) {
      return { service: rawName, field, value };
    }
    // Check aliases
    const alias = SERVICE_ALIASES[match[1].toLowerCase()] || SERVICE_ALIASES[rawName];
    if (alias && SERVICE_CATALOG[alias]) {
      return { service: alias, field, value };
    }
  }

  return null;
}

/**
 * Group mapped credentials by service.
 * @param {Array<MappedCredential>} mapped
 * @returns {Record<string, { credentials: Record<string, string>, envVars: string[] }>}
 */
export function groupByService(mapped) {
  const groups = {};

  for (const m of mapped) {
    if (!groups[m.service]) {
      groups[m.service] = { credentials: {}, envVars: [] };
    }
    groups[m.service].credentials[m.field] = m.value;
    groups[m.service].envVars.push(m.envVar);
  }

  return groups;
}

/**
 * Validate that all required credential keys are present for a service.
 * @param {string} service
 * @param {Record<string, string>} credentials
 * @returns {{ valid: boolean, missing: string[], extra: string[] }}
 */
export function validateMapping(service, credentials) {
  const catalog = SERVICE_CATALOG[service];
  if (!catalog) return { valid: false, missing: [], extra: [], error: `Unknown service: ${service}` };

  const required = catalog.credentialKeys || [];
  const provided = Object.keys(credentials);

  const missing = required.filter(k => !credentials[k]);
  const extra = provided.filter(k => !required.includes(k));

  return { valid: missing.length === 0, missing, extra };
}
