# Publishing to the Chrome Web Store

Build the upload ZIP with:

```powershell
./scripts/build-browser.ps1
```

The build output is:

```text
dist/chatgpt-completion-sound-browser-<version>-unpacked.zip
```

Before submission, test the exact ZIP in Chrome/Brave and verify:

- all seven sounds,
- automatic preview,
- volume and on/off,
- test playback,
- normal completion detection,
- navigation to another ChatGPT conversation while the original response is
  still generating,
- two simultaneous conversations followed by navigation to a third conversation
  and backgrounding the browser,
- queued playback for near-simultaneous completions,
- settings preservation when updating through the fixed-folder installer.

After installing or updating the extension, reload any ChatGPT tab that was
already open before testing completion detection.

Use the repository `PRIVACY.md` as the privacy policy and the prepared store
listing under `docs/store-listing/`.
