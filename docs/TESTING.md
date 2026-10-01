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

1. Install the generated VSIX.
2. Reload VS Code.
3. Run `Codex Completion Sound: Test Sound`.
4. Test all seven sounds.
5. Test 0%, 5%, 65%, and 100% volume.
6. Change sound and volume in native Extension Settings and confirm automatic
   preview.
7. Run a Codex UI task and confirm exactly one sound on
   `turn/completed`.
8. Run `Codex Completion Sound: Diagnostics` and confirm the backend is
   `node:sqlite` and the database is `~/.codex/logs_2.sqlite` (or the
   configured `CODEX_HOME` equivalent).
