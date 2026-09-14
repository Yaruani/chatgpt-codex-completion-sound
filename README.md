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

## Browser extension — install from GitHub

The browser extension can be installed directly from this repository without
using the Chrome Web Store.

1. On GitHub, choose **Code > Download ZIP**, or clone the repository with Git.
2. Extract the ZIP if you downloaded it.
3. Open `chrome://extensions/` in Chrome or `brave://extensions/` in Brave.
4. Enable **Developer mode**.
5. Choose **Load unpacked**.
6. Select the repository's `browser-extension` folder.
7. If ChatGPT was already open, reload the ChatGPT tab once.

Manual GitHub installations do **not** update automatically. To update, download
or pull the latest repository version, click **Reload** for the extension on the
browser's extensions page, then reload any already-open ChatGPT tabs.

## Browser extension — usage

1. Open `https://chatgpt.com/` and use ChatGPT normally.
2. Click the extension icon to open its settings.
3. Enable or disable completion sounds.
4. Select one of the seven bundled sounds.
5. Adjust the volume. Changing the sound or volume automatically previews it.
6. Use **Test** to play the currently selected sound at any time.
7. Send a prompt. When that response finishes generating, the selected sound is
   played.

If you navigate to another existing ChatGPT conversation while a response is
still generating, tracking for that response is cancelled. This prevents stale
state from causing a notification in the wrong conversation.

## Privacy model

The browser extension observes ChatGPT UI state locally and stores only its
settings in browser local extension storage.

The VS Code extension opens `~/.codex/logs_2.sqlite` in read-only mode and
watches local App Server lifecycle records needed to detect
`turn/started` and `turn/completed`. It does not upload, retain, or transmit
Codex log contents.

See [PRIVACY.md](PRIVACY.md) for the complete policy.

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

