(() => {
  "use strict";

  const VERSION = "1.3.2";

  const DEFAULTS = {
    enabled: true,
    volume: 0.65,
    sound: "chime"
  };

  const MIN_BUSY_MS = 500;
  const SIDEBAR_SETTLE_MS = 900;

  let settings = { ...DEFAULTS };
  let lastPath = location.pathname;

  // One tracker per conversation path.
  // path -> {
  //   path, startedAt, source, pageStopSeen,
  //   sidebarSpinnerSeen, sidebarAbsentSince,
  //   blueDotWasPresent, completionSent
  // }
  const trackers = new Map();

  const STOP_SELECTOR = [
    '[data-testid="stop-button"]',
    'button[aria-label="停止"]',
    'button[aria-label="Stop"]'
  ].join(",");

  const SIDEBAR_SPINNER_SELECTOR = [
    '[role="status"][aria-label="処理中"]',
    '[role="status"][aria-label="Processing"]'
  ].join(",");

  const SIDEBAR_BLUE_DOT_SELECTOR = ".bg-info-solid";

  function log() {}

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

  function hasStopControl() {
    for (const node of document.querySelectorAll(STOP_SELECTOR)) {
      if (isVisible(node)) return true;
    }
    return false;
  }

  function findThreadLink(path) {
    for (const link of document.querySelectorAll('a[href^="/c/"]')) {
      if (link.getAttribute("href") === path) return link;
    }
    return null;
  }

  function findIndicatorForPath(path, selector) {
    const link = findThreadLink(path);
    if (!link) return null;

    // Structural association: walk outward while this container owns exactly
    // one conversation link. This works even when the sidebar itself is hidden.
    let node = link;

    for (let depth = 0; node && depth < 14; depth += 1) {
      if (node instanceof Element) {
        const descendantLinks = node.querySelectorAll?.('a[href^="/c/"]').length ?? 0;
        const selfIsLink = node.matches?.('a[href^="/c/"]') ? 1 : 0;
        const linkCount = descendantLinks + selfIsLink;

        if (linkCount === 1) {
          const candidate = node.matches?.(selector)
            ? node
            : node.querySelector?.(selector);

          if (candidate) return candidate;
        }

        if (linkCount > 1) break;
      }

      node = node.parentElement;
    }

    // Geometry fallback for the expanded sidebar.
    const linkRect = link.getBoundingClientRect();
    if (!linkRect.width || !linkRect.height) return null;

    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const candidate of document.querySelectorAll(selector)) {
      const rect = candidate.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;

      const sameRow =
        rect.bottom > linkRect.top &&
        rect.top < linkRect.bottom;

      if (!sameRow) continue;

      const vertical =
        Math.abs((rect.top + rect.bottom) / 2 -
                 (linkRect.top + linkRect.bottom) / 2);
      const horizontal = Math.abs(rect.left - linkRect.right);

      const score = vertical * 10 + horizontal;

      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }

  function findSidebarSpinner(path) {
    return findIndicatorForPath(path, SIDEBAR_SPINNER_SELECTOR);
  }

  function findSidebarBlueDot(path) {
    return findIndicatorForPath(path, SIDEBAR_BLUE_DOT_SELECTOR);
  }

  function pathForSidebarIndicator(indicator) {
    if (!(indicator instanceof Element)) return null;

    let node = indicator;

    for (let depth = 0; node && depth < 14; depth += 1) {
      if (node instanceof Element) {
        const links = [
          ...(node.matches?.('a[href^="/c/"]') ? [node] : []),
          ...node.querySelectorAll?.('a[href^="/c/"]') ?? []
        ];

        if (links.length === 1) {
          return links[0].getAttribute("href");
        }

        if (links.length > 1) return null;
      }

      node = node.parentElement;
    }

    return null;
  }

  function makeTracker(path, source, options = {}) {
    const now = Date.now();

    const tracker = {
      path,
      startedAt: now,
      source,
      pageStopSeen: Boolean(options.pageStopSeen),
      sidebarSpinnerSeen: Boolean(options.sidebarSpinnerSeen),
      sidebarAbsentSince: 0,
      blueDotWasPresent: Boolean(findSidebarBlueDot(path)),
      completionSent: false
    };

    trackers.set(path, tracker);

    log(
      "tracker-start",
      `tracked=${path} source=${source} ` +
      `pageStopSeen=${tracker.pageStopSeen} ` +
      `sidebarSpinnerSeen=${tracker.sidebarSpinnerSeen}`
    );

    return tracker;
  }

  function ensureTracker(path, source, options = {}) {
    if (!path) return null;

    let tracker = trackers.get(path);

    if (!tracker) {
      tracker = makeTracker(path, source, options);
    } else {
      if (options.pageStopSeen) tracker.pageStopSeen = true;
      if (options.sidebarSpinnerSeen) tracker.sidebarSpinnerSeen = true;
    }

    return tracker;
  }

  function removeTracker(path, reason) {
    if (!trackers.has(path)) return;

    trackers.delete(path);
    log("tracker-remove", `tracked=${path} reason=${reason}`);
  }

  function migrateTracker(oldPath, newPath) {
    const tracker = trackers.get(oldPath);
    if (!tracker || oldPath === newPath) return tracker;

    trackers.delete(oldPath);

    tracker.path = newPath;
    tracker.blueDotWasPresent = Boolean(findSidebarBlueDot(newPath));
    tracker.sidebarAbsentSince = 0;

    trackers.set(newPath, tracker);

    log("tracker-migrate", `${oldPath} -> ${newPath}`);
    return tracker;
  }

  function handleRouteChange() {
    const currentPath = location.pathname;
    if (currentPath === lastPath) return false;

    const previousPath = lastPath;
    lastPath = currentPath;

    // A new conversation can begin at "/" and be assigned /c/<id> after the
    // response starts. Migrate that tracker rather than creating a second one.
    if (
      trackers.has(previousPath) &&
      routeKind(previousPath) === "root" &&
      routeKind(currentPath) === "conversation"
    ) {
      migrateTracker(previousPath, currentPath);
    }

    // Stop state from the previous page must not be reused after an SPA route
    // transition. Sidebar state will keep that conversation alive.
    const previousTracker = trackers.get(previousPath);
    if (previousTracker) {
      previousTracker.pageStopSeen = false;
    }

    const currentTracker = trackers.get(currentPath);
    if (currentTracker) {
      currentTracker.pageStopSeen = false;
    }

    log(
      "route-change-preserve",
      `${previousPath} -> ${currentPath}`
    );

    return true;
  }

  async function sendCompletion(tracker, source) {
    if (!tracker || tracker.completionSent) return;

    const busyDuration = Date.now() - tracker.startedAt;

    if (busyDuration < MIN_BUSY_MS) {
      log(
        "tracker-too-short",
        `tracked=${tracker.path} duration=${busyDuration}ms`
      );
      removeTracker(tracker.path, "too-short");
      return;
    }

    tracker.completionSent = true;

    log(
      "tracker-done-send",
      `tracked=${tracker.path} source=${source} duration=${busyDuration}ms`
    );

    try {
      const result = await chrome.runtime.sendMessage({
        type: "CHATGPT_DONE",
        conversationPath: tracker.path,
        sound: settings.sound,
        volume: settings.volume
      });

      log(
        "tracker-done-ack",
        `tracked=${tracker.path} ` +
        (result?.ok ? "ok" : JSON.stringify(result))
      );
    } catch (error) {
      log(
        "tracker-done-error",
        `tracked=${tracker.path} ${String(error)}`
      );
    } finally {
      removeTracker(tracker.path, "completion-sent");
    }
  }

  function evaluateTrackerSidebar(tracker, source) {
    if (!tracker || tracker.completionSent) return;

    const spinner = findSidebarSpinner(tracker.path);

    if (spinner) {
      if (!tracker.sidebarSpinnerSeen) {
        tracker.sidebarSpinnerSeen = true;
        log(
          "sidebar-spinner-seen",
          `tracked=${tracker.path} source=${source}`
        );
      }

      tracker.sidebarAbsentSince = 0;
      return;
    }

    const blueDot = findSidebarBlueDot(tracker.path);

    if (!tracker.blueDotWasPresent && blueDot) {
      log(
        "sidebar-blue-dot-seen",
        `tracked=${tracker.path} source=${source}`
      );
      void sendCompletion(tracker, "sidebar-blue-dot");
      return;
    }

    // Absence alone is never completion. We must have observed this specific
    // tracked conversation's processing spinner first.
    if (!tracker.sidebarSpinnerSeen) return;

    if (!tracker.sidebarAbsentSince) {
      tracker.sidebarAbsentSince = Date.now();
      log(
        "sidebar-spinner-gone",
        `tracked=${tracker.path} source=${source}`
      );
      return;
    }

    const absentFor = Date.now() - tracker.sidebarAbsentSince;

    if (absentFor >= SIDEBAR_SETTLE_MS) {
      log(
        "sidebar-spinner-ended",
        `tracked=${tracker.path} source=${source} absentFor=${absentFor}ms`
      );
      void sendCompletion(tracker, "sidebar-spinner-ended");
    }
  }

  function discoverSidebarTrackers(source) {
    for (const spinner of document.querySelectorAll(SIDEBAR_SPINNER_SELECTOR)) {
      const path = pathForSidebarIndicator(spinner);

      if (
        path &&
        routeKind(path) === "conversation" &&
        !trackers.has(path)
      ) {
        ensureTracker(path, `sidebar-discovery:${source}`, {
          sidebarSpinnerSeen: true,
          pageStopSeen: path === location.pathname && hasStopControl()
        });
      }
    }
  }

  function evaluate(source = "evaluate") {
    handleRouteChange();

    if (!settings.enabled) {
      if (trackers.size > 0) {
        trackers.clear();
        log("trackers-cleared", "disabled");
      }
      return;
    }

    const currentPath = location.pathname;
    const stopVisible = hasStopControl();

    // Current page: exact stop control is authoritative for generation start.
    if (stopVisible) {
      const currentTracker = ensureTracker(currentPath, `stop:${source}`, {
        pageStopSeen: true
      });

      if (currentTracker) {
        currentTracker.pageStopSeen = true;
        currentTracker.sidebarAbsentSince = 0;
      }
    } else {
      const currentTracker = trackers.get(currentPath);

      // Only use stop disappearance as completion if this tracker actually saw
      // the current page's stop control after the most recent route entry.
      if (currentTracker?.pageStopSeen) {
        void sendCompletion(currentTracker, "current-stop-ended");
      }
    }

    // Pick up multiple simultaneously generating conversations from the
    // sidebar, including conversations started in another browser tab.
    discoverSidebarTrackers(source);

    // Every tracked conversation gets its own sidebar state machine.
    for (const tracker of [...trackers.values()]) {
      if (tracker.completionSent) continue;

      // If current-page stop control is actively visible for this tracker,
      // don't let a transient sidebar rerender complete it.
      if (
        tracker.path === currentPath &&
        tracker.pageStopSeen &&
        stopVisible
      ) {
        continue;
      }

      evaluateTrackerSidebar(tracker, source);
    }
  }

  let evaluationScheduled = false;

  function scheduleEvaluate(source) {
    if (evaluationScheduled) return;

    evaluationScheduled = true;

    setTimeout(() => {
      evaluationScheduled = false;
      evaluate(source);
    }, 60);
  }

  chrome.storage.local.get(DEFAULTS).then((stored) => {
    settings = { ...DEFAULTS, ...stored };

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") return;

      for (const [key, change] of Object.entries(changes)) {
        if (key in settings) settings[key] = change.newValue;
      }

      scheduleEvaluate("settings-change");
    });

    const observer = new MutationObserver(() => {
      scheduleEvaluate("mutation");
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "aria-label", "role", "title", "data-testid",
        "disabled", "class", "style"
      ]
    });

    // Fallback and settle confirmation. Chromium may throttle this in a
    // background tab, but MutationObserver remains the primary signal.
    setInterval(() => evaluate("interval"), 500);

    document.addEventListener(
      "visibilitychange",
      () => evaluate("visibilitychange"),
      { passive: true }
    );

    log("content-loaded");
    evaluate("initial");
  }).catch((error) => {
    console.error(`[CCS ${VERSION}] init-error`, error);
  });
})();
