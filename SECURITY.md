# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.2.x   | Yes       |
| 1.1.x   | Yes       |
| < 1.1   | No        |

## Reporting a Vulnerability

If you discover a security vulnerability in 0nMCP, **please report it responsibly**.

**Do NOT open a public issue for security vulnerabilities.**

Instead, email **hello@0nork.com** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will acknowledge your report within 48 hours and provide a detailed response within 7 days.

## Security Model

0nMCP is designed with security as a core principle:

- **Local execution** — The MCP server runs entirely on your machine
- **No proxy** — API calls go directly to each service, never through our servers
- **No telemetry** — We do not collect usage data, analytics, or crash reports
- **Local credentials** — Stored in `~/.0n/connections/` as `.0n` files on your filesystem
- **Audit trail** — Every execution is logged to `~/.0n/history/`
- **Open source** — Every line of code is auditable

## Best Practices

When using 0nMCP in production:

1. **Protect your `.0n` directory** — Set appropriate file permissions (`chmod 700 ~/.0n`)
2. **Use environment variables** — Reference secrets with `{{env.VAR_NAME}}` instead of hardcoding
3. **Review execution history** — Check `~/.0n/history/` regularly
4. **Keep updated** — Run the latest version for security patches
5. **Audit API keys** — Use scoped/restricted API keys when possible

## Acknowledgments

We appreciate the security research community. Responsible disclosures help keep the 0n ecosystem safe for everyone.
