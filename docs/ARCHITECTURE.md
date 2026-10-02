# Architecture

## Browser extension

1. `content.js` observes ChatGPT UI state locally.
2. A visible generation Stop control starts or refreshes the tracker for the
   currently displayed conversation.
3. One tracker is kept per conversation path, allowing multiple ChatGPT
   responses to be monitored at the same time.
4. When the user navigates away from a generating conversation, the tracker is
   preserved and follows that conversation's sidebar processing state.
5. A previously observed sidebar processing indicator must remain absent for
   900 ms before completion is emitted. The sidebar completion dot is only a
   secondary signal.
6. `background.js` suppresses short-window duplicate notifications for the same
   conversation and serializes notification sounds through a playback queue.
7. `offscreen.js` plays the bundled WAV file and waits for actual playback end
   before the queue advances.

No extension-originated network request is required.

The browser detector depends on observable ChatGPT UI semantics rather than a
public ChatGPT extension API. Major ChatGPT UI changes can require detector
updates.

## VS Code extension

1. The extension runs in the local VS Code UI extension host.
2. One VS Code window acquires a small temporary single-instance lock and
   becomes the completion-monitor owner.
3. The owner watches Codex rollout JSONL files under `~/.codex/sessions`
   (or the configured `CODEX_HOME` equivalent).
4. Existing rollout files are seeded at their current end so normal startup
   does not replay historical completions.
5. `fs.watch` provides low-latency change notification, with periodic rescanning
   as a fallback.
6. Lifecycle events normalize `task_started` / `turn_started` to turn start and
   `task_complete` / `turn_complete` to turn completion.
7. Rollout `session_meta` identifies the thread and whether it is a main session
   or subagent. Inherited subagent history before
   `subagent_history_start_ordinal` is ignored.
8. Events older than monitor startup are suppressed, and thread/turn/event keys
   prevent replay if a rollout file shrinks, is rewritten, or is rescanned.
9. Main completions and optionally enabled subagent completions are routed to
   the configured sound. Settings are application-wide across VS Code windows.
10. A playback queue serializes near-simultaneous sounds so separate Codex
    completions are not lost to audio overlap.
11. Volume is applied by creating a locally scaled PCM16 WAV in VS Code global
    storage.
12. Windows `winmm.dll / PlaySound` performs playback.

The VS Code detector depends on Codex's local rollout JSONL format and lifecycle
metadata. If Codex changes that format, detection may require an update.
