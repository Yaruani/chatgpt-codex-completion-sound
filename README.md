# Completion Sound for ChatGPT & Codex

[日本語](README.ja.md)

A small, privacy-focused set of notification extensions for people who run
long ChatGPT or Codex tasks and want an audible signal when the task finishes.

This repository contains two independent extensions:

- **ChatGPT Completion Sound** — Manifest V3 extension for Chrome / Brave.
- **Codex Completion Sound** — VS Code extension for Codex on Windows.

## Features

- Seven bundled sounds: Chime, Bell, Double, Soft, Microwave Ding, Bright Bell,
  and Game Clear.
- Browser extension: popup settings, volume, on/off, test playback, and
  automatic preview.
- VS Code extension: native Extension Settings UI, volume, sound selector,
  on/off, test command, and automatic preview.
- English and Japanese UI/documentation.
- No analytics, telemetry, ads, accounts, or remote code.
- No user data is transmitted by either extension.

## Privacy model

The browser extension observes ChatGPT UI state locally and stores only its
settings in browser local extension storage.

The VS Code extension opens `~/.codex/logs_2.sqlite` in read-only mode and
watches local App Server lifecycle records needed to detect
`turn/started` and `turn/completed`. It does not upload, retain, or transmit
Codex log contents.

See [PRIVACY.md](PRIVACY.md) for the complete policy.

## Browser extension update note

If ChatGPT was already open when the browser extension was updated, reload that
ChatGPT tab once so the current content script is loaded.

## Build

### Browser

```powershell
./scripts/build-browser.ps1
```

### VS Code

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

## License

MIT. See [LICENSE](LICENSE).

## Disclaimer

This project is unofficial and is not affiliated with or endorsed by OpenAI.
See [NOTICE.md](NOTICE.md).
