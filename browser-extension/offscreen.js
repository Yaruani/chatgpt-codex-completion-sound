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
    const sound = message.sound || "chime";
    const volume =
      typeof message.volume === "number"
        ? Math.max(0, Math.min(1, message.volume))
        : 0.65;

    try {
      if (currentAudio && !currentAudio.ended) {
        currentAudio.pause();
      }

      const audio = new Audio(
        chrome.runtime.getURL(`sounds/${sound}.wav`)
      );
      currentAudio = audio;

      audio.preload = "auto";
      audio.volume = volume;

      const endedPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timed out waiting for audio playback to finish"));
        }, 10000);

        audio.addEventListener("ended", () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });

        audio.addEventListener("error", () => {
          clearTimeout(timeout);
          reject(new Error("Audio playback failed"));
        }, { once: true });
      });

      await audio.play();
      await endedPromise;

      sendResponse({
        ok: true,
        ended: true,
        duration: Number.isFinite(audio.duration) ? audio.duration : null
      });
    } catch (error) {
      console.error("Completion sound playback failed:", error);
      sendResponse({ ok: false, error: String(error) });
    }
  })();

  return true;
});
