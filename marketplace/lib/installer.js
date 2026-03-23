/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP — CRM Marketplace App Installer
 * ═══════════════════════════════════════════════════════════════════════════
 * Helpers for installing, configuring, and managing marketplace apps
 * within CRM locations.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { crmRequest } from './oauth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APPS_DIR = join(__dirname, '..', 'apps');

/**
 * Load an app's manifest (app.json).
 *
 * @param {string} appSlug — App directory name (e.g., '0n-autoresponder')
 * @returns {Promise<object>} Parsed app manifest
 */
export async function loadManifest(appSlug) {
  const manifestPath = join(APPS_DIR, appSlug, 'app.json');
  const raw = await readFile(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * List all available marketplace apps.
 *
 * @returns {Promise<object[]>} Array of app manifests
 */
export async function listApps() {
  const { readdir } = await import('fs/promises');
  const entries = await readdir(APPS_DIR, { withFileTypes: true });
  const apps = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      try {
        const manifest = await loadManifest(entry.name);
        apps.push({ slug: entry.name, ...manifest });
      } catch {
        // Skip directories without valid app.json
      }
    }
  }

  return apps;
}

/**
 * Install an app into a CRM location.
 * Runs the app's onInstall hook and sets up any required custom fields/tags.
 *
 * @param {object} opts
 * @param {string} opts.appSlug      — App identifier
 * @param {string} opts.locationId   — CRM location ID
 * @param {string} opts.accessToken  — OAuth access token for the location
 * @param {object} [opts.config]     — App-specific configuration
 * @returns {Promise<{ success: boolean, message: string, setup?: object }>}
 */
export async function installApp({ appSlug, locationId, accessToken, config = {} }) {
  const manifest = await loadManifest(appSlug);

  // Load the app's install module
  let installModule;
  try {
    installModule = await import(join(APPS_DIR, appSlug, 'install.js'));
  } catch {
    // No install.js — that's fine, not all apps need one
  }

  const setup = {};

  // Create any custom fields the app needs
  if (manifest.custom_fields) {
    for (const field of manifest.custom_fields) {
      try {
        const result = await crmRequest(
          `/locations/${locationId}/customFields`,
          accessToken,
          {
            method: 'POST',
            body: {
              name: field.name,
              dataType: field.type || 'TEXT',
              model: field.model || 'contact',
            },
          }
        );
        setup[`customField_${field.name}`] = result.customField?.id;
      } catch (err) {
        // Field may already exist — not a fatal error
        setup[`customField_${field.name}`] = `skipped: ${err.message}`;
      }
    }
  }

  // Create any tags the app needs
  if (manifest.tags) {
    for (const tagName of manifest.tags) {
      try {
        await crmRequest(
          `/locations/${locationId}/tags`,
          accessToken,
          { method: 'POST', body: { name: tagName } }
        );
        setup[`tag_${tagName}`] = 'created';
      } catch {
        setup[`tag_${tagName}`] = 'skipped (may exist)';
      }
    }
  }

  // Run app-specific install hook
  if (installModule?.onInstall) {
    const hookResult = await installModule.onInstall(locationId, accessToken, config);
    setup.installHook = hookResult;
  }

  return {
    success: true,
    message: `${manifest.name} installed successfully`,
    setup,
  };
}

/**
 * Uninstall an app from a CRM location.
 *
 * @param {object} opts
 * @param {string} opts.appSlug     — App identifier
 * @param {string} opts.locationId  — CRM location ID
 * @param {string} opts.accessToken — OAuth access token
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function uninstallApp({ appSlug, locationId, accessToken }) {
  const manifest = await loadManifest(appSlug);

  // Load the app's install module for cleanup
  let installModule;
  try {
    installModule = await import(join(APPS_DIR, appSlug, 'install.js'));
  } catch {
    // No install.js
  }

  // Run app-specific uninstall hook
  if (installModule?.onUninstall) {
    await installModule.onUninstall(locationId, accessToken);
  }

  return {
    success: true,
    message: `${manifest.name} uninstalled from location ${locationId}`,
  };
}

/**
 * Get the installation status of an app for a location.
 *
 * @param {object} opts
 * @param {string} opts.appSlug    — App identifier
 * @param {string} opts.locationId — CRM location ID
 * @param {object} opts.supabase   — Supabase client
 * @param {string} [opts.table]    — Token table name
 * @returns {Promise<{ installed: boolean, installedAt?: string }>}
 */
export async function getInstallStatus({ appSlug, locationId, supabase, table = 'marketplace_oauth_tokens' }) {
  const { data, error } = await supabase
    .from(table)
    .select('created_at')
    .eq('location_id', locationId)
    .eq('app_slug', appSlug)
    .single();

  if (error || !data) {
    return { installed: false };
  }

  return { installed: true, installedAt: data.created_at };
}
