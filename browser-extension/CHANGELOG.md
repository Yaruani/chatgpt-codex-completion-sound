# Browser Extension Changelog

## [1.3.2] - 2026-10-01

### Added

- Track multiple simultaneously generating conversations independently.
- Maintain an independent state machine for each conversation path.
- Discover additional active conversations from ChatGPT's sidebar processing
  indicators.
- Queue notification sounds so near-simultaneous completions are all audible.
- Suppress duplicate completion notifications for the same conversation across
  multiple content-script instances within a short window.
- Document the fixed unpacked-extension installation path used to preserve settings
  across manual GitHub updates.

## [1.3.1-debug] - 2026-10-01

### Changed

- Preserve an active response when navigating to another ChatGPT conversation.
- Track the original conversation in the sidebar using
  `role="status" aria-label="処理中"` / `Processing`.
- Notify after a previously observed sidebar processing spinner disappears and
  stays absent for 900 ms.
- Use the sidebar blue completion dot as a secondary completion signal.

## [1.2.7] - 2026-09-14

### Fixed

- Track generation only after an explicit user submit action.
- Use ChatGPT's canonical `data-testid="stop-button"` instead of fuzzy
  aria/text matching.
- Reset tracked generation state when navigating between existing conversations.
- Detect completion from the stop-button removal mutation without a settle timer.
- Document that already-open ChatGPT tabs should be reloaded once after an
  extension update.

### Added

- Seven selectable bundled sounds.
- Automatic preview when the selected sound or volume changes.
