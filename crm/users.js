// ============================================================
// 0nMCP — CRM Users, Forms, Surveys, Funnels, Media,
//         Companies & Businesses Tool Definitions
// ============================================================
// Data-driven tool configs for the CRM Users, Forms, Surveys,
// Funnels/Websites, Media/Files, Companies, and Businesses APIs.
// Consumed by registerTools() from crm/helpers.js.
// ============================================================

const users = [
  // ── USERS ─────────────────────────────────────────────────

  {
    name: "crm_list_users",
    description: "List CRM users with optional filters for location, company, role, and sorting.",
    method: "GET",
    path: "/users/",
    params: {
      locationId: { type: "string", description: "Filter by location / sub-account ID", required: false, in: "query" },
      companyId: { type: "string", description: "Filter by company ID", required: false, in: "query" },
      role: { type: "string", description: "Filter by user role (admin, user, etc.)", required: false, in: "query" },
      ids: { type: "string", description: "Comma-separated list of user IDs to retrieve", required: false, in: "query" },
      sort: { type: "string", description: "Field to sort results by", required: false, in: "query" },
      sortDirection: { type: "string", description: "Sort direction: 'asc' or 'desc'", required: false, in: "query" },
      limit: { type: "number", description: "Maximum number of users to return", required: false, in: "query" },
    },
    query: ["locationId", "companyId", "role", "ids", "sort", "sortDirection", "limit"],
    body: [],
  },

  {
    name: "crm_get_user",
    description: "Get a single CRM user by ID.",
    method: "GET",
    path: "/users/:userId",
    params: {
      userId: { type: "string", description: "User ID to retrieve", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_create_user",
    description: "Create a new CRM user with role, permissions, and location assignments.",
    method: "POST",
    path: "/users/",
    params: {
      companyId: { type: "string", description: "Company ID the user belongs to", required: true, in: "body" },
      firstName: { type: "string", description: "User first name", required: true, in: "body" },
      lastName: { type: "string", description: "User last name", required: true, in: "body" },
      email: { type: "string", description: "User email address", required: true, in: "body" },
      password: { type: "string", description: "User password", required: true, in: "body" },
      phone: { type: "string", description: "User phone number", required: false, in: "body" },
      type: { type: "string", description: "User type (e.g. 'account')", required: true, in: "body" },
      role: { type: "string", description: "User role (admin, user, etc.)", required: true, in: "body" },
      locationIds: { type: "array_string", description: "Array of location IDs the user has access to", required: false, in: "body" },
      permissions: { type: "object", description: "Permissions object defining user capabilities", required: false, in: "body" },
      scopes: { type: "array_string", description: "Array of OAuth scopes granted to the user", required: false, in: "body" },
      scopeCompanyIds: { type: "array_string", description: "Array of company IDs the scopes apply to", required: false, in: "body" },
    },
    query: [],
    body: [
      "companyId", "firstName", "lastName", "email", "password",
      "phone", "type", "role", "locationIds", "permissions",
      "scopes", "scopeCompanyIds",
    ],
  },

  {
    name: "crm_update_user",
    description: "Update an existing CRM user's profile, role, or permissions.",
    method: "PUT",
    path: "/users/:userId",
    params: {
      userId: { type: "string", description: "User ID to update", required: true, in: "path" },
      firstName: { type: "string", description: "User first name", required: false, in: "body" },
      lastName: { type: "string", description: "User last name", required: false, in: "body" },
      email: { type: "string", description: "User email address", required: false, in: "body" },
      phone: { type: "string", description: "User phone number", required: false, in: "body" },
      type: { type: "string", description: "User type (e.g. 'account')", required: false, in: "body" },
      role: { type: "string", description: "User role (admin, user, etc.)", required: false, in: "body" },
      locationIds: { type: "array_string", description: "Array of location IDs the user has access to", required: false, in: "body" },
      permissions: { type: "object", description: "Permissions object defining user capabilities", required: false, in: "body" },
      companyId: { type: "string", description: "Company ID the user belongs to", required: false, in: "body" },
    },
    query: [],
    body: [
      "firstName", "lastName", "email", "phone",
      "type", "role", "locationIds", "permissions", "companyId",
    ],
  },

  {
    name: "crm_delete_user",
    description: "Permanently delete a CRM user by ID.",
    method: "DELETE",
    path: "/users/:userId",
    params: {
      userId: { type: "string", description: "User ID to delete", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  // ── FORMS ─────────────────────────────────────────────────

  // crm_list_forms — defined in funnels.js

  {
    name: "crm_get_form_submissions",
    description: "List form submissions with filtering by form, date range, and search query.",
    method: "GET",
    path: "/forms/submissions",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      formId: { type: "string", description: "Filter submissions by form ID", required: false, in: "query" },
      startAt: { type: "string", description: "Start date for filtering submissions (ISO 8601)", required: false, in: "query" },
      endAt: { type: "string", description: "End date for filtering submissions (ISO 8601)", required: false, in: "query" },
      page: { type: "number", description: "Page number for pagination", required: false, in: "query" },
      limit: { type: "number", description: "Maximum number of submissions to return", required: false, in: "query" },
      q: { type: "string", description: "Free-text search query", required: false, in: "query" },
    },
    query: ["locationId", "formId", "startAt", "endAt", "page", "limit", "q"],
    body: [],
  },

  {
    name: "crm_upload_form_custom_files",
    description: "Upload custom files to a CRM form for a specific contact.",
    method: "POST",
    path: "/forms/upload-custom-files",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      contactId: { type: "string", description: "Contact ID to associate the files with", required: true, in: "body" },
      formId: { type: "string", description: "Form ID to upload files to", required: true, in: "body" },
    },
    query: [],
    body: ["locationId", "contactId", "formId"],
  },

  // ── SURVEYS ───────────────────────────────────────────────

  // crm_list_surveys — defined in funnels.js

  {
    name: "crm_get_survey_submissions",
    description: "List survey submissions with filtering by survey, date range, and search query.",
    method: "GET",
    path: "/surveys/submissions",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      surveyId: { type: "string", description: "Filter submissions by survey ID", required: false, in: "query" },
      startAt: { type: "string", description: "Start date for filtering submissions (ISO 8601)", required: false, in: "query" },
      endAt: { type: "string", description: "End date for filtering submissions (ISO 8601)", required: false, in: "query" },
      page: { type: "number", description: "Page number for pagination", required: false, in: "query" },
      limit: { type: "number", description: "Maximum number of submissions to return", required: false, in: "query" },
      q: { type: "string", description: "Free-text search query", required: false, in: "query" },
    },
    query: ["locationId", "surveyId", "startAt", "endAt", "page", "limit", "q"],
    body: [],
  },

  // ── FUNNELS / WEBSITES (defined in funnels.js) ────────────
  // crm_list_funnels, crm_get_funnel_pages, crm_count_funnel_pages → see funnels.js

  {
    name: "crm_funnel_redirect_lookup_by_id",
    description: "Look up a funnel redirect by its redirect ID.",
    method: "GET",
    path: "/funnels/lookup/redirect",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      redirectId: { type: "string", description: "Redirect ID to look up", required: true, in: "query" },
    },
    query: ["locationId", "redirectId"],
    body: [],
  },

  // ── MEDIA / FILES ─────────────────────────────────────────

  {
    name: "crm_list_media_files",
    description: "List media files and assets in the CRM file library with sorting, pagination, and type filtering.",
    method: "GET",
    path: "/medias/files",
    params: {
      altId: { type: "string", description: "Alternate ID (location ID or agency ID)", required: true, in: "query" },
      altType: { type: "string", description: "Alternate ID type ('location' or 'agency')", required: true, in: "query" },
      sortBy: { type: "string", description: "Field to sort results by (e.g. 'createdAt', 'name')", required: false, in: "query" },
      sortOrder: { type: "string", description: "Sort order: 'asc' or 'desc'", required: false, in: "query" },
      limit: { type: "number", description: "Maximum number of files to return", required: false, in: "query" },
      offset: { type: "number", description: "Number of records to skip for pagination", required: false, in: "query" },
      query: { type: "string", description: "Free-text search query for file names", required: false, in: "query" },
      type: { type: "string", description: "Filter by file type (e.g. 'image', 'video', 'document')", required: false, in: "query" },
    },
    query: ["altId", "altType", "sortBy", "sortOrder", "limit", "offset", "query", "type"],
    body: [],
  },

  {
    name: "crm_upload_media_file",
    description: "Upload a media file to the CRM file library from a URL.",
    method: "POST",
    path: "/medias/upload-file",
    params: {
      altId: { type: "string", description: "Alternate ID (location ID or agency ID)", required: true, in: "body" },
      altType: { type: "string", description: "Alternate ID type ('location' or 'agency')", required: true, in: "body" },
      name: { type: "string", description: "Display name for the uploaded file", required: true, in: "body" },
      fileUrl: { type: "string", description: "Public URL of the file to upload", required: true, in: "body" },
      hosted: { type: "boolean", description: "Whether the file is externally hosted", required: false, in: "body" },
    },
    query: [],
    body: ["altId", "altType", "name", "fileUrl", "hosted"],
  },

  {
    name: "crm_delete_media_file",
    description: "Delete a media file from the CRM file library.",
    method: "DELETE",
    path: "/medias/:fileId",
    params: {
      fileId: { type: "string", description: "File ID to delete", required: true, in: "path" },
      altId: { type: "string", description: "Alternate ID (location ID or agency ID)", required: true, in: "query" },
      altType: { type: "string", description: "Alternate ID type ('location' or 'agency')", required: true, in: "query" },
    },
    query: ["altId", "altType"],
    body: [],
  },

  // ── COMPANIES (Agency Level) ──────────────────────────────

  {
    name: "crm_list_companies",
    description: "List companies (sub-accounts) under a CRM agency with optional search and pagination.",
    method: "GET",
    path: "/companies/",
    params: {
      companyId: { type: "string", description: "Parent company / agency ID", required: true, in: "query" },
      skip: { type: "number", description: "Number of records to skip for pagination", required: false, in: "query" },
      limit: { type: "number", description: "Maximum number of companies to return", required: false, in: "query" },
      isSearchable: { type: "boolean", description: "Whether to enable search mode", required: false, in: "query" },
      order: { type: "string", description: "Sort order: 'asc' or 'desc'", required: false, in: "query" },
      email: { type: "string", description: "Filter by company email address", required: false, in: "query" },
    },
    query: ["companyId", "skip", "limit", "isSearchable", "order", "email"],
    body: [],
  },

  {
    name: "crm_get_company",
    description: "Get a single CRM company (sub-account) by its ID.",
    method: "GET",
    path: "/companies/:companyId",
    params: {
      companyId: { type: "string", description: "Company ID to retrieve", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  // ── BUSINESSES ────────────────────────────────────────────

  {
    name: "crm_list_businesses",
    description: "List all businesses for a CRM location.",
    method: "GET",
    path: "/businesses/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
    },
    query: ["locationId"],
    body: [],
  },

  {
    name: "crm_get_business",
    description: "Get a single business by its ID.",
    method: "GET",
    path: "/businesses/:businessId",
    params: {
      businessId: { type: "string", description: "Business ID to retrieve", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_create_business",
    description: "Create a new business entry for a CRM location.",
    method: "POST",
    path: "/businesses/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Business name", required: true, in: "body" },
      phone: { type: "string", description: "Business phone number", required: false, in: "body" },
      email: { type: "string", description: "Business email address", required: false, in: "body" },
      website: { type: "string", description: "Business website URL", required: false, in: "body" },
      address: { type: "string", description: "Street address", required: false, in: "body" },
      city: { type: "string", description: "City", required: false, in: "body" },
      state: { type: "string", description: "State or province", required: false, in: "body" },
      postalCode: { type: "string", description: "Postal / ZIP code", required: false, in: "body" },
      country: { type: "string", description: "Country", required: false, in: "body" },
      description: { type: "string", description: "Business description", required: false, in: "body" },
      logoUrl: { type: "string", description: "URL to the business logo image", required: false, in: "body" },
    },
    query: [],
    body: [
      "locationId", "name", "phone", "email", "website",
      "address", "city", "state", "postalCode", "country",
      "description", "logoUrl",
    ],
  },

  {
    name: "crm_update_business",
    description: "Update an existing business entry by ID.",
    method: "PUT",
    path: "/businesses/:businessId",
    params: {
      businessId: { type: "string", description: "Business ID to update", required: true, in: "path" },
      name: { type: "string", description: "Business name", required: false, in: "body" },
      phone: { type: "string", description: "Business phone number", required: false, in: "body" },
      email: { type: "string", description: "Business email address", required: false, in: "body" },
      website: { type: "string", description: "Business website URL", required: false, in: "body" },
      address: { type: "string", description: "Street address", required: false, in: "body" },
      city: { type: "string", description: "City", required: false, in: "body" },
      state: { type: "string", description: "State or province", required: false, in: "body" },
      postalCode: { type: "string", description: "Postal / ZIP code", required: false, in: "body" },
      country: { type: "string", description: "Country", required: false, in: "body" },
      description: { type: "string", description: "Business description", required: false, in: "body" },
      logoUrl: { type: "string", description: "URL to the business logo image", required: false, in: "body" },
    },
    query: [],
    body: [
      "name", "phone", "email", "website",
      "address", "city", "state", "postalCode", "country",
      "description", "logoUrl",
    ],
  },

  {
    name: "crm_delete_business",
    description: "Permanently delete a business entry by ID.",
    method: "DELETE",
    path: "/businesses/:businessId",
    params: {
      businessId: { type: "string", description: "Business ID to delete", required: true, in: "path" },
    },
    query: [],
    body: [],
  },
];

export default users;
