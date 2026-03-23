/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0n AutoResponder — Webhook Handler
 * ═══════════════════════════════════════════════════════════════════════════
 * Listens for new inbound conversation messages and sends AI-generated
 * auto-replies using 0nMCP + Claude.
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
 * @param {object} context.config      — App configuration for this location
 * @param {Function} context.execute   — 0nMCP tool executor
 * @returns {Promise<object>}
 */
export async function handle(event, context) {
  const { locationId, accessToken, config, execute } = context;

  // Only process inbound conversation messages
  if (event.type !== 'ConversationMessage') {
    return { skipped: true, reason: 'Not a conversation message event' };
  }

  const message = event.data || event;

  // Skip outbound messages (we sent them)
  if (message.direction === 'outbound' || message.messageType === 'outbound') {
    return { skipped: true, reason: 'Outbound message — skipping' };
  }

  // Check keyword triggers (if configured)
  if (config.keyword_triggers?.length > 0) {
    const body = (message.body || message.message || '').toLowerCase();
    const matched = config.keyword_triggers.some(kw => body.includes(kw.toLowerCase()));
    if (!matched) {
      return { skipped: true, reason: 'No keyword match' };
    }
  }

  // Check business hours (if configured)
  if (config.business_hours_only) {
    if (!isWithinBusinessHours(config.business_hours_start, config.business_hours_end)) {
      return { skipped: true, reason: 'Outside business hours' };
    }
  }

  // Apply reply delay
  const delayMs = (config.reply_delay_seconds || 30) * 1000;
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 60000)));
  }

  // Get conversation context (recent messages)
  const conversationId = message.conversationId || message.conversation_id;
  if (!conversationId) {
    return { skipped: true, reason: 'No conversationId in event' };
  }

  let recentMessages = [];
  try {
    const msgResult = await crmRequest(
      `/conversations/${conversationId}/messages`,
      accessToken
    );
    recentMessages = (msgResult.messages || []).slice(-10); // Last 10 messages for context
  } catch {
    // Continue without history — we can still reply
  }

  // Get contact info for personalization
  let contactName = 'there';
  const contactId = message.contactId || message.contact_id;
  if (contactId) {
    try {
      const contact = await crmRequest(`/contacts/${contactId}`, accessToken);
      contactName = contact.contact?.firstName || contact.contact?.name || 'there';
    } catch {
      // Use default
    }
  }

  // Build conversation context for AI
  const conversationContext = recentMessages.map(msg => ({
    role: msg.direction === 'inbound' ? 'user' : 'assistant',
    content: msg.body || msg.message || '',
  }));

  // Generate AI response
  const systemPrompt = config.system_prompt ||
    'You are a helpful business assistant. Answer questions concisely and professionally.';

  let aiResponse;
  try {
    // Use 0nMCP execute if available, otherwise build the prompt directly
    if (execute) {
      const result = await execute('anthropic_messages_create', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `${systemPrompt}\n\nThe customer's name is ${contactName}. Keep responses under 3 sentences unless a longer answer is needed.`,
        messages: conversationContext.length > 0
          ? conversationContext
          : [{ role: 'user', content: message.body || message.message || 'Hello' }],
      });
      aiResponse = result?.content?.[0]?.text || result?.text || 'Thank you for reaching out! A team member will be with you shortly.';
    } else {
      aiResponse = 'Thank you for reaching out! A team member will be with you shortly.';
    }
  } catch {
    aiResponse = 'Thank you for your message! A team member will follow up with you shortly.';
  }

  // Send the reply through CRM conversations API
  try {
    await crmRequest(
      `/conversations/messages`,
      accessToken,
      {
        method: 'POST',
        body: {
          type: 'SMS', // or Email, depending on conversation type
          contactId,
          message: aiResponse,
          conversationId,
        },
      }
    );
  } catch (err) {
    return { success: false, error: `Failed to send reply: ${err.message}` };
  }

  // Tag the contact as auto-replied
  if (contactId) {
    try {
      await crmRequest(
        `/contacts/${contactId}/tags`,
        accessToken,
        { method: 'POST', body: { tags: ['0n-autoresponder-replied'] } }
      );
    } catch {
      // Non-fatal
    }
  }

  return {
    success: true,
    conversationId,
    contactId,
    responseLength: aiResponse.length,
  };
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Check if current time is within business hours.
 * Uses simple hour comparison (location timezone not accounted for in v1).
 */
function isWithinBusinessHours(startStr = '09:00', endStr = '17:00') {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
