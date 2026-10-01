# Browser Extension Changelog

## [1.3.2] - 2026-10-01

### Added

- Track multiple simultaneously generating conversations independently.
- Maintain an independent state machine for each conversation path.
- Keep tracking a generating conversation after navigation to another ChatGPT
  conversation by using the corresponding sidebar processing state.
- Discover additional active conversations from ChatGPT's sidebar processing
  indicators.
- Queue notification sounds so near-simultaneous completions are all audible.
- Suppress duplicate completion notifications for the same conversation across
  multiple content-script instances within a short window.
- Add a fixed unpacked-extension installer workflow that preserves local
  settings across manual GitHub updates.

### Changed

- Completion detection uses the current conversation's visible generation stop
  control and the sidebar processing state for conversations that are no longer
  displayed.
- Sidebar spinner disappearance must remain stable for 900 ms before it is
  treated as completion.
- The sidebar completion dot is used only as a secondary completion signal.
- Documentation now describes multi-conversation tracking, background-tab
  notification, fixed-folder updates, and the current privacy behavior.

### Security / privacy

- No new permissions.
- Host access remains limited to `https://chatgpt.com/*`.
- No analytics, telemetry, remote code, or extension-originated network
  requests.

## [1.2.7] - 2026-09-14

### Fixed

- Use ChatGPT's canonical `data-testid="stop-button"` for completion tracking.
- Detect completion from stop-button removal.
- Document that already-open ChatGPT tabs should be reloaded once after an
  extension update.

### Added

- Seven selectable bundled sounds.
- Automatic preview when the selected sound or volume changes.
