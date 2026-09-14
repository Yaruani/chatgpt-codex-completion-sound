(() => {
  "use strict";

  const DEFAULTS = {
    enabled: true,
    volume: 0.65,
    sound: "chime",
    settleMs: 900,
    minBusyMs: 500
  };

  let settings = { ...DEFAULTS };
  let wasBusy = false;
  let busySince = 0;
  let finishTimer = null;

  const STOP_SELECTORS = [
    'button[data-testid="stop-button"]',
    '[data-testid="stop-button"]',
    'button[aria-label*="Stop" i]',
    'button[aria-label*="停止"]',
    'button[title*="Stop" i]',
    'button[title*="停止"]'
  ];

  const STOP_TEXT_RE =
    /(stop generating|stop streaming|stop response|stop|生成を停止|応答を停止|停止する|停止)/i;

  function isVisible(el) {
    if (!(el instanceof Element)) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function hasStopControl() {
    for (const selector of STOP_SELECTORS) {
      for (const node of document.querySelectorAll(selector)) {
        if (isVisible(node)) return true;
      }
    }

    for (const button of document.querySelectorAll("button")) {
      if (!isVisible(button)) continue;
      const label = [
        button.getAttribute("aria-label") || "",
        button.getAttribute("title") || "",
        button.textContent || ""
      ].join(" ").trim();

      if (label && STOP_TEXT_RE.test(label)) return true;
    }

    return false;
  }

  function clearFinishTimer() {
    if (finishTimer !== null) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }
  }

  function notifyDone() {
    if (!settings.enabled) return;
    chrome.runtime.sendMessage({
      type: "CHATGPT_DONE",
      sound: settings.sound,
      volume: settings.volume
    }).catch(() => {});
  }

  function evaluate() {
    if (!settings.enabled) {
      wasBusy = false;
      busySince = 0;
      clearFinishTimer();
      return;
    }

    const busy = hasStopControl();

    if (busy) {
      clearFinishTimer();
      if (!wasBusy) {
        wasBusy = true;
        busySince = Date.now();
      }
      return;
    }

    if (!wasBusy) return;
    if (Date.now() - busySince < settings.minBusyMs) return;
    if (finishTimer !== null) return;

    finishTimer = setTimeout(() => {
      finishTimer = null;

      if (hasStopControl()) {
        wasBusy = true;
        return;
      }

      wasBusy = false;
      busySince = 0;
      notifyDone();
    }, settings.settleMs);
  }

  chrome.storage.local.get(DEFAULTS).then((stored) => {
    settings = { ...DEFAULTS, ...stored };

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") return;
      for (const [key, change] of Object.entries(changes)) {
        if (key in settings) settings[key] = change.newValue;
      }
      evaluate();
    });

    const observer = new MutationObserver(evaluate);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "aria-label", "title", "data-testid",
        "disabled", "class", "style"
      ]
    });

    setInterval(evaluate, 750);
    document.addEventListener("visibilitychange", evaluate, { passive: true });
    evaluate();
  }).catch(() => {});
})();
