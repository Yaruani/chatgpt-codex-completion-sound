# Codex Completion Sound

[日本語](README.ja.md)

An unofficial VS Code extension for Windows that plays a local notification
sound when a Codex task started from the VS Code Codex experience completes.

## Features

- Four bundled sounds: Chime, Bell, Double, Soft.
- 0–100% volume in 5% steps.
- Test playback.
- On/off toggle.
- English/Japanese commands and runtime messages.
- No analytics, telemetry, ads, accounts, or network requests.

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and use:

- `Codex Completion Sound: Test Sound`
- `Codex Completion Sound: Select Sound`
- `Codex Completion Sound: Set Volume`
- `Codex Completion Sound: Toggle`
- `Codex Completion Sound: Diagnostics`

## How completion detection works

The extension runs in the local VS Code UI extension host and monitors local
Codex session JSONL files under `~/.codex/sessions` in read-only mode.

It identifies VS Code-originated sessions and listens for the local
`task_complete` event. Existing files are seeded at EOF when the extension
starts, so old completions do not replay.

## Privacy

No Codex content is transmitted by this extension. See the repository
`PRIVACY.md` for details.

## Platform

This release supports **Windows** for notification playback.

## Disclaimer

Unofficial. Not affiliated with or endorsed by OpenAI.

Version: 1.2.0
