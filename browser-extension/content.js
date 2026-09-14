(() => {
  "use strict";

  const DEFAULTS = {
    enabled: true,
    volume: 0.65,
    sound: "chime"
  };

  const ARM_TIMEOUT_MS = 10000;
  const MIN_BUSY_MS = 100;

  let settings = { ...DEFAULTS };

  let state = "idle"; // idle | armed | busy
  let armedUntil = 0;
  let busySince = 0;
  let trackedPath = location.pathname;
  let lastPath = location.pathname;
  let completionSent = false;

  // Current ChatGPT exposes the real generation control with this canonical id.
  // Deliberately avoid fuzzy aria/text matching because it produced false
  // positives after SPA navigation.
  const STOP_SELECTOR = '[data-testid="stop-button"]';

  const SEND_SELECTORS = [
    'button[data-testid="send-button"]',
    '[data-testid="send-button"]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="送信"]',
    'button[title*="Send" i]',
    'button[title*="送信"]'
  ];

  const PROMPT_SELECTORS = [
    '#prompt-textarea',
    'textarea',
    '[contenteditable="true"]'
  ];

  function routeKind(path = location.pathname) {
    if (/^\/c\//.test(path)) return "conversation";
    if (path === "/" || path === "") return "root";
    return "other";
  }

  function isVisible(el) {
    if (!(el instanceof Element)) return false;

    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;

    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function looksLikeStopControl(el) {
    return el instanceof Element && el.matches(STOP_SELECTOR);
  }

  function nodeContainsStopControl(node) {
    if (!(node instanceof Element)) return false;
    return looksLikeStopControl(node) || Boolean(node.querySelector(STOP_SELECTOR));
  }

  function hasStopControl() {
    for (const node of document.querySelectorAll(STOP_SELECTOR)) {
      if (isVisible(node)) return true;
    }
    return false;
  }

  function resetTracking() {
    state = "idle";
    armedUntil = 0;
    busySince = 0;
    trackedPath = location.pathname;
    completionSent = false;
  }

  function armFromUserAction() {
    if (!settings.enabled) return;

    state = "armed";
    armedUntil = Date.now() + ARM_TIMEOUT_MS;
    busySince = 0;
    trackedPath = location.pathname;
    completionSent = false;

    evaluate();
  }

  function isPromptElement(target) {
    if (!(target instanceof Element)) return false;
    return PROMPT_SELECTORS.some((selector) => Boolean(target.closest(selector)));
  }

  function handleRouteChange() {
    const currentPath = location.pathname;
    if (currentPath === lastPath) return;

    const previousPath = lastPath;
    lastPath = currentPath;

    if (state === "idle") {
      trackedPath = currentPath;
      return;
    }

    // A newly-created conversation commonly changes from "/" to "/c/..."
    // after the user's prompt is accepted. Preserve that one transition.
    const newConversationAssignment =
      routeKind(previousPath) === "root" &&
      routeKind(currentPath) === "conversation" &&
      (state === "armed" || state === "busy");

    if (newConversationAssignment) {
      trackedPath = currentPath;
      return;
    }

    // Moving to another existing conversation replaces the tracked DOM.
    // Cancel the old response state instead of leaking it into the new chat.
    resetTracking();
    trackedPath = currentPath;
  }

  function startBusy() {
    if (state !== "armed") return;

    state = "busy";
    busySince = Date.now();
    trackedPath = location.pathname;
  }

  function sendCompletion() {
    if (completionSent || state !== "busy") return;

    const busyDuration = Date.now() - busySince;
    if (busyDuration < MIN_BUSY_MS) {
      resetTracking();
      return;
    }

    completionSent = true;

    chrome.runtime.sendMessage({
      type: "CHATGPT_DONE",
      sound: settings.sound,
      volume: settings.volume
    }).finally(() => {
      resetTracking();
    });
  }

  function evaluate() {
    handleRouteChange();

    if (!settings.enabled) {
      resetTracking();
      return;
    }

    const stopVisible = hasStopControl();

    if (state === "armed") {
      if (Date.now() > armedUntil) {
        resetTracking();
        return;
      }

      if (stopVisible) {
        startBusy();
      }
      return;
    }

    if (state === "busy" && !stopVisible) {
      sendCompletion();
    }
  }

  function handleMutations(records) {
    handleRouteChange();

    if (!settings.enabled) {
      resetTracking();
      return;
    }

    let sawStopAdded = false;
    let sawStopRemoved = false;

    for (const record of records) {
      if (record.type !== "childList") continue;

      for (const node of record.addedNodes) {
        if (nodeContainsStopControl(node)) {
          sawStopAdded = true;
          break;
        }
      }

      for (const node of record.removedNodes) {
        if (nodeContainsStopControl(node)) {
          sawStopRemoved = true;
          break;
        }
      }
    }

    if (sawStopAdded && state === "armed") {
      startBusy();
    }

    // A stop-button mutation by itself is never enough to start tracking.
    // ChatGPT's SPA can create transient controls while navigating chats.
    if (sawStopRemoved && state === "busy" && !hasStopControl()) {
      sendCompletion();
      return;
    }

    if (state === "busy" && !hasStopControl()) {
      sendCompletion();
      return;
    }

    if (state === "armed") {
      evaluate();
    }
  }

  document.addEventListener("submit", () => {
    armFromUserAction();
  }, true);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest("button");
    if (!button) return;

    if (SEND_SELECTORS.some((selector) => button.matches(selector))) {
      armFromUserAction();
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.isComposing ||
      event.defaultPrevented
    ) {
      return;
    }

    if (!isPromptElement(event.target)) return;

    armFromUserAction();
  }, true);

  chrome.storage.local.get(DEFAULTS).then((stored) => {
    settings = { ...DEFAULTS, ...stored };

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") return;

      for (const [key, change] of Object.entries(changes)) {
        if (key in settings) settings[key] = change.newValue;
      }

      evaluate();
    });

    const observer = new MutationObserver(handleMutations);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "aria-label", "title", "data-testid",
        "disabled", "class", "style"
      ]
    });

    // Fallback only. Normal completion is mutation-driven.
    setInterval(evaluate, 1000);

    document.addEventListener(
      "visibilitychange",
      evaluate,
      { passive: true }
    );

    evaluate();
  }).catch(() => {});
})();
