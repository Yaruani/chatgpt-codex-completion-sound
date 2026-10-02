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
- The VS Code extension locally reads Codex rollout JSONL files under
  `~/.codex/sessions` (or the corresponding `CODEX_HOME` path).
- The VS Code extension uses only local session metadata and turn lifecycle
  records needed to distinguish main and subagent completions.
- Codex rollout files are not modified, uploaded, or independently persisted by
  the extension.
- Notification audio is bundled with the extension.
- The extensions make no network requests of their own.
