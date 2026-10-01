# Publishing to the VS Code Marketplace

Official documentation:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## Current identity

- Publisher ID: `yaruani`
- Extension ID: `yaruani.codex-done-sound`
- Repository: `Yaruani/chatgpt-codex-completion-sound`

Treat the Publisher ID as permanent because it is part of the extension
identity.

## Validate

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

The extension package currently declares version `1.2.5`.

VS Code Marketplace requires a PNG icon; SVG extension icons are not accepted.
This repository includes `images/icon.png`.

## Publish an update

Before publishing:

1. Update `vscode-extension/package.json` and `vscode-extension/CHANGELOG.md`.
2. Run the validation/package commands above.
3. Test the generated VSIX on a clean Windows VS Code profile.
4. Confirm the native Extension Settings UI, all seven sounds, preview behavior,
   and an actual Codex `turn/completed` notification.
5. Review privacy/security documentation if behavior changed.

Follow the current Microsoft authentication guidance in the official
publishing documentation.

Typical command after authentication:

```powershell
npx --yes @vscode/vsce@latest publish
```

You can also upload the generated VSIX manually through Marketplace publisher
management.

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
