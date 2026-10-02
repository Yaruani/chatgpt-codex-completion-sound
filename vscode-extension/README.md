# Codex Completion Sound

Plays a local notification sound when a VS Code Codex **UI turn actually completes**.

## Features

- Seven bundled sounds: Chime, Bell, Double, Soft, Microwave Ding, Bright Bell, and Game Clear.
- 0–100% volume in 5% steps.
- Native VS Code Extension Settings UI.
- Optional subagent completion notifications with a separate selectable sound.
- Shared application-wide settings across VS Code windows.
- Serialized playback so near-simultaneous completions are heard one after another.
- Test playback.
- On/off toggle.
- Windows local playback.

## Completion detection

Version 1.2.6 monitors Codex's local rollout JSONL files under:

`~/.codex/sessions`

The monitor watches appended rollout data in real time and recognizes both legacy and current lifecycle names:

- `task_started` / `turn_started`
- `task_complete` / `turn_complete`

Main and subagent sessions are classified from rollout `session_meta`.
For subagents, inherited parent history before `subagent_history_start_ordinal`
is ignored, so copied historical completion records do not trigger sounds.

The monitor also suppresses stale events that predate extension startup and
deduplicates replayed thread/turn events if a rollout file is rewritten or
rescanned.

A local single-instance lock ensures only one VS Code window owns the monitor.
That owner watches the shared Codex session directory, so multiple Codex turns
running in different VS Code windows can each notify correctly.

No Codex content is uploaded or independently retained by this extension.

## Settings

Open **Extensions → Codex Completion Sound → gear icon → Extension Settings**,
or run `Codex Completion Sound: Open Settings`.

The native VS Code settings page provides:

- Enable/disable checkbox.
- Main completion sound selector.
- Volume setting from 0–100%.
- Optional subagent completion notifications.
- Separate subagent sound selector.
- Automatic preview when sound or volume settings change.

Settings are application-wide and shared across VS Code windows.

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and use:

- `Codex Completion Sound: Test Sound`
- `Codex Completion Sound: Select Sound`
- `Codex Completion Sound: Set Volume`
- `Codex Completion Sound: Toggle`
- `Codex Completion Sound: Diagnostics`

## Compatibility

Notification playback is currently Windows-only.

Completion detection depends on Codex's local rollout JSONL session format.
If Codex changes that format or lifecycle metadata, the detector may require an
update.

Unofficial. Not affiliated with or endorsed by OpenAI.

Version: 1.2.6
