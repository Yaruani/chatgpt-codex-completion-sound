# ChatGPT Completion Sound

[日本語](README.ja.md)

A lightweight Manifest V3 extension for Chrome and Brave that plays a local
notification sound when ChatGPT finishes generating.

## Features

- Seven bundled sounds: Chime, Bell, Double, Soft, Microwave Ding, Bright Bell,
  and Game Clear.
- Independent volume control.
- Enable/disable switch.
- Test playback.
- Automatic preview when sound or volume changes.
- English and Japanese UI.
- No analytics, telemetry, advertising, accounts, or remote code.

## Install from GitHub

1. On the repository page, choose **Code > Download ZIP**, or clone the
   repository with Git.
2. Extract the ZIP if needed.
3. Open `chrome://extensions/` in Chrome or `brave://extensions/` in Brave.
4. Enable **Developer mode**.
5. Choose **Load unpacked**.
6. Select the `browser-extension` folder.
7. Reload any ChatGPT tab that was already open.

Manual GitHub installations do not update automatically. To update, replace or
pull the repository files, click **Reload** for this extension on the browser's
extensions page, then reload any already-open ChatGPT tabs.

## Usage

1. Open `https://chatgpt.com/`.
2. Click the extension icon to open the settings popup.
3. Enable or disable the notification.
4. Select one of the seven bundled sounds.
5. Adjust the volume. Sound and volume changes are previewed automatically.
6. Use **Test** to play the currently selected sound.
7. Send a prompt normally. The selected sound plays when that response finishes
   generating.

## Completion detection

The extension arms only after a user submit action, then tracks ChatGPT's
canonical `[data-testid="stop-button"]` generation control. A notification is
sent only after that control appears and then disappears.

Navigating to another existing ChatGPT conversation while a response is still
generating cancels tracking for that response.

## Privacy

The extension runs only on `chatgpt.com`. Settings are stored locally in
`chrome.storage.local`. No conversation content is transmitted by the extension.

Unofficial. Not affiliated with or endorsed by OpenAI.

Version: 1.2.7

