# Privacy Policy

Last updated: 2026-10-02

## Summary

Completion Sound for ChatGPT & Codex does **not** collect, sell, share, upload,
or transmit personal information, conversation content, source code, prompts,
Codex output, browsing history, or usage analytics.

There is no analytics SDK, telemetry endpoint, advertising SDK, account
system, or remote-code loader in either extension.

## Browser extension

The browser extension:

- Runs only on `https://chatgpt.com/*`.
- Observes page UI state locally to determine whether ChatGPT is generating.
- Does not read or transmit conversation text for analytics or storage.
- Stores only extension preferences such as enabled state, sound choice, and
  volume in `chrome.storage.local`.
- Holds transient conversation paths and completion-tracking state only in
  extension memory while tracking active responses.
- Uses the `offscreen` permission only to play bundled local WAV files.
- Makes no network requests of its own.

## VS Code extension

The VS Code extension:

- Runs locally in the VS Code UI extension host.
- Watches Codex rollout JSONL files under `~/.codex/sessions` (or the configured
  `CODEX_HOME` equivalent).
- Reads session metadata and turn lifecycle records locally to identify main and
  subagent completions.
- Ignores inherited subagent history, stale pre-startup events, and replayed
  thread/turn events.
- Does not modify Codex rollout files.
- Does not upload, transmit, or independently persist Codex rollout contents.
- Stores extension preferences in the user's normal VS Code settings.
- Stores locally generated volume-scaled copies of bundled notification WAV
  files in the extension's VS Code global storage directory.
- Uses a small local temporary lock file containing only process information
  to prevent duplicate monitoring and notification playback across VS Code
  windows.
- Makes no network requests of its own.

## Data retention

The project does not operate a server and therefore has no server-side data
retention.

Local VS Code/browser settings and generated local audio-cache files remain on
the user's device until removed by the relevant profile/settings cleanup,
extension cleanup, or normal temporary-file cleanup. Browser conversation
tracking state is transient and is not persisted by the extension.

## Third parties

The extensions do not send data to OpenAI, the project maintainer,
advertisers, analytics providers, or any other third party. ChatGPT and Codex
themselves may communicate with OpenAI as part of their normal operation; that
communication is outside this extension's control.

## Changes

Material changes to this policy will be documented in the repository and
release notes.

## Contact

For non-sensitive questions or bugs, use the public repository issue tracker.
For security vulnerabilities, use the repository's GitHub Private vulnerability
reporting feature.
