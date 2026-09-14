# Security Policy

## Supported versions

Only the latest released version is actively supported.

## Reporting a vulnerability

Do not include private ChatGPT conversations, Codex session contents, source
code, credentials, tokens, or other secrets in a public issue.

For non-sensitive bugs, use the repository issue tracker.

Before a public release, configure a private security-contact method in the
GitHub repository (for example GitHub private vulnerability reporting) and
replace this paragraph with the final reporting instructions.

## Security design

- No remote code execution or remote script loading.
- No analytics or telemetry.
- Browser host access is limited to `chatgpt.com`.
- VS Code session access is read-only.
- Notification audio is bundled with the extension.
