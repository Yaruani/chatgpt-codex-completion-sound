# Publishing to the Chrome Web Store

Official documentation:
https://developer.chrome.com/docs/webstore/

## Package

Build the upload ZIP:

```powershell
./scripts/build-browser.ps1
```

Upload the generated ZIP from `dist/`.

## Store listing

Prepared English/Japanese copy is in:

- `docs/store-listing/chrome-en.md`
- `docs/store-listing/chrome-ja.md`

Permission explanations are in:

- `docs/PERMISSION_JUSTIFICATIONS.md`

Privacy policy:

- `PRIVACY.md`

## Graphic assets

Prepared under `store-assets/chrome/`:

- 128x128 store icon
- 440x280 small promo tile
- 1400x560 marquee promo image
- 1280x800 English screenshot
- 1280x800 Japanese screenshot

Chrome Web Store requires complete and accurate listing/privacy information.
Review every field against the current extension behavior before submission.

## Privacy tab

The extension:

- does not collect user data,
- does not use analytics,
- does not use advertising,
- does not sell data,
- does not transmit ChatGPT content,
- uses `storage`, `offscreen`, and `chatgpt.com` host access only for the
  functionality documented in this repository.

Use the detailed permission justifications when completing the dashboard.

## Localization

The extension includes `_locales/en` and `_locales/ja`, so the store listing
can be localized in English and Japanese.

## Review

Before submission, load the exact ZIP build unpacked in Chrome and Brave,
verify all four sounds, volume, on/off, and completion detection.
