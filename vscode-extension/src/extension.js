"use strict";

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");

const {
  VALID_SOUNDS,
  clampVolume,
  sourceSoundPath,
  playSound
} = require("./audio");

const {
  CodexRolloutMonitor
} = require("./codex-rollout-monitor");

const {
  PlaybackQueue
} = require("./playback-queue");

const SOUND_LABELS = {
  en: {
    chime: "Chime",
    bell: "Bell",
    double: "Double",
    soft: "Soft",
    microwave: "Microwave Ding",
    handbell: "Bright Bell",
    game: "Game Clear"
  },
  ja: {
    chime: "チャイム",
    bell: "ベル",
    double: "ダブル",
    soft: "ソフト",
    microwave: "電子レンジ風チン",
    handbell: "ブライトベル",
    game: "ゲームクリア風"
  }
};

const MESSAGES = {
  en: {
    current: "Current",
    chooseSound: "Choose the notification sound for completed Codex turns",
    chooseVolume: "Choose notification volume (does not change Windows master volume)",
    changedSound: (label, volume) => `Codex Completion Sound: ${label} / ${volume}%`,
    changedVolume: (volume) => `Codex Completion Sound: volume ${volume}%`,
    enabled: (value) => `Codex Completion Sound: ${value ? "ON" : "OFF"}`,
    muted: "Codex Completion Sound: volume is 0% (muted).",
    testOk: (label, volume) => `Codex Completion Sound: played ${label} / ${volume}%.`,
    testFailed: "Codex Completion Sound: playback failed. Check Output → Codex Completion Sound.",
    backendFailed: "Codex Completion Sound: the Codex session monitor could not start. Check Output → Codex Completion Sound.",
    diagnosticCopied: "Codex Completion Sound: diagnostics copied to clipboard."
  },
  ja: {
    current: "現在の設定",
    chooseSound: "Codexのターン完了時の通知音を選択",
    chooseVolume: "通知音量を選択（Windows全体の音量は変更しません）",
    changedSound: (label, volume) => `Codex Completion Sound: ${label} / ${volume}%`,
    changedVolume: (volume) => `Codex Completion Sound: 音量 ${volume}%`,
    enabled: (value) => `Codex Completion Sound: ${value ? "ON" : "OFF"}`,
    muted: "Codex Completion Sound: 音量は0%（ミュート）です。",
    testOk: (label, volume) => `Codex Completion Sound: ${label} / ${volume}% を再生しました。`,
    testFailed: "Codex Completion Sound: 音声再生に失敗しました。Output → Codex Completion Sound を確認してください。",
    backendFailed: "Codex Completion Sound: Codexセッション監視を開始できませんでした。Output → Codex Completion Sound を確認してください。",
    diagnosticCopied: "Codex Completion Sound: 診断情報をクリップボードへコピーしました。"
  }
};

let output = null;
let monitor = null;
let playbackQueue = null;

let enabled = true;
let selectedSound = "bell";
let volumePercent = 65;

let subagentEnabled = false;
let selectedSubagentSound = "soft";

const debounceMs = 500;
const lastNotifyAtByKey = new Map();

function locale() {
  return vscode.env.language.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function msg() {
  return MESSAGES[locale()];
}

function soundLabel(sound) {
  return SOUND_LABELS[locale()][sound] || sound;
}

function log(message) {
  if (output) {
    output.appendLine(`[${new Date().toISOString()}] ${message}`);
  }
}

function getCodexHome() {
  const envHome = process.env.CODEX_HOME;
  if (envHome && envHome.trim()) return envHome.trim();
  return path.join(os.homedir(), ".codex");
}

function getSessionsRoot() {
  return path.join(getCodexHome(), "sessions");
}

const CONFIG_SECTION = "codexCompletionSound";

function config() {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

function hasExplicitSetting(inspect) {
  if (!inspect) return false;

  return (
    inspect.globalValue !== undefined ||
    inspect.workspaceValue !== undefined ||
    inspect.workspaceFolderValue !== undefined ||
    inspect.globalLanguageValue !== undefined ||
    inspect.workspaceLanguageValue !== undefined ||
    inspect.workspaceFolderLanguageValue !== undefined
  );
}

async function migrateLegacySettings(context) {
  const cfg = config();

  for (const key of ["enabled", "sound", "volumePercent"]) {
    if (hasExplicitSetting(cfg.inspect(key))) continue;

    const legacyValue = context.globalState.get(key);
    if (legacyValue === undefined) continue;

    await cfg.update(
      key,
      legacyValue,
      vscode.ConfigurationTarget.Global
    );

    log(`migrated legacy setting ${key} -> ${CONFIG_SECTION}.${key}`);
  }
}

function loadState() {
  const cfg = config();

  enabled = cfg.get("enabled", true);

  const savedSound = cfg.get("sound", "bell");
  selectedSound = VALID_SOUNDS.includes(savedSound) ? savedSound : "bell";

  volumePercent = clampVolume(
    cfg.get("volumePercent", 65)
  );

  subagentEnabled = cfg.get("subagentEnabled", false);

  const savedSubagentSound = cfg.get("subagentSound", "soft");
  selectedSubagentSound = VALID_SOUNDS.includes(savedSubagentSound)
    ? savedSubagentSound
    : "soft";
}

async function playWithUi(context, sound, reportResult) {
  const result = await playSound(
    context,
    sound,
    volumePercent
  );

  if (!reportResult) {
    if (!result.ok) log(`audio failed: ${result.error}`);
    return result;
  }

  if (result.ok && result.muted) {
    vscode.window.showInformationMessage(msg().muted);
  } else if (result.ok) {
    vscode.window.showInformationMessage(
      msg().testOk(soundLabel(sound), volumePercent)
    );
  } else {
    log(`audio failed: ${result.error}`);
    output.show(true);
    vscode.window.showErrorMessage(msg().testFailed);
  }

  return result;
}

function enqueuePlayback(context, sound, reportResult) {
  if (!playbackQueue) {
    playbackQueue = new PlaybackQueue(
      (queuedContext, queuedSound, queuedReportResult) =>
        playWithUi(
          queuedContext,
          queuedSound,
          queuedReportResult
        )
    );
  }

  return playbackQueue.enqueue(
    context,
    sound,
    reportResult
  );
}

function isMonitorOwner() {
  return monitor?.diagnostics().lockOwned === true;
}

function suppressDuplicate(key) {
  const now = Date.now();
  const previous = lastNotifyAtByKey.get(key) || 0;

  if (now - previous < debounceMs) {
    return true;
  }

  lastNotifyAtByKey.set(key, now);

  if (lastNotifyAtByKey.size > 256) {
    const cutoff = now - 60_000;

    for (const [entryKey, timestamp] of lastNotifyAtByKey) {
      if (timestamp < cutoff) {
        lastNotifyAtByKey.delete(entryKey);
      }
    }
  }

  return false;
}

function notifyWithSound(context, row, sound, kind, key) {
  if (!enabled) return;

  if (suppressDuplicate(key)) {
    log(
      `duplicate ${kind} completion notification suppressed; ` +
      `thread=${row?.completionThreadId || "unknown"}; ` +
      `turn=${row?.completionTurnId || "unknown"}`
    );
    return;
  }

  log(
    `Codex ${kind} turn/completed -> sound; ` +
    `thread=${row?.completionThreadId || "unknown"}; ` +
    `turn=${row?.completionTurnId || "unknown"}; ` +
    `sound=${sound}; volume=${volumePercent}%`
  );

  void enqueuePlayback(context, sound, false);
}

function notifyMainCompletion(context, row) {
  const completionKey =
    `${row?.completionThreadId || "unknown"}:` +
    `${row?.completionTurnId || "unknown"}`;

  notifyWithSound(
    context,
    row,
    selectedSound,
    "main",
    `main:${completionKey}`
  );
}

function notifySubagentCompletion(context, row) {
  if (!enabled) return;

  if (!subagentEnabled) {
    log(
      `Codex subagent turn/completed ignored (disabled); ` +
      `thread=${row?.completionThreadId || "unknown"}; ` +
      `turn=${row?.completionTurnId || "unknown"}`
    );
    return;
  }

  const threadKey =
    `${row?.completionThreadId || "unknown"}:` +
    `${row?.completionTurnId || "unknown"}`;

  notifyWithSound(
    context,
    row,
    selectedSubagentSound,
    "subagent",
    `subagent:${threadKey}`
  );
}

function handleCodexEvent(context, event, row) {
  if (event === "turn/started") {
    log(
      `Codex UI turn is running; ` +
      `role=${row?.completionRole || "unknown"}; ` +
      `thread=${row?.completionThreadId || "unknown"}; ` +
      `turn=${row?.completionTurnId || "unknown"}`
    );
    return;
  }

  if (event !== "turn/completed") return;

  if (row?.completionRole === "auxiliary") {
    log(
      `Codex auxiliary turn/completed ignored; ` +
      `thread=${row?.completionThreadId || "unknown"}; ` +
      `turn=${row?.completionTurnId || "unknown"}; ` +
      `trigger=${row?.completionTrigger || "unknown"}`
    );
    return;
  }

  if (row?.completionRole === "subagent") {
    notifySubagentCompletion(context, row);
    return;
  }

  notifyMainCompletion(context, row);
}

async function activate(context) {
  output = vscode.window.createOutputChannel("Codex Completion Sound");
  context.subscriptions.push(output);

  playbackQueue = new PlaybackQueue(
    (queuedContext, queuedSound, queuedReportResult) =>
      playWithUi(
        queuedContext,
        queuedSound,
        queuedReportResult
      )
  );

  await migrateLegacySettings(context);
  loadState();

  log("extension 1.2.6 activated");
  log(
    `platform=${process.platform}; node=${process.versions.node}; ` +
    `enabled=${enabled}; sound=${selectedSound}; volume=${volumePercent}%; ` +
    `subagentEnabled=${subagentEnabled}; subagentSound=${selectedSubagentSound}`
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.openSettings",
      async () => {
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "@ext:yaruani.codex-done-sound"
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.testSound",
      async () => {
        await enqueuePlayback(
          context,
          selectedSound,
          true
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.selectSound",
      async () => {
        const items = VALID_SOUNDS.map((value) => ({
          label: soundLabel(value),
          description: value === selectedSound ? msg().current : "",
          value
        }));

        const picked = await vscode.window.showQuickPick(
          items,
          { placeHolder: msg().chooseSound }
        );

        if (!picked) return;

        await config().update(
          "sound",
          picked.value,
          vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(
          msg().changedSound(
            soundLabel(picked.value),
            volumePercent
          )
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.setVolume",
      async () => {
        const items = [];

        for (let value = 100; value >= 0; value -= 5) {
          items.push({
            label: `${value}%`,
            description: value === volumePercent ? msg().current : "",
            value
          });
        }

        const picked = await vscode.window.showQuickPick(
          items,
          { placeHolder: msg().chooseVolume }
        );

        if (!picked) return;

        await config().update(
          "volumePercent",
          picked.value,
          vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(
          msg().changedVolume(picked.value)
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.toggle",
      async () => {
        const nextEnabled = !enabled;

        await config().update(
          "enabled",
          nextEnabled,
          vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(msg().enabled(nextEnabled));
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.diagnostics",
      async () => {
        const md = monitor ? monitor.diagnostics() : {};

        const info = [
          "version=1.2.6",
          `platform=${process.platform}`,
          `arch=${process.arch}`,
          `node=${process.versions.node}`,
          `enabled=${enabled}`,
          `sound=${selectedSound}`,
          `volumePercent=${volumePercent}`,
          `subagentEnabled=${subagentEnabled}`,
          `subagentSound=${selectedSubagentSound}`,
          `backend=${md.backend || "not-started"}`,
          `monitorStatus=${md.status || "not-started"}`,
          `sessionsRoot=${md.sessionsRoot || getSessionsRoot()}`,
          `trackedRollouts=${md.trackedRollouts ?? 0}`,
          `seededRollouts=${md.seededFiles ?? 0}`,
          `lastEvent=${md.lastEvent ? JSON.stringify(md.lastEvent) : "none"}`,
          `monitorLockOwned=${md.lockOwned ?? false}`,
          `monitorLockPath=${md.lockPath || "unknown"}`,
          `sourceWav=${sourceSoundPath(context, selectedSound)}`,
          `sourceWavExists=${fs.existsSync(sourceSoundPath(context, selectedSound))}`,
          `subagentSourceWav=${sourceSoundPath(context, selectedSubagentSound)}`,
          `subagentSourceWavExists=${fs.existsSync(sourceSoundPath(context, selectedSubagentSound))}`,
          `globalStorage=${context.globalStorageUri.fsPath}`,
          `codexHome=${getCodexHome()}`
        ].join("\n");

        log(info);
        output.show(true);
        await vscode.env.clipboard.writeText(info);
        vscode.window.showInformationMessage(msg().diagnosticCopied);
      }
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration(CONFIG_SECTION)) return;

      const previousSound = selectedSound;
      const previousVolume = volumePercent;
      const previousEnabled = enabled;
      const previousSubagentEnabled = subagentEnabled;
      const previousSubagentSound = selectedSubagentSound;

      loadState();

      log(
        `settings changed; enabled=${enabled}; ` +
        `sound=${selectedSound}; volume=${volumePercent}%; ` +
        `subagentEnabled=${subagentEnabled}; ` +
        `subagentSound=${selectedSubagentSound}`
      );

      const shouldPreview =
        enabled && isMonitorOwner();

      if (shouldPreview && selectedSound !== previousSound) {
        await enqueuePlayback(context, selectedSound, false);
      } else if (
        shouldPreview &&
        subagentEnabled &&
        selectedSubagentSound !== previousSubagentSound
      ) {
        await enqueuePlayback(
          context,
          selectedSubagentSound,
          false
        );
      } else if (
        shouldPreview &&
        volumePercent !== previousVolume
      ) {
        await enqueuePlayback(context, selectedSound, false);
      }

      if (enabled !== previousEnabled) {
        log(`notification sound ${enabled ? "enabled" : "disabled"}`);
      }

      if (subagentEnabled !== previousSubagentEnabled) {
        log(
          `subagent completion sound ` +
          `${subagentEnabled ? "enabled" : "disabled"}`
        );
      }
    })
  );

  monitor = new CodexRolloutMonitor({
    sessionsRoot: getSessionsRoot(),
    rescanIntervalMs: 1000,
    watchDebounceMs: 20,
    log,
    onEvent: (event, row) => handleCodexEvent(context, event, row)
  });

  try {
    monitor.start();
  } catch (error) {
    log(`monitor start failed: ${String(error)}`);
    output.show(true);
    vscode.window.showErrorMessage(msg().backendFailed);
  }

  context.subscriptions.push({
    dispose() {
      if (monitor) monitor.stop();
    }
  });
}

function deactivate() {
  if (monitor) {
    monitor.stop();
    monitor = null;
  }

  playbackQueue = null;
}

module.exports = {
  activate,
  deactivate
};
