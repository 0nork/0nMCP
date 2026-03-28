// ============================================================
// 0nMCP — CRM Social Media Posting & Blogs API Tool Definitions
// ============================================================
// Full coverage of Social Media Posting endpoints (posts, accounts,
// categories, tags, CSV import/export, OAuth, reviews) and Blog
// endpoints (blogs, authors, categories, posts, slug checks).
//
// REDDIT NOTE: Reddit is NOT available as a CRM-native social
// provider. For Reddit posting, comments, monitoring, and search,
// use the dedicated reddit_* tools (registered via reddit.js).
// CRM social + Reddit can be combined in workflows — e.g. use
// crm_create_social_post for Twitter/FB/IG/LinkedIn, then
// reddit_submit_post for Reddit cross-posting.
// ============================================================

export default [
  // ── Social Media Posts ───────────────────────────────────────

  {
    name: "crm_list_social_posts",
    description: "List social media posts with filters for type, status, date range, and connected accounts.",
    method: "GET",
    path: "/social-media-posting/",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list posts for",
        required: true,
        in: "query",
      },
      type: {
        type: "string",
        description: "Filter by post type",
        required: false,
        in: "query",
      },
      status: {
        type: "string",
        description: "Filter by post status",
        required: false,
        in: "query",
      },
      fromDate: {
        type: "string",
        description: "Start date for filtering posts (ISO 8601)",
        required: false,
        in: "query",
      },
      toDate: {
        type: "string",
        description: "End date for filtering posts (ISO 8601)",
        required: false,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of posts to return",
        required: false,
        in: "query",
      },
      offset: {
        type: "number",
        description: "Number of posts to skip for pagination",
        required: false,
        in: "query",
      },
      includeUsers: {
        type: "boolean",
        description: "Whether to include user details in results",
        required: false,
        in: "query",
      },
      accounts: {
        type: "string",
        description: "Comma-separated list of account IDs to filter by",
        required: false,
        in: "query",
      },
      postType: {
        type: "string",
        description: "Specific post type filter",
        required: false,
        in: "query",
      },
      postStatus: {
        type: "string",
        description: "Specific post status filter",
        required: false,
        in: "query",
      },
    },
    query: [
      "locationId", "type", "status", "fromDate", "toDate",
      "limit", "offset", "includeUsers", "accounts",
      "postType", "postStatus",
    ],
  },

  {
    name: "crm_get_social_post",
    description: "Get a single social media post by ID.",
    method: "GET",
    path: "/social-media-posting/:postId",
    params: {
      postId: {
        type: "string",
        description: "The social post ID to retrieve",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the post belongs to",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },

  {
    name: "crm_create_social_post",
    description: "Create a new social media post. Can be published immediately or scheduled. Supports Facebook, Instagram, Twitter/X, LinkedIn, Google Business, and TikTok. NOTE: For Reddit posts, use the reddit_submit_post tool instead — Reddit is not a CRM-native social provider.",
    method: "POST",
    path: "/social-media-posting/",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to create the post under",
        required: true,
        in: "body",
      },
      accountIds: {
        type: "array",
        description: "Array of social account IDs to post to",
        required: true,
        in: "body",
      },
      content: {
        type: "string",
        description: "Text content of the social media post",
        required: true,
        in: "body",
      },
      mediaUrls: {
        type: "array",
        description: "Array of media URLs (images/videos) to include in the post",
        required: false,
        in: "body",
      },
      type: {
        type: "string",
        description: "Type of social media post",
        required: false,
        in: "body",
      },
      scheduledDate: {
        type: "string",
        description: "ISO 8601 date-time to schedule the post for future publishing",
        required: false,
        in: "body",
      },
      tags: {
        type: "array",
        description: "Array of tag strings to categorize the post",
        required: false,
        in: "body",
      },
      approvalStatus: {
        type: "string",
        description: "Approval status of the post (e.g. 'approved', 'pending')",
        required: false,
        in: "body",
      },
      postType: {
        type: "string",
        description: "Specific post type classification",
        required: false,
        in: "body",
      },
      publishMode: {
        type: "string",
        description: "Publish mode (e.g. 'publish', 'draft', 'schedule')",
        required: false,
        in: "body",
      },
    },
    body: [
      "locationId", "accountIds", "content", "mediaUrls",
      "type", "scheduledDate", "tags", "approvalStatus",
      "postType", "publishMode",
    ],
  },

  {
    name: "crm_update_social_post",
    description: "Update an existing social media post by ID.",
    method: "PUT",
    path: "/social-media-posting/:postId",
    params: {
      postId: {
        type: "string",
        description: "The social post ID to update",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the post belongs to",
        required: true,
        in: "body",
      },
      accountIds: {
        type: "array",
        description: "Array of social account IDs to post to",
        required: false,
        in: "body",
      },
      content: {
        type: "string",
        description: "Text content of the social media post",
        required: false,
        in: "body",
      },
      mediaUrls: {
        type: "array",
        description: "Array of media URLs (images/videos) to include in the post",
        required: false,
        in: "body",
      },
      type: {
        type: "string",
        description: "Type of social media post",
        required: false,
        in: "body",
      },
      scheduledDate: {
        type: "string",
        description: "ISO 8601 date-time to schedule the post for future publishing",
        required: false,
        in: "body",
      },
      tags: {
        type: "array",
        description: "Array of tag strings to categorize the post",
        required: false,
        in: "body",
      },
      approvalStatus: {
        type: "string",
        description: "Approval status of the post",
        required: false,
        in: "body",
      },
      postType: {
        type: "string",
        description: "Specific post type classification",
        required: false,
        in: "body",
      },
      publishMode: {
        type: "string",
        description: "Publish mode (e.g. 'publish', 'draft', 'schedule')",
        required: false,
        in: "body",
      },
    },
    body: [
      "locationId", "accountIds", "content", "mediaUrls",
      "type", "scheduledDate", "tags", "approvalStatus",
      "postType", "publishMode",
    ],
  },

  {
    name: "crm_delete_social_post",
    description: "Delete a social media post by ID.",
    method: "DELETE",
    path: "/social-media-posting/:postId",
    params: {
      postId: {
        type: "string",
        description: "The social post ID to delete",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the post belongs to",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },

  {
    name: "crm_bulk_delete_social_posts",
    description: "Bulk delete multiple social media posts at once.",
    method: "POST",
    path: "/social-media-posting/bulk-delete",
    params: {
      locationId: {
        type: "string",
        description: "Location ID the posts belong to",
        required: true,
        in: "body",
      },
      postIds: {
        type: "array",
        description: "Array of post IDs to delete",
        required: true,
        in: "body",
      },
    },
    body: ["locationId", "postIds"],
  },

  // ── Social Accounts ─────────────────────────────────────────

  {
    name: "crm_list_social_accounts",
    description: "List all connected social media accounts for a location.",
    method: "GET",
    path: "/social-media-posting/accounts",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list accounts for",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },

  {
    name: "crm_delete_social_account",
    description: "Delete a connected social media account.",
    method: "DELETE",
    path: "/social-media-posting/accounts/:accountId",
    params: {
      accountId: {
        type: "string",
        description: "The social account ID to delete",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the account belongs to",
        required: true,
        in: "query",
      },
      companyId: {
        type: "string",
        description: "Company ID associated with the account",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "companyId"],
  },

  {
    name: "crm_set_social_accounts",
    description: "Set the social media accounts associated with a specific post.",
    method: "POST",
    path: "/social-media-posting/set-accounts",
    params: {
      locationId: {
        type: "string",
        description: "Location ID the post belongs to",
        required: true,
        in: "body",
      },
      postId: {
        type: "string",
        description: "The social post ID to assign accounts to",
        required: true,
        in: "body",
      },
      accountIds: {
        type: "array",
        description: "Array of social account IDs to associate with the post",
        required: true,
        in: "body",
      },
    },
    body: ["locationId", "postId", "accountIds"],
  },

  // ── Social Categories ───────────────────────────────────────

  {
    name: "crm_list_social_categories",
    description: "List social media post categories for a location.",
    method: "GET",
    path: "/social-media-posting/categories",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list categories for",
        required: true,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of categories to return",
        required: false,
        in: "query",
      },
      offset: {
        type: "number",
        description: "Number of categories to skip for pagination",
        required: false,
        in: "query",
      },
      searchText: {
        type: "string",
        description: "Text to search categories by name",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "limit", "offset", "searchText"],
  },

  {
    name: "crm_create_social_category",
    description: "Create a new social media post category.",
    method: "POST",
    path: "/social-media-posting/categories",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to create the category under",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Name of the category",
        required: true,
        in: "body",
      },
      color: {
        type: "string",
        description: "Color code for the category (e.g. '#FF5733')",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "name", "color"],
  },

  {
    name: "crm_update_social_category",
    description: "Update an existing social media post category.",
    method: "PUT",
    path: "/social-media-posting/categories/:categoryId",
    params: {
      categoryId: {
        type: "string",
        description: "The category ID to update",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the category belongs to",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Updated name of the category",
        required: false,
        in: "body",
      },
      color: {
        type: "string",
        description: "Updated color code for the category",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "name", "color"],
  },

  {
    name: "crm_delete_social_category",
    description: "Delete a social media post category.",
    method: "DELETE",
    path: "/social-media-posting/categories/:categoryId",
    params: {
      categoryId: {
        type: "string",
        description: "The category ID to delete",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the category belongs to",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },

  // ── Social Tags ─────────────────────────────────────────────

  {
    name: "crm_list_social_tags",
    description: "List social media tags for a location.",
    method: "GET",
    path: "/social-media-posting/tags",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list tags for",
        required: true,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of tags to return",
        required: false,
        in: "query",
      },
      offset: {
        type: "number",
        description: "Number of tags to skip for pagination",
        required: false,
        in: "query",
      },
      searchText: {
        type: "string",
        description: "Text to search tags by name",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "limit", "offset", "searchText"],
  },

  // ── Social CSV Import / Export ──────────────────────────────

  {
    name: "crm_get_social_csv",
    description: "Export social media posts as a CSV file.",
    method: "GET",
    path: "/social-media-posting/csv",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to export posts for",
        required: true,
        in: "query",
      },
      type: {
        type: "string",
        description: "Filter exported posts by type",
        required: false,
        in: "query",
      },
      fromDate: {
        type: "string",
        description: "Start date for exported posts (ISO 8601)",
        required: false,
        in: "query",
      },
      toDate: {
        type: "string",
        description: "End date for exported posts (ISO 8601)",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "type", "fromDate", "toDate"],
  },

  {
    name: "crm_import_social_csv",
    description: "Import social media posts from a CSV file URL.",
    method: "POST",
    path: "/social-media-posting/csv",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to import posts into",
        required: true,
        in: "body",
      },
      csvUrl: {
        type: "string",
        description: "URL of the CSV file to import posts from",
        required: true,
        in: "body",
      },
    },
    body: ["locationId", "csvUrl"],
  },

  // ── Social Reviews ──────────────────────────────────────────

  {
    name: "crm_reply_social_review",
    description: "Reply to a social media review.",
    method: "POST",
    path: "/social-media-posting/review/:reviewId/reply",
    params: {
      reviewId: {
        type: "string",
        description: "The review ID to reply to",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the review belongs to",
        required: true,
        in: "body",
      },
      reply: {
        type: "string",
        description: "Reply text to post on the review",
        required: true,
        in: "body",
      },
    },
    body: ["locationId", "reply"],
  },

  // ── Social OAuth ────────────────────────────────────────────

  {
    name: "crm_start_social_oauth",
    description: "Start an OAuth flow to connect a CRM-native social media provider account (Facebook, Instagram, Google, Twitter/X, LinkedIn, TikTok). NOTE: Reddit OAuth is handled separately via the 0nMCP reddit connection — see connect_service with service='reddit'.",
    method: "GET",
    path: "/social-media-posting/oauth/:provider/start",
    params: {
      provider: {
        type: "string",
        description: "Social media provider name (e.g. 'facebook', 'instagram', 'google', 'twitter')",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID to connect the account to",
        required: true,
        in: "query",
      },
      userId: {
        type: "string",
        description: "User ID initiating the OAuth flow",
        required: true,
        in: "query",
      },
      reconnectAccountId: {
        type: "string",
        description: "Account ID to reconnect if re-authenticating an existing account",
        required: false,
        in: "query",
      },
      page: {
        type: "string",
        description: "Specific page or profile to connect",
        required: false,
        in: "query",
      },
      originUrl: {
        type: "string",
        description: "URL to redirect back to after OAuth completes",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "userId", "reconnectAccountId", "page", "originUrl"],
  },

  // ── Blogs ───────────────────────────────────────────────────

  {
    name: "crm_list_blogs",
    description: "List all blogs for a location.",
    method: "GET",
    path: "/blogs/",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list blogs for",
        required: true,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of blogs to return",
        required: false,
        in: "query",
      },
      offset: {
        type: "number",
        description: "Number of blogs to skip for pagination",
        required: false,
        in: "query",
      },
      searchTerm: {
        type: "string",
        description: "Text to search blogs by title or description",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "limit", "offset", "searchTerm"],
  },

  {
    name: "crm_get_blog",
    description: "Get a single blog by ID.",
    method: "GET",
    path: "/blogs/:blogId",
    params: {
      blogId: {
        type: "string",
        description: "The blog ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_blog",
    description: "Create a new blog.",
    method: "POST",
    path: "/blogs/",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to create the blog under",
        required: true,
        in: "body",
      },
      title: {
        type: "string",
        description: "Title of the blog",
        required: true,
        in: "body",
      },
      description: {
        type: "string",
        description: "Description of the blog",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "URL of the blog cover image",
        required: false,
        in: "body",
      },
      slug: {
        type: "string",
        description: "URL slug for the blog",
        required: false,
        in: "body",
      },
      pathname: {
        type: "string",
        description: "Base pathname for the blog URL",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "title", "description", "imageUrl", "slug", "pathname"],
  },

  {
    name: "crm_update_blog",
    description: "Update an existing blog by ID.",
    method: "PUT",
    path: "/blogs/:blogId",
    params: {
      blogId: {
        type: "string",
        description: "The blog ID to update",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the blog belongs to",
        required: true,
        in: "body",
      },
      title: {
        type: "string",
        description: "Updated title of the blog",
        required: false,
        in: "body",
      },
      description: {
        type: "string",
        description: "Updated description of the blog",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "Updated URL of the blog cover image",
        required: false,
        in: "body",
      },
      slug: {
        type: "string",
        description: "Updated URL slug for the blog",
        required: false,
        in: "body",
      },
      pathname: {
        type: "string",
        description: "Updated base pathname for the blog URL",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "title", "description", "imageUrl", "slug", "pathname"],
  },

  // ── Blog Slug Check ─────────────────────────────────────────

  {
    name: "crm_check_blog_slug",
    description: "Check if a blog URL slug is available or already in use.",
    method: "GET",
    path: "/blogs/url-slug-exists",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to check the slug within",
        required: true,
        in: "query",
      },
      urlSlug: {
        type: "string",
        description: "The URL slug to check for availability",
        required: true,
        in: "query",
      },
      blogId: {
        type: "string",
        description: "Blog ID to exclude from the check (for updates)",
        required: false,
        in: "query",
      },
      postId: {
        type: "string",
        description: "Post ID to exclude from the check (for updates)",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "urlSlug", "blogId", "postId"],
  },

  // ── Blog Authors ────────────────────────────────────────────

  {
    name: "crm_list_blog_authors",
    description: "List all blog authors for a location.",
    method: "GET",
    path: "/blogs/authors",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list authors for",
        required: true,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of authors to return",
        required: false,
        in: "query",
      },
      offset: {
        type: "number",
        description: "Number of authors to skip for pagination",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "limit", "offset"],
  },

  {
    name: "crm_create_blog_author",
    description: "Create a new blog author.",
    method: "POST",
    path: "/blogs/authors",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to create the author under",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Full name of the author",
        required: true,
        in: "body",
      },
      email: {
        type: "string",
        description: "Email address of the author",
        required: false,
        in: "body",
      },
      bio: {
        type: "string",
        description: "Author biography text",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "URL of the author profile image",
        required: false,
        in: "body",
      },
      socialLinks: {
        type: "object",
        description: "Object of social media links (e.g. {twitter: 'url', linkedin: 'url'})",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "name", "email", "bio", "imageUrl", "socialLinks"],
  },

  {
    name: "crm_update_blog_author",
    description: "Update an existing blog author by ID.",
    method: "PUT",
    path: "/blogs/authors/:authorId",
    params: {
      authorId: {
        type: "string",
        description: "The author ID to update",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the author belongs to",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Updated full name of the author",
        required: false,
        in: "body",
      },
      email: {
        type: "string",
        description: "Updated email address of the author",
        required: false,
        in: "body",
      },
      bio: {
        type: "string",
        description: "Updated author biography text",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "Updated URL of the author profile image",
        required: false,
        in: "body",
      },
      socialLinks: {
        type: "object",
        description: "Updated social media links object",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "name", "email", "bio", "imageUrl", "socialLinks"],
  },

  {
    name: "crm_delete_blog_author",
    description: "Delete a blog author by ID.",
    method: "DELETE",
    path: "/blogs/authors/:authorId",
    params: {
      authorId: {
        type: "string",
        description: "The author ID to delete",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the author belongs to",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },

  // ── Blog Categories ─────────────────────────────────────────

  {
    name: "crm_list_blog_categories",
    description: "List blog categories for a location, optionally filtered by blog.",
    method: "GET",
    path: "/blogs/categories",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to list categories for",
        required: true,
        in: "query",
      },
      limit: {
        type: "number",
        description: "Maximum number of categories to return",
        required: false,
        in: "query",
      },
      offset: {
        type: "number",
        description: "Number of categories to skip for pagination",
        required: false,
        in: "query",
      },
      blogId: {
        type: "string",
        description: "Blog ID to filter categories by",
        required: false,
        in: "query",
      },
    },
    query: ["locationId", "limit", "offset", "blogId"],
  },

  {
    name: "crm_create_blog_category",
    description: "Create a new blog category.",
    method: "POST",
    path: "/blogs/categories",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to create the category under",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Name of the category",
        required: true,
        in: "body",
      },
      slug: {
        type: "string",
        description: "URL slug for the category",
        required: false,
        in: "body",
      },
      blogId: {
        type: "string",
        description: "Blog ID to associate the category with",
        required: false,
        in: "body",
      },
      description: {
        type: "string",
        description: "Description of the category",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "URL of the category image",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "name", "slug", "blogId", "description", "imageUrl"],
  },

  {
    name: "crm_update_blog_category",
    description: "Update an existing blog category by ID.",
    method: "PUT",
    path: "/blogs/categories/:categoryId",
    params: {
      categoryId: {
        type: "string",
        description: "The category ID to update",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the category belongs to",
        required: true,
        in: "body",
      },
      name: {
        type: "string",
        description: "Updated name of the category",
        required: false,
        in: "body",
      },
      slug: {
        type: "string",
        description: "Updated URL slug for the category",
        required: false,
        in: "body",
      },
      blogId: {
        type: "string",
        description: "Updated blog ID association",
        required: false,
        in: "body",
      },
      description: {
        type: "string",
        description: "Updated description of the category",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "Updated URL of the category image",
        required: false,
        in: "body",
      },
    },
    body: ["locationId", "name", "slug", "blogId", "description", "imageUrl"],
  },

  {
    name: "crm_delete_blog_category",
    description: "Delete a blog category by ID.",
    method: "DELETE",
    path: "/blogs/categories/:categoryId",
    params: {
      categoryId: {
        type: "string",
        description: "The category ID to delete",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the category belongs to",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },

  // ── Blog Posts ───────────────────────────────────────────────

  {
    name: "crm_get_blog_post",
    description: "Get a single blog post by ID.",
    method: "GET",
    path: "/blogs/posts/:postId",
    params: {
      postId: {
        type: "string",
        description: "The blog post ID to retrieve",
        required: true,
      },
    },
  },

  {
    name: "crm_create_blog_post",
    description: "Create a new blog post with content, metadata, and categorization.",
    method: "POST",
    path: "/blogs/posts",
    params: {
      locationId: {
        type: "string",
        description: "Location ID to create the post under",
        required: true,
        in: "body",
      },
      blogId: {
        type: "string",
        description: "Blog ID the post belongs to",
        required: true,
        in: "body",
      },
      title: {
        type: "string",
        description: "Title of the blog post",
        required: true,
        in: "body",
      },
      slug: {
        type: "string",
        description: "URL slug for the blog post",
        required: false,
        in: "body",
      },
      content: {
        type: "string",
        description: "Main content body of the blog post",
        required: false,
        in: "body",
      },
      status: {
        type: "string",
        description: "Publication status (e.g. 'draft', 'published')",
        required: false,
        in: "body",
      },
      author: {
        type: "string",
        description: "Author ID for the blog post",
        required: false,
        in: "body",
      },
      categories: {
        type: "array",
        description: "Array of category IDs to assign to the post",
        required: false,
        in: "body",
      },
      tags: {
        type: "array",
        description: "Array of tag strings for the post",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "URL of the blog post featured image",
        required: false,
        in: "body",
      },
      rawHTML: {
        type: "string",
        description: "Raw HTML content for the blog post",
        required: false,
        in: "body",
      },
      canonicalUrl: {
        type: "string",
        description: "Canonical URL for SEO purposes",
        required: false,
        in: "body",
      },
      description: {
        type: "string",
        description: "Meta description or excerpt for the blog post",
        required: false,
        in: "body",
      },
    },
    body: [
      "locationId", "blogId", "title", "slug", "content",
      "status", "author", "categories", "tags", "imageUrl",
      "rawHTML", "canonicalUrl", "description",
    ],
  },

  {
    name: "crm_update_blog_post",
    description: "Update an existing blog post by ID.",
    method: "PUT",
    path: "/blogs/posts/:postId",
    params: {
      postId: {
        type: "string",
        description: "The blog post ID to update",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the post belongs to",
        required: true,
        in: "body",
      },
      blogId: {
        type: "string",
        description: "Blog ID the post belongs to",
        required: false,
        in: "body",
      },
      title: {
        type: "string",
        description: "Updated title of the blog post",
        required: false,
        in: "body",
      },
      slug: {
        type: "string",
        description: "Updated URL slug for the blog post",
        required: false,
        in: "body",
      },
      content: {
        type: "string",
        description: "Updated main content body of the blog post",
        required: false,
        in: "body",
      },
      status: {
        type: "string",
        description: "Updated publication status (e.g. 'draft', 'published')",
        required: false,
        in: "body",
      },
      author: {
        type: "string",
        description: "Updated author ID for the blog post",
        required: false,
        in: "body",
      },
      categories: {
        type: "array",
        description: "Updated array of category IDs",
        required: false,
        in: "body",
      },
      tags: {
        type: "array",
        description: "Updated array of tag strings",
        required: false,
        in: "body",
      },
      imageUrl: {
        type: "string",
        description: "Updated URL of the blog post featured image",
        required: false,
        in: "body",
      },
      rawHTML: {
        type: "string",
        description: "Updated raw HTML content",
        required: false,
        in: "body",
      },
      canonicalUrl: {
        type: "string",
        description: "Updated canonical URL for SEO",
        required: false,
        in: "body",
      },
      description: {
        type: "string",
        description: "Updated meta description or excerpt",
        required: false,
        in: "body",
      },
    },
    body: [
      "locationId", "blogId", "title", "slug", "content",
      "status", "author", "categories", "tags", "imageUrl",
      "rawHTML", "canonicalUrl", "description",
    ],
  },

  {
    name: "crm_delete_blog_post",
    description: "Delete a blog post by ID.",
    method: "DELETE",
    path: "/blogs/posts/:postId",
    params: {
      postId: {
        type: "string",
        description: "The blog post ID to delete",
        required: true,
      },
      locationId: {
        type: "string",
        description: "Location ID the post belongs to",
        required: true,
        in: "query",
      },
    },
    query: ["locationId"],
  },
];
