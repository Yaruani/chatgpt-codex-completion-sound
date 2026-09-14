"use strict";

const VALID_SOUNDS = new Set(["chime", "bell", "double", "soft"]);
let creatingOffscreen = null;

async function ensureOffscreenDocument() {
  const url = chrome.runtime.getURL("offscreen.html");
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [url]
  });

  if (contexts.length > 0) return;
  if (creatingOffscreen) return creatingOffscreen;

  creatingOffscreen = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play the bundled completion notification sound."
  });

  try {
    await creatingOffscreen;
  } finally {
    creatingOffscreen = null;
  }
}

async function playSound(sound, volume) {
  await ensureOffscreenDocument();
  const safeSound = VALID_SOUNDS.has(sound) ? sound : "chime";

  await chrome.runtime.sendMessage({
    type: "PLAY_AUDIO",
    target: "offscreen",
    sound: safeSound,
    volume
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    enabled: true,
    volume: 0.65,
    sound: "chime",
    settleMs: 900,
    minBusyMs: 500
  };

  const current = await chrome.storage.local.get(Object.keys(defaults));
  const missing = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (current[key] === undefined) missing[key] = value;
  }

  if (Object.keys(missing).length > 0) {
    await chrome.storage.local.set(missing);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") return;
  if (message.type !== "CHATGPT_DONE" && message.type !== "TEST_SOUND") return;

  (async () => {
    try {
      const stored = await chrome.storage.local.get({
        enabled: true,
        volume: 0.65,
        sound: "chime"
      });

      if (message.type === "CHATGPT_DONE" && !stored.enabled) {
        sendResponse({ ok: true, skipped: true });
        return;
      }

      const requestedVolume =
        typeof message.volume === "number" ? message.volume : stored.volume;
      const volume = Math.max(0, Math.min(1, requestedVolume));

      const requestedSound =
        VALID_SOUNDS.has(message.sound) ? message.sound : stored.sound;

      await playSound(requestedSound, volume);
      sendResponse({ ok: true });
    } catch (error) {
      console.error("ChatGPT Completion Sound:", error);
      sendResponse({ ok: false, error: String(error) });
    }
  })();

  return true;
});
