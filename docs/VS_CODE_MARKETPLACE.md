# Publishing to the VS Code Marketplace

Official documentation:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## One-time setup

1. Create a permanent Marketplace Publisher.
2. Record its **Publisher ID**.
3. Configure this repository:

```powershell
./scripts/configure-release.ps1 `
  -PublisherId "your-real-publisher-id" `
  -GitHubOwner "your-github-owner" `
  -RepositoryName "chatgpt-codex-completion-sound"
```

4. Review `vscode-extension/package.json`.
5. Ensure the public GitHub repository exists.

The Publisher ID is part of the extension identity and should be treated as
permanent.

## Validate

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

VS Code Marketplace requires a PNG icon; SVG extension icons are not accepted.
This repository includes `images/icon.png`.

## Publish

Follow the current Microsoft authentication guidance in the official
publishing documentation. Microsoft states that global Azure DevOps PATs are
retired on December 1, 2026, so do not build a long-term release process around
global PAT authentication.

Typical command after authentication:

```powershell
npx --yes @vscode/vsce@latest publish
```

You can also package a VSIX and upload it manually through Marketplace
publisher management.

## Marketplace fields already prepared

- Display name / description
- Category and keywords
- Free pricing
- PNG icon
- README
- CHANGELOG
- LICENSE
- Repository / issues / homepage placeholders
- English/Japanese command metadata

## Before first publish

- Replace all placeholders.
- Confirm the Marketplace name is available.
- Enable a private security reporting path on GitHub.
- Review the privacy policy.
- Test on a clean Windows VS Code profile.
