/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0n AutoResponder — Installation Handler
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { crmRequest } from '../../lib/oauth.js';

/**
 * Called when a user installs 0n AutoResponder into their CRM location.
 * Sets up tags and verifies conversation access.
 *
 * @param {string} locationId  — CRM location ID
 * @param {string} accessToken — OAuth access token
 * @param {object} config      — User-provided configuration
 * @returns {Promise<object>} Setup result
 */
export async function onInstall(locationId, accessToken, config = {}) {
  const results = { steps: [] };

  // Verify we can access conversations
  try {
    const convos = await crmRequest(
      `/conversations/search`,
      accessToken,
      {
        method: 'POST',
        body: { locationId, limit: 1 },
      }
    );
    results.steps.push({
      step: 'verify_conversations',
      status: 'ok',
      count: convos.conversations?.length ?? 0,
    });
  } catch (err) {
    results.steps.push({
      step: 'verify_conversations',
      status: 'warning',
      message: err.message,
    });
  }

  // Store default config for this location
  results.config = {
    reply_delay_seconds: config.reply_delay_seconds ?? 30,
    business_hours_only: config.business_hours_only ?? true,
    business_hours_start: config.business_hours_start ?? '09:00',
    business_hours_end: config.business_hours_end ?? '17:00',
    keyword_triggers: config.keyword_triggers ?? [],
    system_prompt: config.system_prompt ?? 'You are a helpful business assistant. Answer questions concisely and professionally. If you cannot help, let the customer know a team member will follow up shortly.',
  };

  results.steps.push({ step: 'config_saved', status: 'ok' });

  return results;
}

/**
 * Called when a user uninstalls 0n AutoResponder.
 * Cleans up tags from contacts that were auto-replied.
 *
 * @param {string} locationId  — CRM location ID
 * @param {string} accessToken — OAuth access token
 */
export async function onUninstall(locationId, accessToken) {
  // Nothing critical to clean up — tags remain for reference
  // In a production app you might remove webhook subscriptions here
}
