// ============================================================
// 0nMCP — Universal Field Schema (.0n Field Standard)
// ============================================================
// One canonical field name → auto-resolves to every service's format.
//
// Usage:
//   import { resolveField, resolveFields, CANONICAL_FIELDS } from './fields.js'
//   resolveField('company.0n', 'stripe')  → 'name'
//   resolveField('email.0n', 'hubspot')   → 'properties.email'
//   resolveFields({ 'name.0n': 'Mike', 'email.0n': 'mike@rocketopp.com' }, 'crm')
//     → { firstName: 'Mike', email: 'mike@rocketopp.com' }
//
// Every field ends in .0n — that's the universal identifier.
// Once mapped, never mapped again.
// ============================================================

/**
 * CANONICAL_FIELDS — the universal truth.
 * Each key is the .0n canonical name.
 * `label` = human-readable name
 * `type` = data type for validation
 * `mappings` = service-specific field names
 *
 * When a service isn't listed, the resolver falls back to the canonical key
 * (e.g., 'email' for 'email.0n').
 */
export const CANONICAL_FIELDS = {

  // ── Identity ─────────────────────────────────────────────
  'firstname.0n': {
    label: 'First Name',
    type: 'string',
    mappings: {
      crm: 'firstName',
      stripe: 'name', // Stripe uses full name — resolver splits
      hubspot: 'properties.firstname',
      salesforce: 'FirstName',
      pipedrive: 'first_name',
      shopify: 'first_name',
      intercom: 'name', // full name
      zendesk: 'name',
      airtable: 'fields.First Name',
      notion: 'properties.First Name.rich_text[0].text.content',
      supabase: 'full_name', // splits
      mailchimp: 'merge_fields.FNAME',
      linkedin: 'localizedFirstName',
      smartlead: 'first_name',
      quickbooks: 'GivenName',
      square: 'given_name',
      microsoft: 'givenName',
      asana: 'name', // full name
      google_calendar: 'attendees[].displayName', // full name
    },
  },

  'lastname.0n': {
    label: 'Last Name',
    type: 'string',
    mappings: {
      crm: 'lastName',
      hubspot: 'properties.lastname',
      salesforce: 'LastName',
      pipedrive: 'last_name',
      shopify: 'last_name',
      supabase: 'full_name', // splits
      mailchimp: 'merge_fields.LNAME',
      linkedin: 'localizedLastName',
      smartlead: 'last_name',
      quickbooks: 'FamilyName',
      square: 'family_name',
      microsoft: 'surname',
    },
  },

  'fullname.0n': {
    label: 'Full Name',
    type: 'string',
    mappings: {
      crm: ['firstName', 'lastName'], // composite
      stripe: 'name',
      hubspot: ['properties.firstname', 'properties.lastname'],
      salesforce: 'Name',
      pipedrive: 'name',
      shopify: ['first_name', 'last_name'],
      intercom: 'name',
      zendesk: 'name',
      supabase: 'full_name',
      mailchimp: ['merge_fields.FNAME', 'merge_fields.LNAME'],
      linkedin: ['localizedFirstName', 'localizedLastName'],
      quickbooks: 'DisplayName',
      square: ['given_name', 'family_name'],
      microsoft: 'displayName',
      asana: 'name',
      slack: 'real_name',
      discord: 'username',
      github: 'name',
      linear: 'name',
      zoom: ['first_name', 'last_name'],
    },
  },

  'email.0n': {
    label: 'Email Address',
    type: 'email',
    mappings: {
      crm: 'email',
      stripe: 'email',
      hubspot: 'properties.email',
      salesforce: 'Email',
      pipedrive: 'email[0].value',
      shopify: 'email',
      intercom: 'email',
      zendesk: 'email',
      airtable: 'fields.Email',
      notion: 'properties.Email.email',
      supabase: 'email',
      mailchimp: 'email_address',
      sendgrid: 'email',
      resend: 'to',
      linkedin: 'emailAddress',
      smartlead: 'email',
      quickbooks: 'PrimaryEmailAddr.Address',
      square: 'email_address',
      microsoft: 'mail',
      asana: 'email',
      jira: 'emailAddress',
      slack: 'profile.email',
      github: 'email',
      gmail: 'emailAddress',
      zoom: 'email',
      calendly: 'email',
      google_calendar: 'attendees[].email',
      linear: 'email',
    },
  },

  'phone.0n': {
    label: 'Phone Number',
    type: 'phone',
    mappings: {
      crm: 'phone',
      stripe: 'phone',
      hubspot: 'properties.phone',
      salesforce: 'Phone',
      pipedrive: 'phone[0].value',
      shopify: 'phone',
      intercom: 'phone',
      zendesk: 'phone',
      supabase: 'phone',
      twilio: 'to',
      whatsapp: 'to',
      quickbooks: 'PrimaryPhone.FreeFormNumber',
      square: 'phone_number',
      smartlead: 'phone_number',
    },
  },

  // ── Company ──────────────────────────────────────────────
  'company.0n': {
    label: 'Company Name',
    type: 'string',
    mappings: {
      crm: 'companyName',
      stripe: 'metadata.company',
      hubspot: 'properties.company',
      salesforce: 'Company',
      pipedrive: 'org_name',
      shopify: 'company',
      intercom: 'companies[0].name',
      zendesk: 'organization.name',
      supabase: 'company',
      mailchimp: 'merge_fields.COMPANY',
      linkedin: 'organizationName',
      smartlead: 'company_name',
      quickbooks: 'CompanyName',
      square: 'company_name',
      microsoft: 'companyName',
      asana: 'current_status.title',
      jira: 'project.name',
      airtable: 'fields.Company',
      notion: 'properties.Company.rich_text[0].text.content',
    },
  },

  'jobtitle.0n': {
    label: 'Job Title',
    type: 'string',
    mappings: {
      crm: 'customField.job_title',
      hubspot: 'properties.jobtitle',
      salesforce: 'Title',
      pipedrive: 'job_title',
      intercom: 'custom_attributes.job_title',
      linkedin: 'headline',
      microsoft: 'jobTitle',
      supabase: 'job_title',
    },
  },

  'website.0n': {
    label: 'Website URL',
    type: 'url',
    mappings: {
      crm: 'website',
      hubspot: 'properties.website',
      salesforce: 'Website',
      pipedrive: 'org.cc_email',
      shopify: 'domain',
      supabase: 'website',
      quickbooks: 'WebAddr.URI',
      linkedin: 'websiteUrl',
      intercom: 'website',
    },
  },

  // ── Location ─────────────────────────────────────────────
  'address.0n': {
    label: 'Street Address',
    type: 'string',
    mappings: {
      crm: 'address1',
      stripe: 'address.line1',
      hubspot: 'properties.address',
      salesforce: 'Street',
      shopify: 'address1',
      quickbooks: 'BillAddr.Line1',
      square: 'address.address_line_1',
      supabase: 'address',
    },
  },

  'city.0n': {
    label: 'City',
    type: 'string',
    mappings: {
      crm: 'city',
      stripe: 'address.city',
      hubspot: 'properties.city',
      salesforce: 'City',
      shopify: 'city',
      quickbooks: 'BillAddr.City',
      square: 'address.locality',
      supabase: 'city',
    },
  },

  'state.0n': {
    label: 'State/Province',
    type: 'string',
    mappings: {
      crm: 'state',
      stripe: 'address.state',
      hubspot: 'properties.state',
      salesforce: 'State',
      shopify: 'province',
      quickbooks: 'BillAddr.CountrySubDivisionCode',
      square: 'address.administrative_district_level_1',
      supabase: 'state',
    },
  },

  'zip.0n': {
    label: 'Zip/Postal Code',
    type: 'string',
    mappings: {
      crm: 'postalCode',
      stripe: 'address.postal_code',
      hubspot: 'properties.zip',
      salesforce: 'PostalCode',
      shopify: 'zip',
      quickbooks: 'BillAddr.PostalCode',
      square: 'address.postal_code',
      supabase: 'zip',
    },
  },

  'country.0n': {
    label: 'Country',
    type: 'string',
    mappings: {
      crm: 'country',
      stripe: 'address.country',
      hubspot: 'properties.country',
      salesforce: 'Country',
      shopify: 'country',
      quickbooks: 'BillAddr.Country',
      square: 'address.country',
      supabase: 'country',
    },
  },

  'timezone.0n': {
    label: 'Timezone',
    type: 'string',
    mappings: {
      crm: 'timezone',
      hubspot: 'properties.hs_timezone',
      supabase: 'timezone',
      calendly: 'timezone',
      google_calendar: 'timeZone',
      zoom: 'timezone',
      slack: 'tz',
      microsoft: 'mailboxSettings.timeZone',
    },
  },

  // ── Social ───────────────────────────────────────────────
  'avatar.0n': {
    label: 'Profile Photo URL',
    type: 'url',
    mappings: {
      crm: 'customField.avatar_url',
      supabase: 'avatar_url',
      slack: 'profile.image_72',
      discord: 'avatar',
      github: 'avatar_url',
      linkedin: 'profilePicture',
      intercom: 'avatar.image_url',
      microsoft: 'photo',
    },
  },

  'bio.0n': {
    label: 'Bio/Description',
    type: 'text',
    mappings: {
      crm: 'customField.bio',
      supabase: 'bio',
      github: 'bio',
      linkedin: 'headline',
      twitter: 'description',
      instagram: 'biography',
      slack: 'profile.status_text',
      discord: 'bio',
    },
  },

  'linkedin_url.0n': {
    label: 'LinkedIn Profile URL',
    type: 'url',
    mappings: {
      crm: 'customField.linkedin_url',
      hubspot: 'properties.linkedin_url',
      supabase: 'linkedin_url',
      pipedrive: 'linkedin',
    },
  },

  'twitter_handle.0n': {
    label: 'X/Twitter Handle',
    type: 'string',
    mappings: {
      crm: 'customField.twitter',
      hubspot: 'properties.twitterhandle',
      supabase: 'twitter_handle',
      twitter: 'username',
    },
  },

  // ── Financial ────────────────────────────────────────────
  'currency.0n': {
    label: 'Currency Code',
    type: 'string',
    mappings: {
      stripe: 'currency',
      shopify: 'currency',
      quickbooks: 'CurrencyRef.value',
      square: 'currency',
      plaid: 'iso_currency_code',
      paypal: 'currency_code',
    },
  },

  'amount.0n': {
    label: 'Amount (cents)',
    type: 'number',
    mappings: {
      stripe: 'amount', // cents
      square: 'amount_money.amount', // cents
      shopify: 'total_price', // string dollars
      quickbooks: 'TotalAmt', // dollars
      crm: 'monetaryValue', // dollars
      hubspot: 'properties.amount', // dollars
      plaid: 'amount', // dollars
    },
  },

  // ── Communication ────────────────────────────────────────
  'subject.0n': {
    label: 'Email Subject',
    type: 'string',
    mappings: {
      crm: 'subject',
      sendgrid: 'subject',
      resend: 'subject',
      gmail: 'subject',
      mailchimp: 'settings.subject_line',
      hubspot: 'properties.hs_email_subject',
      microsoft: 'subject',
    },
  },

  'message.0n': {
    label: 'Message Body',
    type: 'text',
    mappings: {
      crm: 'html',
      sendgrid: 'content[0].value',
      resend: 'html',
      twilio: 'body',
      whatsapp: 'body',
      slack: 'text',
      discord: 'content',
      gmail: 'body',
      intercom: 'body',
      microsoft: 'body.content',
    },
  },

  // ── Dates ────────────────────────────────────────────────
  'created.0n': {
    label: 'Created Date',
    type: 'datetime',
    mappings: {
      crm: 'dateAdded',
      stripe: 'created', // unix timestamp
      hubspot: 'properties.createdate',
      salesforce: 'CreatedDate',
      shopify: 'created_at',
      supabase: 'created_at',
      airtable: 'createdTime',
      notion: 'created_time',
      github: 'created_at',
      linear: 'createdAt',
      jira: 'fields.created',
      zendesk: 'created_at',
      intercom: 'created_at',
      asana: 'created_at',
      pipedrive: 'add_time',
      quickbooks: 'MetaData.CreateTime',
    },
  },

  'updated.0n': {
    label: 'Last Updated',
    type: 'datetime',
    mappings: {
      crm: 'dateUpdated',
      stripe: 'metadata.updated_at',
      hubspot: 'properties.hs_lastmodifieddate',
      salesforce: 'LastModifiedDate',
      shopify: 'updated_at',
      supabase: 'updated_at',
      notion: 'last_edited_time',
      github: 'updated_at',
      linear: 'updatedAt',
      jira: 'fields.updated',
      zendesk: 'updated_at',
      pipedrive: 'update_time',
      quickbooks: 'MetaData.LastUpdatedTime',
    },
  },

  // ── Tags/Labels ──────────────────────────────────────────
  'tags.0n': {
    label: 'Tags/Labels',
    type: 'array',
    mappings: {
      crm: 'tags',
      hubspot: 'properties.hs_tag',
      shopify: 'tags',
      supabase: 'tags',
      github: 'labels',
      linear: 'labels',
      jira: 'fields.labels',
      zendesk: 'tags',
      mailchimp: 'tags',
      airtable: 'fields.Tags',
      intercom: 'tags.tags',
      asana: 'tags',
    },
  },

  // ── Status/Stage ─────────────────────────────────────────
  'status.0n': {
    label: 'Status',
    type: 'string',
    mappings: {
      crm: 'status',
      hubspot: 'properties.hs_lead_status',
      salesforce: 'Status',
      pipedrive: 'status',
      shopify: 'status',
      linear: 'state.name',
      jira: 'fields.status.name',
      zendesk: 'status',
      asana: 'completed',
      github: 'state',
      supabase: 'status',
    },
  },

  // ── Source/Channel ───────────────────────────────────────
  'source.0n': {
    label: 'Lead Source',
    type: 'string',
    mappings: {
      crm: 'source',
      hubspot: 'properties.hs_analytics_source',
      salesforce: 'LeadSource',
      pipedrive: 'origin',
      supabase: 'source',
      shopify: 'source_name',
    },
  },

  // ── Notes ────────────────────────────────────────────────
  'notes.0n': {
    label: 'Notes',
    type: 'text',
    mappings: {
      crm: 'customField.notes',
      hubspot: 'properties.notes_last_contacted',
      salesforce: 'Description',
      pipedrive: 'notes',
      shopify: 'note',
      supabase: 'notes',
      zendesk: 'description',
      intercom: 'custom_attributes.notes',
    },
  },

  // ── IDs ──────────────────────────────────────────────────
  'id.0n': {
    label: 'Record ID',
    type: 'string',
    mappings: {
      crm: 'id',
      stripe: 'id',
      hubspot: 'id',
      salesforce: 'Id',
      pipedrive: 'id',
      shopify: 'id',
      supabase: 'id',
      airtable: 'id',
      notion: 'id',
      github: 'id',
      linear: 'id',
      jira: 'id',
      zendesk: 'id',
      intercom: 'id',
      asana: 'gid',
      slack: 'id',
      discord: 'id',
      quickbooks: 'Id',
      square: 'id',
      mongodb: '_id',
    },
  },

  'external_id.0n': {
    label: 'External/Integration ID',
    type: 'string',
    mappings: {
      crm: 'customField.external_id',
      stripe: 'metadata.external_id',
      hubspot: 'properties.hs_object_id',
      supabase: 'external_id',
      shopify: 'metafields.external_id',
    },
  },
}

// ── Resolver Functions ────────────────────────────────────

/**
 * Resolve a single .0n canonical field to a service's field name.
 *
 * @param {string} field - Canonical field (e.g., 'email.0n')
 * @param {string} service - Service key (e.g., 'crm', 'stripe')
 * @returns {string|string[]|null} - Service-specific field name, or null if not mapped
 */
export function resolveField(field, service) {
  const canonical = CANONICAL_FIELDS[field]
  if (!canonical) return null

  if (canonical.mappings[service] !== undefined) {
    return canonical.mappings[service]
  }

  // Fallback: strip .0n suffix and return as-is
  return field.replace('.0n', '')
}

/**
 * Resolve a data object from .0n canonical fields to service-specific fields.
 *
 * @param {Object} data - Object with .0n canonical keys (e.g., { 'email.0n': 'x@y.com' })
 * @param {string} service - Target service key
 * @returns {Object} - Object with service-specific keys
 */
export function resolveFields(data, service) {
  const resolved = {}

  for (const [key, value] of Object.entries(data)) {
    if (!key.endsWith('.0n')) {
      // Pass through non-.0n fields as-is
      resolved[key] = value
      continue
    }

    const serviceField = resolveField(key, service)
    if (!serviceField) continue

    if (Array.isArray(serviceField)) {
      // Composite field (e.g., fullname → [firstName, lastName])
      if (typeof value === 'string' && serviceField.length === 2) {
        const parts = value.split(' ')
        resolved[serviceField[0]] = parts[0] || ''
        resolved[serviceField[1]] = parts.slice(1).join(' ') || ''
      }
    } else if (serviceField.includes('.')) {
      // Nested field (e.g., 'properties.email' → { properties: { email: value } })
      setNestedValue(resolved, serviceField, value)
    } else {
      resolved[serviceField] = value
    }
  }

  return resolved
}

/**
 * Reverse-resolve: given a service's field name, find the .0n canonical name.
 *
 * @param {string} serviceField - Service-specific field (e.g., 'companyName')
 * @param {string} service - Service key (e.g., 'crm')
 * @returns {string|null} - Canonical .0n field name, or null
 */
export function reverseResolve(serviceField, service) {
  for (const [canonical, def] of Object.entries(CANONICAL_FIELDS)) {
    const mapping = def.mappings[service]
    if (mapping === serviceField) return canonical
    if (Array.isArray(mapping) && mapping.includes(serviceField)) return canonical
  }
  return null
}

/**
 * Get all canonical fields with their metadata.
 */
export function listFields() {
  return Object.entries(CANONICAL_FIELDS).map(([key, def]) => ({
    field: key,
    label: def.label,
    type: def.type,
    services: Object.keys(def.mappings).length,
  }))
}

/**
 * Get all mappings for a specific service.
 */
export function getServiceMappings(service) {
  const mappings = {}
  for (const [canonical, def] of Object.entries(CANONICAL_FIELDS)) {
    if (def.mappings[service]) {
      mappings[canonical] = def.mappings[service]
    }
  }
  return mappings
}

// ── Helper ────────────────────────────────────────────────

function setNestedValue(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (!current[key]) current[key] = {}
    current = current[key]
  }
  current[parts[parts.length - 1]] = value
}
