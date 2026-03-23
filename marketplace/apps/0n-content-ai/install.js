/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0n Content AI — Installation Handler
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { crmRequest } from '../../lib/oauth.js';

/**
 * Called when a user installs 0n Content AI into their CRM location.
 * Fetches location info to pre-populate content generation context.
 *
 * @param {string} locationId  — CRM location ID
 * @param {string} accessToken — OAuth access token
 * @param {object} config      — User-provided configuration
 * @returns {Promise<object>} Setup result
 */
export async function onInstall(locationId, accessToken, config = {}) {
  const results = { steps: [] };

  // Fetch location info to seed business context
  let locationInfo = {};
  try {
    const loc = await crmRequest(`/locations/${locationId}`, accessToken);
    locationInfo = loc.location || loc;
    results.steps.push({
      step: 'fetch_location',
      status: 'ok',
      businessName: locationInfo.name,
    });
  } catch (err) {
    results.steps.push({
      step: 'fetch_location',
      status: 'warning',
      message: err.message,
    });
  }

  // Build config with location defaults
  results.config = {
    business_name: config.business_name || locationInfo.name || '',
    business_description: config.business_description || '',
    tone: config.tone || 'professional',
    target_audience: config.target_audience || '',
    max_tokens: config.max_tokens || 1000,
  };

  results.steps.push({ step: 'config_saved', status: 'ok' });

  return results;
}

/**
 * Called when a user uninstalls 0n Content AI.
 *
 * @param {string} locationId  — CRM location ID
 * @param {string} accessToken — OAuth access token
 */
export async function onUninstall(locationId, accessToken) {
  // No cleanup needed — generated content stays in CRM
}
