# Testing

## Browser manual test

1. Load `browser-extension/` unpacked.
2. Reload `chatgpt.com`.
3. Open the popup and test all four sounds.
4. Test volume at 0%, 5%, 65%, and 100%.
5. Submit a short ChatGPT prompt.
6. Confirm exactly one sound after generation completes.
7. Switch to another tab and repeat.
8. Disable notifications and confirm no completion sound.

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
4. Test all four sounds.
5. Test 0%, 5%, 65%, and 100%.
6. Run a short Codex task.
7. Confirm exactly one sound on task completion.
8. Run Diagnostics and confirm the expected Codex session path.
