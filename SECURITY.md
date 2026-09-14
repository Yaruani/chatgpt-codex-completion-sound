# Security Policy

## Supported versions

Only the latest released version is actively supported.

## Reporting a vulnerability

Do not include private ChatGPT conversations, Codex session contents, source
code, credentials, tokens, or other secrets in a public issue.

For security vulnerabilities, use this repository's **Private vulnerability
reporting** feature on GitHub:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Submit the report privately to the repository maintainers.

For non-sensitive bugs, use the public repository issue tracker.

## Security design

- No remote code execution or remote script loading.
- No analytics or telemetry.
- Browser host access is limited to `chatgpt.com`.
- The VS Code extension opens the local Codex `~/.codex/logs_2.sqlite`
  database in read-only mode.
- The VS Code extension only uses local Codex App Server lifecycle log records
  needed to detect `turn/started` and `turn/completed`.
- Notification audio is bundled with the extension.
- The extensions make no network requests of their own.
