# Privacy Policy

Last updated: 2026-09-14

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
- Stores only extension preferences such as enabled state, sound choice,
  volume, and internal timing values in `chrome.storage.local`.
- Uses the `offscreen` permission only to play the bundled local WAV file
  after completion.
- Makes no network requests of its own.

## VS Code extension

The VS Code extension:

- Runs locally in the VS Code UI extension host.
- Reads Codex JSONL session files under the local Codex home directory,
  normally `~/.codex/sessions`, in read-only mode.
- Parses appended JSON records to identify VS Code-originated sessions and
  task-completion events.
- Does not modify Codex session files.
- Does not upload, transmit, log, or retain session content outside the
  existing Codex files.
- Stores only extension preferences in VS Code extension `globalState`.
- Stores locally generated volume-scaled copies of the bundled notification
  WAV files in the extension's VS Code global storage directory.
- Makes no network requests of its own.

## Data retention

The project does not operate a server and therefore has no server-side data
retention.

Local extension settings remain on the user's device until removed by the
browser/VS Code profile or extension data cleanup.

## Third parties

The extensions do not send data to OpenAI, the project maintainer, advertisers,
analytics providers, or any other third party. ChatGPT and Codex themselves may
communicate with OpenAI as part of their normal operation; that communication
is outside this extension's control.

## Changes

Material changes to this policy will be documented in the repository and
release notes.

## Contact

Use the public repository's issue tracker after replacing the repository
placeholder during release configuration.
