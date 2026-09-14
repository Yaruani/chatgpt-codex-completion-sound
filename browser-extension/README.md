# ChatGPT Completion Sound

[日本語](README.ja.md)

A Manifest V3 extension for Chrome and Brave that plays a local sound when
ChatGPT finishes generating and returns to an idle/input-waiting state.

## Features

- Four bundled sounds.
- Volume control.
- Enable/disable switch.
- Test playback.
- English/Japanese UI.
- No analytics, telemetry, ads, accounts, or network requests by the extension.

## Permissions

- `storage`: stores only extension settings locally.
- `offscreen`: plays the bundled local WAV notification.
- `https://chatgpt.com/*`: observes ChatGPT UI state locally to detect completion.

See the repository privacy policy for details.

## Development installation

1. Open `chrome://extensions/` or `brave://extensions/`.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select this `browser-extension` folder.
5. Reload any already-open ChatGPT tab.

## Version

1.2.0
