# Publishing to the VS Code Marketplace

Official documentation:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## Current identity

- Publisher ID: `yaruani`
- Extension ID: `yaruani.codex-done-sound`
- Repository: `Yaruani/chatgpt-codex-completion-sound`
- Current extension version: `1.2.6`

Treat the Publisher ID as permanent because it is part of the extension
identity.

## Validate

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

VS Code Marketplace requires a PNG icon; SVG extension icons are not accepted.
This repository includes `images/icon.png`.

## Current completion model

Version 1.2.6 watches Codex rollout JSONL files under `~/.codex/sessions`
(or the configured `CODEX_HOME` equivalent).

The extension distinguishes main and subagent sessions from rollout session
metadata. Subagent completion notifications are disabled by default and can be
enabled with a separate selectable sound.

A single VS Code window owns the shared monitor, while application-wide
settings and queued playback keep behavior consistent across multiple VS Code
windows.

## Publish an update

Before publishing:

1. Update `vscode-extension/package.json` and `vscode-extension/CHANGELOG.md`.
2. Run the validation/package commands above.
3. Install and test the generated VSIX on Windows.
4. Confirm the native Extension Settings UI, all seven sounds, preview behavior,
   main completion notification, optional subagent notification, and
   multi-window behavior.
5. Review privacy/security documentation if behavior changed.
6. Confirm the final VSIX contains the intended files and no obsolete monitor
   implementation.

### Manual Marketplace upload

The currently used publishing workflow is manual upload through Marketplace
publisher management:

1. Open the publisher management page.
2. Select publisher `yaruani`.
3. Upload the generated `codex-done-sound-<version>.vsix`.
4. Wait for Marketplace verification to complete.
5. Confirm the new version is Public on the extension management page.

This method does not require a local `vsce` Personal Access Token.

### CLI publishing

CLI publishing is also supported when authenticated according to Microsoft's
current guidance:

```powershell
npx --yes @vscode/vsce@latest publish --packagePath .\codex-done-sound-<version>.vsix
```

## Marketplace metadata in this repository

- Display name / description
- Category and keywords
- Free pricing
- PNG icon
- README
- CHANGELOG
- LICENSE
- Repository / issues / homepage
- English/Japanese command and settings metadata
