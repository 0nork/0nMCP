# 0nMCP — Universal AI API Orchestrator
# https://github.com/0nork/0nMCP | https://0nmcp.com
# Patent Pending: USPTO #63/990,046

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# 0nMCP runs as an MCP stdio server — no port needed for stdio mode
# For HTTP/SSE mode, expose 3000
EXPOSE 3000

# Environment — all optional, passed at runtime via MCP client config
# ANTHROPIC_API_KEY — enables AI-powered task planning (optional)
# Additional service API keys are passed through MCP tool call parameters

# Health check via CLI
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node cli.js --version || exit 1

# Default: start as MCP stdio server
CMD ["node", "index.js"]
