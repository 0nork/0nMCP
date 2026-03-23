/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0n Lead Scorer — Webhook Handler
 * ═══════════════════════════════════════════════════════════════════════════
 * Listens for new/updated contacts and assigns an AI-powered lead score
 * (0-100) based on contact data quality and fit signals.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { crmRequest } from '../../lib/oauth.js';

/**
 * Handle an incoming webhook event.
 *
 * @param {object} event    — CRM webhook event
 * @param {object} context  — Execution context
 * @param {string} context.locationId  — CRM location ID
 * @param {string} context.accessToken — OAuth access token
 * @param {object} context.config      — App configuration
 * @param {Function} context.execute   — 0nMCP tool executor
 * @returns {Promise<object>}
 */
export async function handle(event, context) {
  const { locationId, accessToken, config, execute } = context;

  // Only process contact create/update events
  const validEvents = ['ContactCreate', 'ContactUpdate'];
  if (!validEvents.includes(event.type)) {
    return { skipped: true, reason: `Event type ${event.type} not handled` };
  }

  // Skip updates unless configured to re-score
  if (event.type === 'ContactUpdate' && !config.score_on_update) {
    return { skipped: true, reason: 'score_on_update disabled' };
  }

  const contactId = event.data?.contactId || event.data?.id || event.contactId;
  if (!contactId) {
    return { skipped: true, reason: 'No contactId in event' };
  }

  // Fetch full contact data
  let contact;
  try {
    const result = await crmRequest(`/contacts/${contactId}`, accessToken);
    contact = result.contact || result;
  } catch (err) {
    return { success: false, error: `Failed to fetch contact: ${err.message}` };
  }

  // Score the lead
  let score, reason;

  if (execute) {
    // Use AI scoring via 0nMCP
    try {
      const aiResult = await execute('anthropic_messages_create', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: buildScoringPrompt(config),
        messages: [{
          role: 'user',
          content: `Score this lead:\n${JSON.stringify(sanitizeContact(contact), null, 2)}`,
        }],
      });

      const aiText = aiResult?.content?.[0]?.text || aiResult?.text || '';
      const parsed = parseScoreResponse(aiText);
      score = parsed.score;
      reason = parsed.reason;
    } catch {
      // Fall back to rule-based scoring
      const ruleResult = ruleBasedScore(contact, config);
      score = ruleResult.score;
      reason = ruleResult.reason;
    }
  } else {
    // Rule-based scoring (no AI available)
    const ruleResult = ruleBasedScore(contact, config);
    score = ruleResult.score;
    reason = ruleResult.reason;
  }

  // Update the contact with score
  const customFields = [];
  // Note: In production, field IDs would be looked up from the install step
  // For now we use the field names which the CRM API also accepts
  try {
    await crmRequest(
      `/contacts/${contactId}`,
      accessToken,
      {
        method: 'PUT',
        body: {
          customFields: [
            { key: '0n Lead Score', field_value: String(score) },
            { key: '0n Score Reason', field_value: reason },
            { key: '0n Scored At', field_value: new Date().toISOString() },
          ],
        },
      }
    );
  } catch (err) {
    return { success: false, error: `Failed to update contact: ${err.message}` };
  }

  // Apply tier tags
  const hotThreshold = config.hot_threshold ?? 75;
  const warmThreshold = config.warm_threshold ?? 40;
  const tags = ['0n-scored'];

  if (score >= hotThreshold) {
    tags.push('0n-hot-lead');
  } else if (score >= warmThreshold) {
    tags.push('0n-warm-lead');
  } else {
    tags.push('0n-cold-lead');
  }

  try {
    await crmRequest(
      `/contacts/${contactId}/tags`,
      accessToken,
      { method: 'POST', body: { tags } }
    );
  } catch {
    // Non-fatal
  }

  return {
    success: true,
    contactId,
    score,
    reason,
    tier: score >= hotThreshold ? 'hot' : score >= warmThreshold ? 'warm' : 'cold',
    tags,
  };
}

// ─── Scoring Logic ──────────────────────────────────────────────

/**
 * Build the AI scoring system prompt.
 */
function buildScoringPrompt(config) {
  let prompt = `You are a lead scoring AI. Analyze the contact data and assign a score from 0-100.

Scoring criteria:
- Email quality: Business email domains score higher than free email (gmail, yahoo, etc.)
- Data completeness: More filled fields = higher score
- Company info: Having a company name and website is a strong signal
- Job title: Decision-maker titles (CEO, VP, Director, Owner, Manager) score higher
- Phone number: Having a valid phone number adds points
- Source: Referrals and organic score higher than cold sources

Respond ONLY in this exact format:
SCORE: [number]
REASON: [one sentence explanation]`;

  if (config.industry_keywords?.length > 0) {
    prompt += `\n\nBonus points if the contact data mentions any of these industry keywords: ${config.industry_keywords.join(', ')}`;
  }

  return prompt;
}

/**
 * Parse AI score response.
 */
function parseScoreResponse(text) {
  const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
  const reasonMatch = text.match(/REASON:\s*(.+)/i);

  return {
    score: scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 50,
    reason: reasonMatch ? reasonMatch[1].trim() : 'AI scoring completed',
  };
}

/**
 * Rule-based lead scoring fallback (no AI needed).
 */
function ruleBasedScore(contact, config) {
  let score = 0;
  const reasons = [];

  // Email quality (0-25 points)
  const email = contact.email || '';
  const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
  if (email) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && !freeProviders.includes(domain)) {
      score += 25;
      reasons.push('business email');
    } else if (email) {
      score += 10;
      reasons.push('free email');
    }
  }

  // Data completeness (0-20 points)
  const fields = ['firstName', 'lastName', 'phone', 'companyName', 'address1'];
  const filled = fields.filter(f => contact[f]).length;
  score += filled * 4;
  if (filled >= 4) reasons.push('complete profile');

  // Company info (0-15 points)
  if (contact.companyName) {
    score += 10;
    reasons.push('has company');
  }
  if (contact.website) {
    score += 5;
    reasons.push('has website');
  }

  // Job title (0-20 points)
  const title = (contact.title || contact.jobTitle || '').toLowerCase();
  const decisionMakers = ['ceo', 'cto', 'cfo', 'coo', 'vp', 'vice president', 'director', 'owner', 'founder', 'president', 'manager', 'head of'];
  if (decisionMakers.some(dm => title.includes(dm))) {
    score += 20;
    reasons.push('decision-maker title');
  } else if (title) {
    score += 5;
    reasons.push('has title');
  }

  // Phone (0-10 points)
  if (contact.phone) {
    score += 10;
    reasons.push('has phone');
  }

  // Source bonus (0-10 points)
  const source = (contact.source || '').toLowerCase();
  if (['referral', 'organic', 'direct'].some(s => source.includes(s))) {
    score += 10;
    reasons.push(`source: ${source}`);
  }

  // Industry keyword bonus
  if (config.industry_keywords?.length > 0) {
    const contactText = JSON.stringify(contact).toLowerCase();
    const matched = config.industry_keywords.filter(kw => contactText.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      score += Math.min(10, matched.length * 5);
      reasons.push(`industry match: ${matched.join(', ')}`);
    }
  }

  return {
    score: Math.min(100, score),
    reason: reasons.join('; ') || 'minimal data available',
  };
}

/**
 * Sanitize contact data before sending to AI (remove sensitive fields).
 */
function sanitizeContact(contact) {
  const { id, locationId, ...safe } = contact;
  // Remove any fields that look like tokens or passwords
  const sanitized = {};
  for (const [key, value] of Object.entries(safe)) {
    if (typeof value === 'string' && value.length > 100) continue; // Skip long blobs
    if (/token|password|secret|key/i.test(key)) continue;
    sanitized[key] = value;
  }
  return sanitized;
}
