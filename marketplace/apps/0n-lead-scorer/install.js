/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0n Lead Scorer — Installation Handler
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { crmRequest } from '../../lib/oauth.js';

/**
 * Called when a user installs 0n Lead Scorer into their CRM location.
 * Creates the custom fields needed for lead scoring.
 *
 * @param {string} locationId  — CRM location ID
 * @param {string} accessToken — OAuth access token
 * @param {object} config      — User-provided configuration
 * @returns {Promise<object>} Setup result
 */
export async function onInstall(locationId, accessToken, config = {}) {
  const results = { steps: [], fieldIds: {} };

  // Create "0n Lead Score" custom field
  const fields = [
    { name: '0n Lead Score', dataType: 'NUMERICAL' },
    { name: '0n Score Reason', dataType: 'TEXT' },
    { name: '0n Scored At', dataType: 'TEXT' },
  ];

  for (const field of fields) {
    try {
      const result = await crmRequest(
        `/locations/${locationId}/customFields`,
        accessToken,
        {
          method: 'POST',
          body: { ...field, model: 'contact' },
        }
      );
      const fieldId = result.customField?.id;
      results.fieldIds[field.name] = fieldId;
      results.steps.push({
        step: `create_field_${field.name}`,
        status: 'ok',
        fieldId,
      });
    } catch (err) {
      results.steps.push({
        step: `create_field_${field.name}`,
        status: 'warning',
        message: `May already exist: ${err.message}`,
      });
    }
  }

  // Store config defaults
  results.config = {
    hot_threshold: config.hot_threshold ?? 75,
    warm_threshold: config.warm_threshold ?? 40,
    score_on_update: config.score_on_update ?? false,
    industry_keywords: config.industry_keywords ?? [],
  };

  results.steps.push({ step: 'config_saved', status: 'ok' });

  return results;
}

/**
 * Called when a user uninstalls 0n Lead Scorer.
 *
 * @param {string} locationId  — CRM location ID
 * @param {string} accessToken — OAuth access token
 */
export async function onUninstall(locationId, accessToken) {
  // Custom fields and tags are left in place — they contain valuable data
  // Users can manually delete them if desired
}
