# Completion Sound for ChatGPT & Codex

[日本語](README.ja.md)

A small, privacy-focused set of notification extensions for people who run
long ChatGPT or Codex tasks and want an audible signal when the task finishes.

This repository contains two independent extensions:

- **ChatGPT Completion Sound** — Manifest V3 extension for Chrome / Brave.
- **Codex Completion Sound** — VS Code extension for Codex on Windows.

## Features

- Plays a short sound when processing finishes.
- Four bundled sounds: Chime, Bell, Double, and Soft.
- Browser extension: per-extension volume slider and on/off switch.
- VS Code extension: 0–100% volume in 5% steps, sound selector, test command,
  and on/off toggle.
- English and Japanese UI/documentation.
- No analytics, telemetry, ads, accounts, or remote code.
- No user data is transmitted by either extension.

## Privacy model

The browser extension observes the ChatGPT page locally only to detect the
transition from generating to idle. It stores only its settings in browser
local extension storage.

The VS Code extension reads local Codex session JSONL files under
`~/.codex/sessions` in read-only mode. It checks session/event metadata needed
to determine whether a VS Code Codex task completed. It does not upload,
retain, or transmit session contents.

See [PRIVACY.md](PRIVACY.md) for the complete policy.

## Repository layout

```text
browser-extension/     Chrome / Brave Manifest V3 extension
vscode-extension/      VS Code Codex extension
docs/                  Publishing, architecture, store listing, checklists
store-assets/          Store icons, promo images, and screenshots
scripts/               Configure/package helpers
.github/               CI and GitHub templates
```

## Build

### Browser

```powershell
./scripts/build-browser.ps1
```

### VS Code

```powershell
cd vscode-extension
npm test
npx --yes @vscode/vsce@latest package
```

Before Marketplace publishing, configure your permanent publisher and GitHub
repository identifiers:

```powershell
./scripts/configure-release.ps1 `
  -PublisherId "YOUR_PERMANENT_PUBLISHER_ID" `
  -GitHubOwner "YOUR_GITHUB_USER_OR_ORG" `
  -RepositoryName "chatgpt-codex-completion-sound"
```

**Do not choose a VS Code publisher ID casually. Marketplace publisher IDs are
permanent identifiers.**

## Publishing

- [VS Code Marketplace publishing](docs/VS_CODE_MARKETPLACE.md)
- [Chrome Web Store publishing](docs/CHROME_WEB_STORE.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)

## License

MIT. See [LICENSE](LICENSE).

## Disclaimer

This project is unofficial and is not affiliated with or endorsed by OpenAI.
See [NOTICE.md](NOTICE.md).
