# Publishing to the Chrome Web Store

Build the upload ZIP with:

```powershell
./scripts/build-browser.ps1
```

Before submission, test the exact ZIP in Chrome/Brave and verify:

- all seven sounds,
- automatic preview,
- volume and on/off,
- test playback,
- normal completion detection,
- navigation away from and back to an existing conversation.

After installing or updating the extension, reload any ChatGPT tab that was
already open before testing completion detection.

Use the repository `PRIVACY.md` as the privacy policy and the prepared store
listing under `docs/store-listing/`.
