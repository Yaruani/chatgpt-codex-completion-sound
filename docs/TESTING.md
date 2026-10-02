# Testing

## Browser manual test

1. Install/update the exact release ZIP with
   `scripts/install-chatgpt-completion-sound.ps1`.
2. Reload the existing unpacked extension and reload already-open
   `chatgpt.com` tabs.
3. Confirm enabled state, selected sound, and volume remain unchanged after an
   update.
4. Test all seven bundled sounds.
5. Test volume at 0%, 5%, 65%, and 100%.
6. Submit a normal ChatGPT prompt and confirm exactly one completion sound.
7. Start a response in conversation A, navigate to conversation B, and confirm
   A still notifies when it finishes.
8. Start responses in conversations A and B, navigate to a third conversation,
   then put the browser in the background. Confirm exactly two completion
   sounds, one per tracked conversation.
9. Confirm near-simultaneous completions are queued and neither sound is cut
   off.
10. Disable notifications and confirm no completion sound.
11. Confirm closing or browser-discarding the relevant ChatGPT page is not
    documented as a supported background-tracking case.

## VS Code automated test

```powershell
cd vscode-extension
npm test
npm run check
```

## VS Code manual test

1. Install the generated VSIX and reload all open VS Code windows.
2. Confirm exactly one window acquires the completion monitor and other windows
   remain passive.
3. Wait at least 10 seconds after reload and confirm historical rollout
   completions do not produce sounds.
4. Run `Codex Completion Sound: Test Sound`.
5. Test all seven sounds.
6. Test volume at 0%, 5%, 65%, and 100%.
7. Change sound and volume in native Extension Settings and confirm automatic
   preview occurs only once even with multiple VS Code windows open.
8. With subagent notifications disabled, run a normal Codex task and confirm
   exactly one main completion sound.
9. Confirm the Output log reports `role=main`, the correct thread/turn IDs, and
   low `lagMs` for the rollout completion.
10. Enable subagent notifications with a distinct subagent sound. Run a task
    that creates three subagents and waits for all three before finishing.
    Confirm three subagent sounds followed by one main sound.
11. Disable subagent notifications again.
12. Run separate Codex tasks in two VS Code windows at roughly the same time.
    Confirm each main thread produces exactly one completion sound.
13. Confirm near-simultaneous notifications are serialized rather than played
    over each other.
14. Run `Codex Completion Sound: Diagnostics` and confirm the backend is
    `rollout-jsonl` and `sessionsRoot` points to `~/.codex/sessions` (or the
    configured `CODEX_HOME` equivalent).
