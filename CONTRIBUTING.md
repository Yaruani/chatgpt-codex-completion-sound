# Contributing

Contributions are welcome.

## Principles

- Keep the extensions small and auditable.
- Do not add analytics, advertising, tracking, or remote code.
- Minimize permissions.
- Do not log or transmit ChatGPT/Codex content.
- Preserve English and Japanese documentation for user-facing changes.

## Development

### VS Code

```powershell
cd vscode-extension
npm test
node --check src/extension.js
```

### Browser

Load `browser-extension/` as an unpacked extension in a Chromium browser.

## Pull requests

Include:

- A concise explanation of the change.
- Manual test steps.
- Privacy/permission impact, if any.
- English and Japanese user-facing documentation updates.
