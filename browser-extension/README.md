# ChatGPT Completion Sound

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

## Completion detection

The extension arms only after a user submit action, then tracks ChatGPT's
canonical `[data-testid="stop-button"]` generation control. A notification is
sent only after that control appears and then disappears.

Navigating to another existing ChatGPT conversation cancels the previous
conversation's tracking state.

## After updating the extension

If ChatGPT was already open when the extension was updated, reload that ChatGPT
tab once so the current content script is loaded.

## Privacy

The extension runs only on `chatgpt.com`. Settings are stored locally in
`chrome.storage.local`. No conversation content is transmitted by the extension.

Unofficial. Not affiliated with or endorsed by OpenAI.

Version: 1.2.7
