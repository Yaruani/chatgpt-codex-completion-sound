"use strict";

const enabled = document.getElementById("enabled");
const sound = document.getElementById("sound");
const volume = document.getElementById("volume");
const volumeValue = document.getElementById("volumeValue");
const test = document.getElementById("test");
const status = document.getElementById("status");

function t(key) {
  return chrome.i18n.getMessage(key) || key;
}

function localize() {
  document.documentElement.lang =
    chrome.i18n.getUILanguage().toLowerCase().startsWith("ja") ? "ja" : "en";

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
}

function showStatus(text) {
  status.textContent = text;
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => {
    status.textContent = "";
  }, 1600);
}

async function previewSelectedSound() {
  const result = await chrome.runtime.sendMessage({
    type: "TEST_SOUND",
    sound: sound.value,
    volume: Number(volume.value) / 100
  });

  showStatus(result?.ok ? t("played") : t("playFailed"));
}

async function load() {
  localize();

  const settings = await chrome.storage.local.get({
    enabled: true,
    volume: 0.65,
    sound: "chime"
  });

  enabled.checked = settings.enabled;
  sound.value = settings.sound;
  volume.value = String(Math.round(settings.volume * 100));
  volumeValue.textContent = `${volume.value}%`;
}

enabled.addEventListener("change", async () => {
  await chrome.storage.local.set({ enabled: enabled.checked });
  showStatus(enabled.checked ? t("statusOn") : t("statusOff"));
});

sound.addEventListener("change", async () => {
  await chrome.storage.local.set({ sound: sound.value });
  await previewSelectedSound();
});

volume.addEventListener("input", () => {
  volumeValue.textContent = `${volume.value}%`;
});

volume.addEventListener("change", async () => {
  await chrome.storage.local.set({
    volume: Number(volume.value) / 100
  });
  await previewSelectedSound();
});

test.addEventListener("click", previewSelectedSound);

load();
