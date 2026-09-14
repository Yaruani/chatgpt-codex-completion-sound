# Changelog

## [1.2.4] - 2026-09-14

### Fixed

- Replaced rollout JSONL `task_complete` detection with the Codex App Server `turn/completed` event from `~/.codex/logs_2.sqlite`.
- Historical SQLite log rows are ignored by seeding at the current maximum log ID.
- Added a local single-instance monitor lock to prevent duplicate sounds from multiple VS Code windows.
- Removed the 2-second heuristic completion delay.

## [1.2.2] - 2026-09-14

### Added

- Three distinct original notification sounds:
  - Microwave Ding
  - Bright Bell
  - Game Clear
- Seven selectable notification sounds in total.

## [1.2.1] - 2026-09-14

### Fixed

- Completion sounds are no longer played for every internal Codex turn.
- A `task_complete` now arms a notification instead of playing immediately.
- A subsequent `task_started` cancels the pending sound.
- The sound plays only after Codex remains idle for 2 seconds, matching the UI transition from the Stop square to the Send arrow much more closely.

All notable changes to this project are documented here.

## [1.2.0] - 2026-09-14

### Added

- Public-release repository structure for browser and VS Code extensions.
- English and Japanese localization and documentation.
- Four selectable bundled notification sounds.
- Browser volume control and sound selector.
- VS Code volume control from 0–100% in 5% steps.
- Privacy, security, support, contributing, publishing, and store-listing docs.
- GitHub Actions build validation.
- Chrome Web Store graphic assets.
- Marketplace icon and package metadata.
- Automated release-configuration helper.

### Security / privacy

- No analytics or telemetry.
- No remote code.
- No network transmission of ChatGPT or Codex content.
- Browser host access restricted to `https://chatgpt.com/*`.
- VS Code Codex session files are read-only.
