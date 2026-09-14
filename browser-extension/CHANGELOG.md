# Browser Extension Changelog

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
