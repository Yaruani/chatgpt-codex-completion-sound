# Release Checklist

## Repository

- [x] GitHub owner configured: `Yaruani`.
- [x] VS Code Publisher ID configured: `yaruani`.
- [x] Repository is public.
- [x] Private vulnerability reporting is enabled.
- [x] MIT attribution reviewed.

## Versioning / code

- [ ] Browser manifest version matches the intended browser release.
- [ ] VS Code package version matches the intended VS Code release.
- [ ] `npm test` passes.
- [ ] `npm run check` passes.
- [ ] GitHub CI passes on the release commit.
- [ ] Browser extension loads with no service-worker/content-script errors.
- [ ] Browser normal completion fires exactly once.
- [ ] Browser multi-conversation / navigation / background test passes.
- [ ] Browser update preserves enabled/sound/volume settings.
- [ ] VS Code `Test Sound` works.
- [ ] VS Code actual Codex `turn/completed` fires exactly once.
- [ ] All seven sounds work.
- [ ] 0%, 5%, 65%, and 100% volume tested.

## Privacy / security

- [ ] No extension-originated network requests added.
- [ ] No analytics/telemetry added.
- [ ] Browser permissions remain minimal.
- [ ] Browser host permission remains limited to `https://chatgpt.com/*`.
- [ ] `PRIVACY.md` matches actual behavior.
- [ ] Permission justifications match the manifest and implementation.
- [ ] No debug diagnostics or debug version strings remain in production files.
- [ ] No personal paths, credentials, tokens, private IP addresses, or accidental
      terminal/diff output are committed.

## Documentation

- [ ] Root English/Japanese README reviewed.
- [ ] Browser English/Japanese README reviewed.
- [ ] Architecture and testing docs match current implementation.
- [ ] English/Japanese store listings reviewed.
- [ ] Component and root CHANGELOGs updated.

## GitHub release

- [ ] Browser release ZIP created as
      `chatgpt-completion-sound-browser-<version>-unpacked.zip`.
- [ ] `install-chatgpt-completion-sound.ps1` included as a release asset.
- [ ] VSIX created with the intended VS Code version.
- [ ] Exact browser release ZIP tested before tagging.
- [ ] Release tag created and pushed only after the release commit is verified.
- [ ] GitHub Release workflow completes successfully.

## Stores

- [ ] VS Code Marketplace listing matches the current extension.
- [ ] Chrome Web Store listing matches the current browser extension.
- [ ] Store screenshots match the final popup UI.
- [ ] Privacy fields completed accurately.
