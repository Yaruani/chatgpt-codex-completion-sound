"use strict";

const VALID_SOUNDS = new Set([
  "chime", "bell", "double", "soft",
  "microwave", "handbell", "game"
]);

const DUPLICATE_WINDOW_MS = 15000;

let creatingOffscreen = null;
let playbackQueue = Promise.resolve();

const recentCompletions = new Map();

async function ensureOffscreenDocument() {
  const url = chrome.runtime.getURL("offscreen.html");

  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [url]
  });

  if (contexts.length > 0) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }

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

async function playSoundNow(sound, volume, requestId) {
  await ensureOffscreenDocument();

  const safeSound = VALID_SOUNDS.has(sound) ? sound : "chime";

  const result = await chrome.runtime.sendMessage({
    type: "PLAY_AUDIO",
    target: "offscreen",
    requestId,
    sound: safeSound,
    volume
  });

  if (!result?.ok) {
    throw new Error(result?.error || "Audio playback failed");
  }

  return result;
}

function enqueueSound(sound, volume, requestId) {
  const run = playbackQueue.then(() =>
    playSoundNow(sound, volume, requestId)
  );

  // Keep the queue usable even if one playback fails.
  playbackQueue = run.catch(() => {});
  return run;
}

function isDuplicateCompletion(path) {
  if (!path) return false;

  const now = Date.now();
  const previous = recentCompletions.get(path);

  for (const [key, ts] of recentCompletions) {
    if (now - ts > DUPLICATE_WINDOW_MS) {
      recentCompletions.delete(key);
    }
  }

  if (previous && now - previous <= DUPLICATE_WINDOW_MS) {
    return true;
  }

  recentCompletions.set(path, now);
  return false;
}

chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    enabled: true,
    volume: 0.65,
    sound: "chime"
  };

  const current = await chrome.storage.local.get(Object.keys(defaults));
  const missing = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (current[key] === undefined) missing[key] = value;
  }

  if (Object.keys(missing).length > 0) {
    await chrome.storage.local.set(missing);
  }

  // Remove diagnostic data left by local debug builds, if present.
  await chrome.storage.local.remove("ccsDebugLog");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") return;
  if (message.type !== "CHATGPT_DONE" && message.type !== "TEST_SOUND") return;

  (async () => {
    const requestId =
      `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    try {
      const path =
        typeof message.conversationPath === "string"
          ? message.conversationPath
          : "";

      if (
        message.type === "CHATGPT_DONE" &&
        isDuplicateCompletion(path)
      ) {
        sendResponse({
          ok: true,
          skipped: true,
          duplicate: true
        });
        return;
      }

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
        typeof message.volume === "number"
          ? message.volume
          : stored.volume;

      const volume = Math.max(0, Math.min(1, requestedVolume));

      const requestedSound =
        VALID_SOUNDS.has(message.sound)
          ? message.sound
          : stored.sound;

      const result = await enqueueSound(
        requestedSound,
        volume,
        requestId
      );

      sendResponse({ ok: true, playback: result });
    } catch (error) {
      console.error("ChatGPT Completion Sound:", error);
      sendResponse({
        ok: false,
        error: String(error)
      });
    }
  })();

  return true;
});
