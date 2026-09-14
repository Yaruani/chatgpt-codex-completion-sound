# Architecture

## Browser extension

1. `content.js` observes ChatGPT UI state.
2. A visible Stop control marks the session as busy.
3. When the Stop control remains absent for the settle interval, completion is emitted.
4. `background.js` creates an offscreen audio document when needed.
5. `offscreen.js` plays one of the bundled WAV files.

No network request is required.

## VS Code extension

1. The extension runs in the local UI extension host.
2. Existing Codex rollout JSONL files are indexed at EOF.
3. New appends under `~/.codex/sessions` are parsed.
4. `session_meta` determines whether the session originated from VS Code.
5. `event_msg.task_complete` triggers the local sound.
6. Volume is applied by creating a locally scaled PCM16 WAV in VS Code global storage.
7. Windows `winmm.dll / PlaySound` performs playback.

## Failure model

The browser detector depends on observable ChatGPT UI semantics. Major ChatGPT
UI changes can require detector updates.

The VS Code detector depends on Codex's local session/event format. If Codex
changes those metadata/event names, detection must be updated.
