# ChatGPT Completion Sound

A lightweight Manifest V3 extension for Chrome and Brave that plays a local
notification sound when ChatGPT finishes generating.

## Features

- Seven bundled sounds: Chime, Bell, Double, Soft, Microwave Ding, Bright Bell,
  and Game Clear.
- Independent volume control.
- Enable/disable switch.
- Test playback and automatic preview when sound or volume changes.
- Tracks multiple generating ChatGPT conversations independently.
- Keeps tracking a generating conversation after you navigate to another
  ChatGPT conversation.
- Can notify while the ChatGPT tab is in the background or the browser is
  minimized, as long as the ChatGPT tab remains open and active in Chromium.
- Queues notification sounds so near-simultaneous completions are all audible.
- English and Japanese UI.
- No analytics, telemetry, advertising, accounts, or remote code.

## Completion detection

The extension observes ChatGPT UI state locally. On the currently displayed
conversation it uses ChatGPT's visible generation stop control. For generating
conversations that are no longer displayed, it tracks the corresponding
sidebar processing state. Each conversation path has an independent tracker.

These are observed ChatGPT UI signals rather than a public ChatGPT extension
API, so a future ChatGPT UI change can require an extension update.

## Recommended GitHub installation

To keep settings across manual updates, use a fixed unpacked-extension folder:

```text
%USERPROFILE%\Extensions\chatgpt-completion-sound
```

Place `install-chatgpt-completion-sound.ps1` and the latest
`chatgpt-completion-sound-browser-*-unpacked.zip` in your Windows Downloads
folder. The installer resolves the real Windows Downloads known folder, so it
also works when Downloads has been redirected to another drive.

Run:

```powershell
$d=(New-Object -ComObject Shell.Application).NameSpace("shell:Downloads").Self.Path; $s=Join-Path $d "install-chatgpt-completion-sound.ps1"; Unblock-File $s; & $s
```

For the first installation, open `chrome://extensions/` or
`brave://extensions/`, enable Developer mode, choose **Load unpacked**, and
select:

```text
%USERPROFILE%\Extensions\chatgpt-completion-sound
```

For later updates, do **not** remove the extension. Run the installer again,
then click **Reload** on the existing extension. Keeping the same fixed folder
keeps the unpacked extension identity and its `chrome.storage.local` settings.
Finally, reload any ChatGPT tabs that were already open.

If you were previously loading the extension from a different folder, switching
to the fixed folder is a one-time reinstall and may reset settings once. After
that, normal updates preserve them.

## Usage

Open the extension popup to enable/disable notifications, select one of the
seven sounds, set volume, or test the selected sound. Send prompts normally.
Each tracked conversation plays one notification when its response finishes.

The page-side tracker requires the ChatGPT tab to remain open. Closing or
browser-discarding the relevant ChatGPT page stops that page's tracking.

## Privacy

The extension runs only on `chatgpt.com`. It observes UI state locally and
stores settings in `chrome.storage.local`. Conversation content is not sent by
the extension.

Unofficial. Not affiliated with or endorsed by OpenAI.

Version: 1.3.2
