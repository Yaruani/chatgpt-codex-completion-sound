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
2. It opens `~/.codex/logs_2.sqlite` in read-only mode.
3. At startup it seeds the monitor at the current maximum log ID so historical
   completion rows are never replayed.
4. Newly appended `logs` rows are polled locally.
5. Only target `codex_app_server::outgoing_message` records are classified.
6. `app-server event: turn/started` marks an active UI turn and
   `app-server event: turn/completed` triggers the completion notification.
7. A small local lock prevents multiple VS Code windows from monitoring and
   playing the same completion simultaneously.
8. Volume is applied by creating a locally scaled PCM16 WAV in VS Code global
   storage.
9. Windows `winmm.dll / PlaySound` performs playback.

The VS Code detector depends on Codex's local App Server log schema. If Codex
changes the database schema, target name, or lifecycle event names, detection
must be updated.
