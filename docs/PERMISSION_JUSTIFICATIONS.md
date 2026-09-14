# Permission Justifications

## Chrome / Brave

### `storage`

Stores only local extension preferences:

- enabled/disabled
- selected sound
- volume
- internal completion-detection timing values

No synchronized cloud storage is used.

### `offscreen`

Required to play bundled notification audio from a Manifest V3 extension
background context.

### Host permission: `https://chatgpt.com/*`

Required for the content script that locally observes ChatGPT UI state and
detects when generation finishes.

The permission is deliberately restricted to ChatGPT and is not granted for
all websites.

## VS Code

VS Code extensions do not use a browser-style permission prompt. The extension
runs with the local VS Code process permissions.

Its file access is limited by implementation to the local Codex session
directory and its own extension storage/audio assets.
