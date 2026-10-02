# Changelog

All notable project-level changes are summarized here.

For detailed component history, see:

- [Browser extension changelog](browser-extension/CHANGELOG.md)
- [VS Code extension changelog](vscode-extension/CHANGELOG.md)

## VS Code extension 1.2.6 - 2026-10-02

### Fixed

- Subagent completion no longer triggers the main completion sound.
- Optional subagent notifications now have a separate sound and are disabled by default.
- Replaced buffered SQLite lifecycle polling with real-time Codex rollout JSONL monitoring.
- Inherited subagent history, stale startup history, and replayed rollout events are suppressed.
- Multiple simultaneous Codex threads are deduplicated independently.

### Changed

- VS Code settings are shared application-wide across windows.
- Near-simultaneous completion sounds are serialized.
- The obsolete SQLite completion monitor was removed.

### Verified

- Main completion detection measured in the tens of milliseconds in local testing.
- Verified 3 subagent completions + 1 main completion.
- Verified two concurrent Codex tasks in separate VS Code windows each notify once.

## Browser extension 1.3.2 - 2026-10-01

### Added

- Independent tracking for multiple simultaneously generating ChatGPT
  conversations.
- Continued tracking after navigating to another ChatGPT conversation.
- Background-tab/minimized-browser completion notification while the ChatGPT
  page remains open and active.
- Queued notification playback for near-simultaneous completions.
- Fixed-folder GitHub installer workflow that preserves browser-local settings
  across manual updates.

### Changed

- Completion detection now combines the current conversation's generation stop
  control with ChatGPT sidebar processing state for conversations that are no
  longer displayed.
- GitHub installation and privacy documentation updated for the current
  browser implementation.

### Security / privacy

- No new browser permissions.
- Host access remains restricted to `https://chatgpt.com/*`.
- No analytics, telemetry, remote code, or extension-originated network
  requests.

## VS Code extension 1.2.5 - 2026-09-14

### Added

- Native VS Code Extension Settings UI for enable/disable, notification sound,
  and volume.
- Seven bundled sounds and automatic preview when sound or volume changes.
- `Codex Completion Sound: Open Settings` command.

### Detection

- Completion detection uses the local read-only Codex database
  `~/.codex/logs_2.sqlite`.
- Only Codex App Server lifecycle events `turn/started` and `turn/completed`
  are used for UI-turn completion tracking.
