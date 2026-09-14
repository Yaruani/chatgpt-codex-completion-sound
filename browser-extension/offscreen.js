"use strict";

const cache = new Map();

function getAudio(sound) {
  if (!cache.has(sound)) {
    const audio = new Audio(chrome.runtime.getURL(`sounds/${sound}.wav`));
    audio.preload = "auto";
    cache.set(sound, audio);
  }
  return cache.get(sound);
}

chrome.runtime.onMessage.addListener((message) => {
  if (
    !message ||
    message.target !== "offscreen" ||
    message.type !== "PLAY_AUDIO"
  ) {
    return;
  }

  const audio = getAudio(message.sound || "chime");
  audio.pause();
  audio.currentTime = 0;
  audio.volume =
    typeof message.volume === "number"
      ? Math.max(0, Math.min(1, message.volume))
      : 0.65;

  audio.play().catch((error) => {
    console.error("Completion sound playback failed:", error);
  });
});
