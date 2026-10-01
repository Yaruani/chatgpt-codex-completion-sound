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
- Browser extension: popup settings, volume, on/off, test playback, automatic
  preview, multi-conversation tracking, cross-conversation tracking, and
  background-tab notification.
- VS Code extension: native Extension Settings UI, volume, sound selector,
  on/off, test command, and automatic preview.
- English and Japanese UI/documentation.
- No analytics, telemetry, ads, accounts, or remote code.
- No user data is transmitted by either extension.

## Browser extension — recommended GitHub installation

Download these two files from the
[latest GitHub Release](https://github.com/Yaruani/chatgpt-codex-completion-sound/releases/latest):

- `install-chatgpt-completion-sound.ps1`
- `chatgpt-completion-sound-browser-*-unpacked.zip`

For manual GitHub installs, keep the unpacked extension in this fixed folder:

```text
%USERPROFILE%\Extensions\chatgpt-completion-sound
```

This avoids losing browser-local settings on each manual update.

Run:

```powershell
$d=(New-Object -ComObject Shell.Application).NameSpace("shell:Downloads").Self.Path; $s=Join-Path $d "install-chatgpt-completion-sound.ps1"; Unblock-File $s; & $s
```

The script follows the real Windows Downloads known folder even if Downloads
has been redirected to another drive, and installs/updates the extension under
`%USERPROFILE%\Extensions\chatgpt-completion-sound`.

On first install only, open `chrome://extensions/` or `brave://extensions/`,
enable Developer mode, choose **Load unpacked**, and select that fixed folder.
For later updates, do **not** remove the extension: run the installer again,
click **Reload** on the existing extension, and reload already-open ChatGPT tabs.
The extension's on/off, sound, and volume settings remain associated with the
same unpacked extension.

## Browser extension — usage

Open `https://chatgpt.com/`, configure the popup, and send prompts normally.
The browser extension can independently track multiple generating conversations.
You may navigate to another ChatGPT conversation while earlier responses are
still generating; the extension keeps tracking them through the sidebar. If
several responses finish close together, their sounds are queued rather than
cutting each other off.

It can also notify while the ChatGPT tab is in the background or the browser is
minimized. The ChatGPT page must remain open and not be discarded for page-side
tracking to continue.

## Privacy model

The browser extension observes ChatGPT UI state locally and stores only its
settings in browser local extension storage. Transient conversation paths and
completion state used for tracking are kept only in extension memory.

The VS Code extension opens `~/.codex/logs_2.sqlite` in read-only mode and
watches local App Server lifecycle records needed to detect `turn/started` and
`turn/completed`. It does not upload, retain, or transmit Codex log contents.

See [PRIVACY.md](PRIVACY.md) for the complete policy.

## Build

### Browser

```powershell
./scripts/build-browser.ps1
```

The browser build is written as:

```text
dist/chatgpt-completion-sound-browser-<version>-unpacked.zip
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
