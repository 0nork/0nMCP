/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP — CRM Marketplace Webhook Handler
 * ═══════════════════════════════════════════════════════════════════════════
 * Shared webhook verification and event routing for marketplace apps.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify a CRM webhook signature.
 *
 * @param {string} payload   — Raw request body string
 * @param {string} signature — Value of the X-Hook-Secret or signature header
 * @param {string} secret    — Your app's webhook signing secret
 * @returns {{ verified: boolean, error?: string }}
 */
export function verifyWebhookSignature(payload, signature, secret) {
  try {
    if (!signature || !secret) {
      return { verified: false, error: 'Missing signature or secret' };
    }

    const computed = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'hex');
    const computedBuffer = Buffer.from(computed, 'hex');

    if (sigBuffer.length !== computedBuffer.length) {
      return { verified: false, error: 'Signature length mismatch' };
    }

    const verified = timingSafeEqual(sigBuffer, computedBuffer);
    return { verified };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * App handler registry.
 * Maps app slugs to their handler modules.
 * @type {Map<string, { handle: Function }>}
 */
const appHandlers = new Map();

/**
 * Register an app's webhook handler.
 *
 * @param {string} appSlug — App identifier (e.g., '0n-autoresponder')
 * @param {{ handle: Function }} handler — Handler module with a handle() export
 */
export function registerApp(appSlug, handler) {
  appHandlers.set(appSlug, handler);
}

/**
 * Route an incoming webhook event to the correct app handler.
 *
 * @param {object} opts
 * @param {string} opts.appSlug      — Target app
 * @param {object} opts.event        — Parsed webhook event
 * @param {object} opts.context      — Execution context (locationId, accessToken, config, execute)
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function routeEvent({ appSlug, event, context }) {
  const handler = appHandlers.get(appSlug);

  if (!handler) {
    return { success: false, error: `No handler registered for app: ${appSlug}` };
  }

  try {
    const result = await handler.handle(event, context);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Process an incoming webhook request end-to-end.
 * Verifies the signature, parses the event, and routes to the correct handler.
 *
 * @param {object} opts
 * @param {string} opts.rawBody      — Raw request body
 * @param {string} opts.signature    — Webhook signature header value
 * @param {string} opts.secret       — Webhook signing secret
 * @param {string} opts.appSlug      — Target app slug
 * @param {object} opts.context      — Handler context
 * @param {number} [opts.maxRetries] — Max retry attempts on failure (default: 2)
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function processWebhook({ rawBody, signature, secret, appSlug, context, maxRetries = 2 }) {
  // Step 1: Verify signature
  const verification = verifyWebhookSignature(rawBody, signature, secret);
  if (!verification.verified) {
    return { success: false, error: `Webhook verification failed: ${verification.error}` };
  }

  // Step 2: Parse event
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { success: false, error: 'Invalid JSON payload' };
  }

  // Step 3: Route to handler with retry
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await routeEvent({ appSlug, event, context });

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Don't retry on handler-not-found errors
    if (result.error?.includes('No handler registered')) {
      return result;
    }

    // Exponential backoff before retry
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
    }
  }

  return { success: false, error: `Failed after ${maxRetries + 1} attempts: ${lastError}` };
}

/**
 * Create an Express/Next.js compatible middleware for webhook processing.
 *
 * @param {object} opts
 * @param {string} opts.secret       — Webhook signing secret
 * @param {Function} opts.getContext — Async function(locationId) => context object
 * @returns {Function} Middleware function(req, res)
 */
export function createWebhookMiddleware({ secret, getContext }) {
  return async (req, res) => {
    try {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const signature = req.headers['x-hook-secret'] || req.headers['x-crm-signature'] || '';
      const appSlug = req.params?.appSlug || req.query?.app || '';

      if (!appSlug) {
        return res.status(400).json({ error: 'Missing app slug' });
      }

      // Parse event to get locationId
      let event;
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }

      const locationId = event.locationId || event.location_id || event.data?.locationId;
      if (!locationId) {
        return res.status(400).json({ error: 'Missing locationId in event' });
      }

      // Build context for this location
      const context = await getContext(locationId);

      const result = await processWebhook({
        rawBody,
        signature,
        secret,
        appSlug,
        context,
      });

      const status = result.success ? 200 : 500;
      return res.status(status).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
}
