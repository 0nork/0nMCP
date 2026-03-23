/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP — CRM Marketplace OAuth Flow
 * ═══════════════════════════════════════════════════════════════════════════
 * Shared OAuth handler for all CRM marketplace apps.
 * Handles authorization, token exchange, refresh, and per-location storage.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AUTH_URL = 'https://marketplace.leadconnectorhq.com/oauth/chooselocation';
const TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token';
const CRM_API_BASE = 'https://services.leadconnectorhq.com';

/**
 * Generate the OAuth authorization URL.
 * User is redirected here to choose which CRM location to connect.
 *
 * @param {object} opts
 * @param {string} opts.clientId      — CRM marketplace app Client ID
 * @param {string} opts.redirectUri   — OAuth callback URL
 * @param {string[]} opts.scopes      — Requested permission scopes
 * @param {string} [opts.state]       — Opaque state for CSRF protection
 * @returns {string} Authorization URL
 */
export function buildAuthUrl({ clientId, redirectUri, scopes, state }) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
  });
  if (state) params.set('state', state);
  return `${AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 *
 * @param {object} opts
 * @param {string} opts.code          — Authorization code from callback
 * @param {string} opts.clientId      — CRM app Client ID
 * @param {string} opts.clientSecret  — CRM app Client Secret
 * @param {string} opts.redirectUri   — Must match the original redirect URI
 * @returns {Promise<TokenResponse>}
 */
export async function exchangeCode({ code, clientId, clientSecret, redirectUri }) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return normalizeTokenResponse(data);
}

/**
 * Refresh an expired access token.
 *
 * @param {object} opts
 * @param {string} opts.refreshToken  — The refresh token
 * @param {string} opts.clientId      — CRM app Client ID
 * @param {string} opts.clientSecret  — CRM app Client Secret
 * @returns {Promise<TokenResponse>}
 */
export async function refreshAccessToken({ refreshToken, clientId, clientSecret }) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return normalizeTokenResponse(data);
}

/**
 * Get a valid access token for a location, refreshing if needed.
 * Requires a storage backend (Supabase by default).
 *
 * @param {object} opts
 * @param {string} opts.locationId    — CRM location ID
 * @param {string} opts.clientId      — CRM app Client ID
 * @param {string} opts.clientSecret  — CRM app Client Secret
 * @param {object} opts.supabase      — Supabase client instance
 * @param {string} [opts.table]       — Table name (default: 'marketplace_oauth_tokens')
 * @returns {Promise<string>} Valid access token
 */
export async function getAccessToken({ locationId, clientId, clientSecret, supabase, table = 'marketplace_oauth_tokens' }) {
  // Fetch stored tokens
  const { data: row, error } = await supabase
    .from(table)
    .select('*')
    .eq('location_id', locationId)
    .single();

  if (error || !row) {
    throw new Error(`No OAuth tokens found for location ${locationId}`);
  }

  // Check if token is still valid (with 5-minute buffer)
  const expiresAt = new Date(row.expires_at).getTime();
  const now = Date.now();
  const BUFFER_MS = 5 * 60 * 1000;

  if (now < expiresAt - BUFFER_MS) {
    return row.access_token;
  }

  // Token expired or about to — refresh it
  const tokens = await refreshAccessToken({
    refreshToken: row.refresh_token,
    clientId,
    clientSecret,
  });

  // Update stored tokens
  await supabase.from(table).update({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expires_at: tokens.expiresAt,
    updated_at: new Date().toISOString(),
  }).eq('location_id', locationId);

  return tokens.accessToken;
}

/**
 * Store OAuth tokens for a newly connected location.
 *
 * @param {object} opts
 * @param {string} opts.locationId    — CRM location ID
 * @param {string} opts.companyId     — CRM company/agency ID
 * @param {TokenResponse} opts.tokens — Token data from exchange
 * @param {string} opts.appSlug       — App identifier (e.g., '0n-autoresponder')
 * @param {object} opts.supabase      — Supabase client instance
 * @param {string} [opts.table]       — Table name
 * @returns {Promise<void>}
 */
export async function storeTokens({ locationId, companyId, tokens, appSlug, supabase, table = 'marketplace_oauth_tokens' }) {
  const row = {
    location_id: locationId,
    company_id: companyId,
    app_slug: appSlug,
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expires_at: tokens.expiresAt,
    scopes: tokens.scopes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Upsert — update if location+app already exists
  const { error } = await supabase
    .from(table)
    .upsert(row, { onConflict: 'location_id,app_slug' });

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

/**
 * Revoke stored tokens when a user uninstalls an app.
 *
 * @param {object} opts
 * @param {string} opts.locationId — CRM location ID
 * @param {string} opts.appSlug    — App identifier
 * @param {object} opts.supabase   — Supabase client instance
 * @param {string} [opts.table]    — Table name
 * @returns {Promise<void>}
 */
export async function revokeTokens({ locationId, appSlug, supabase, table = 'marketplace_oauth_tokens' }) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('location_id', locationId)
    .eq('app_slug', appSlug);

  if (error) {
    throw new Error(`Failed to revoke tokens: ${error.message}`);
  }
}

/**
 * Make an authenticated CRM API request.
 *
 * @param {string} path        — API path (e.g., '/contacts/v1/contacts')
 * @param {string} accessToken — Valid OAuth access token
 * @param {object} [options]   — Fetch options (method, body, etc.)
 * @returns {Promise<any>}
 */
export async function crmRequest(path, accessToken, options = {}) {
  const url = `${CRM_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CRM API error (${res.status} ${path}): ${text}`);
  }

  return res.json();
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * @typedef {object} TokenResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} expiresAt     — ISO timestamp
 * @property {string[]} scopes
 * @property {string} locationId
 * @property {string} companyId
 * @property {string} userId
 */

function normalizeTokenResponse(data) {
  const expiresInMs = (data.expires_in || 86400) * 1000;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    scopes: (data.scope || '').split(' ').filter(Boolean),
    locationId: data.locationId || data.location_id || null,
    companyId: data.companyId || data.company_id || null,
    userId: data.userId || data.user_id || null,
  };
}
