# Codex Completion Sound

Plays a local notification sound when a VS Code Codex **UI turn actually completes**.

## Features

- Seven bundled sounds: Chime, Bell, Double, Soft, Microwave Ding, Bright Bell, and Game Clear.
- 0–100% volume in 5% steps.
- Test playback.
- On/off toggle.
- Windows local playback.

## Completion detection

Version 1.2.4 no longer treats rollout JSONL `task_complete` records as UI completion.

Instead, it reads Codex's local `~/.codex/logs_2.sqlite` database in **read-only**
mode and reacts only to the app-server lifecycle event:

`app-server event: turn/completed`

The monitor seeds itself at the current maximum log ID at startup, so historical
events are never replayed. A local single-instance lock prevents multiple VS Code
windows from playing the same completion sound.

No Codex content is uploaded or retained by this extension.

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and use:

- `Codex Completion Sound: Test Sound`
- `Codex Completion Sound: Select Sound`
- `Codex Completion Sound: Set Volume`
- `Codex Completion Sound: Toggle`
- `Codex Completion Sound: Diagnostics`

## Compatibility

This build requires a VS Code extension-host Node runtime that provides
`node:sqlite` (Node.js 22.5 or later). Playback is currently Windows-only.

Unofficial. Not affiliated with or endorsed by OpenAI.

Version: 1.2.4
