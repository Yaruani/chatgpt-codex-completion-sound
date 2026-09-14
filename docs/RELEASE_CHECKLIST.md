# Release Checklist

## Repository

- [ ] Replace `YOUR_GITHUB_OWNER`.
- [ ] Replace VS Code `your-publisher-id`.
- [ ] Confirm repository is public.
- [ ] Enable private vulnerability reporting or another private security contact.
- [ ] Review MIT copyright attribution.

## Code

- [ ] Browser manifest version is `1.2.0`.
- [ ] VS Code package version is `1.2.0`.
- [ ] `npm test` passes.
- [ ] `npm run check` passes.
- [ ] Browser extension loads with no service-worker/content-script errors.
- [ ] Browser completion sound fires exactly once.
- [ ] VS Code `Test Sound` works.
- [ ] VS Code actual Codex completion fires exactly once.
- [ ] All four sounds work.
- [ ] 0%, 5%, 65%, and 100% volume tested.

## Privacy/security

- [ ] No network requests added.
- [ ] No analytics/telemetry added.
- [ ] No new browser permissions.
- [ ] `PRIVACY.md` matches actual behavior.
- [ ] Permission justifications match the manifest.

## Documentation

- [ ] English README reviewed.
- [ ] Japanese README reviewed.
- [ ] English/Japanese store listing reviewed.
- [ ] CHANGELOG updated.

## Store

- [ ] VS Code Publisher ID confirmed.
- [ ] VS Code Marketplace package created with latest `vsce`.
- [ ] Chrome Web Store ZIP created.
- [ ] Store icon uploaded.
- [ ] Chrome screenshot uploaded.
- [ ] Chrome small promo tile uploaded.
- [ ] Privacy fields completed accurately.
