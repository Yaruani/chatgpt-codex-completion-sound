"use strict";

let currentAudio = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    !message ||
    message.target !== "offscreen" ||
    message.type !== "PLAY_AUDIO"
  ) {
    return;
  }

  (async () => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      const audio = new Audio(
        chrome.runtime.getURL(`sounds/${message.sound || "chime"}.wav`)
      );
      currentAudio = audio;

      audio.preload = "auto";
      audio.volume =
        typeof message.volume === "number"
          ? Math.max(0, Math.min(1, message.volume))
          : 0.65;

      await audio.play();
      sendResponse({ ok: true });
    } catch (error) {
      console.error("Completion sound playback failed:", error);
      sendResponse({ ok: false, error: String(error) });
    }
  })();

  return true;
});
