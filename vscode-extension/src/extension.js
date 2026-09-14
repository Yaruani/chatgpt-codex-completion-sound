"use strict";

const vscode = require("vscode");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const os = require("os");

const {
  VALID_SOUNDS,
  clampVolume,
  sourceSoundPath,
  playSound
} = require("./audio");

const {
  isVscodeSessionMeta,
  isTaskStarted,
  isTaskComplete
} = require("./codex-events");

const {
  IdleCompletionGate
} = require("./idle-gate");

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
    chooseSound: "Choose the notification sound for completed Codex tasks",
    chooseVolume: "Choose notification volume (does not change Windows master volume)",
    changedSound: (label, volume) => `Codex Completion Sound: ${label} / ${volume}%`,
    changedVolume: (volume) => `Codex Completion Sound: volume ${volume}%`,
    enabled: (value) => `Codex Completion Sound: ${value ? "ON" : "OFF"}`,
    muted: "Codex Completion Sound: volume is 0% (muted).",
    testOk: (label, volume) => `Codex Completion Sound: played ${label} / ${volume}%.`,
    testFailed: "Codex Completion Sound: playback failed. Check Output → Codex Completion Sound.",
    diagnosticCopied: "Codex Completion Sound: diagnostics copied to clipboard."
  },
  ja: {
    current: "現在の設定",
    chooseSound: "Codex完了時の通知音を選択",
    chooseVolume: "通知音量を選択（Windows全体の音量は変更しません）",
    changedSound: (label, volume) => `Codex Completion Sound: ${label} / ${volume}%`,
    changedVolume: (volume) => `Codex Completion Sound: 音量 ${volume}%`,
    enabled: (value) => `Codex Completion Sound: ${value ? "ON" : "OFF"}`,
    muted: "Codex Completion Sound: 音量は0%（ミュート）です。",
    testOk: (label, volume) => `Codex Completion Sound: ${label} / ${volume}% を再生しました。`,
    testFailed: "Codex Completion Sound: 音声再生に失敗しました。Output → Codex Completion Sound を確認してください。",
    diagnosticCopied: "Codex Completion Sound: 診断情報をクリップボードへコピーしました。"
  }
};

const states = new Map();

let watcher = null;
let output = null;
let enabled = true;
let selectedSound = "bell";
let volumePercent = 65;
let debounceMs = 700;
let lastNotifyAt = 0;
let idleSettleMs = 2000;
let sessionsRoot = null;

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

function loadState(context) {
  enabled = context.globalState.get("enabled", true);

  const savedSound = context.globalState.get("sound", "bell");
  selectedSound = VALID_SOUNDS.includes(savedSound) ? savedSound : "bell";

  volumePercent = clampVolume(
    context.globalState.get("volumePercent", 65)
  );

  debounceMs = context.globalState.get("debounceMs", 700);
  idleSettleMs = context.globalState.get("idleSettleMs", 2000);
}

async function playWithUi(context, reportResult) {
  const result = await playSound(
    context,
    selectedSound,
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
      msg().testOk(soundLabel(selectedSound), volumePercent)
    );
  } else {
    log(`audio failed: ${result.error}`);
    output.show(true);
    vscode.window.showErrorMessage(msg().testFailed);
  }

  return result;
}

async function readPrefix(filePath, maxBytes = 65536) {
  let handle;

  try {
    handle = await fsp.open(filePath, "r");
    const stat = await handle.stat();
    const len = Math.min(stat.size, maxBytes);
    const buffer = Buffer.alloc(len);

    if (len > 0) {
      await handle.read(buffer, 0, len, 0);
    }

    return buffer.toString("utf8");
  } catch {
    return "";
  } finally {
    if (handle) await handle.close().catch(() => {});
  }
}

function detectVscodeSession(text) {
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;

    try {
      const obj = JSON.parse(line);
      if (isVscodeSessionMeta(obj)) return true;
    } catch {}
  }

  return false;
}

async function seedFile(filePath) {
  try {
    const stat = await fsp.stat(filePath);
    const prefix = await readPrefix(filePath);

    states.set(filePath, {
      offset: stat.size,
      buffer: "",
      isVscode: detectVscodeSession(prefix),
      idleGate: null
    });
  } catch {}
}

async function seedExistingFiles(dir) {
  let entries;

  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await seedExistingFiles(full);
    } else if (
      entry.isFile() &&
      entry.name.startsWith("rollout-") &&
      entry.name.endsWith(".jsonl")
    ) {
      await seedFile(full);
    }
  }
}

function ensureIdleGate(context, state) {
  if (state.idleGate) return state.idleGate;

  state.idleGate = new IdleCompletionGate(
    idleSettleMs,
    () => maybeNotify(context, state)
  );

  return state.idleGate;
}

function processObject(context, state, obj) {
  if (isVscodeSessionMeta(obj)) {
    state.isVscode = true;
  }

  if (isTaskStarted(obj)) {
    ensureIdleGate(context, state).taskStarted();

    const turnId = obj?.payload?.turn_id || "unknown";
    log(`Codex task_started; pending completion notification cancelled; turn=${turnId}`);
    return;
  }

  if (isTaskComplete(obj)) {
    ensureIdleGate(context, state).taskComplete();

    const turnId = obj?.payload?.turn_id || "unknown";
    log(
      `Codex task_complete; waiting ${idleSettleMs}ms for true idle; turn=${turnId}`
    );
  }
}

function maybeProcessTail(context, state) {
  const tail = state.buffer.trim();
  if (!tail) return;

  try {
    const obj = JSON.parse(tail);
    state.buffer = "";
    processObject(context, state, obj);
  } catch {
    // Leave incomplete JSON buffered until the next append.
  }
}

function maybeNotify(context, state) {
  if (!enabled || !state.isVscode) return;

  const now = Date.now();
  if (now - lastNotifyAt < debounceMs) return;

  lastNotifyAt = now;

  log(
    `Codex true-idle detected; sound=${selectedSound}; ` +
    `volume=${volumePercent}%`
  );

  void playWithUi(context, false);
}

async function processFile(context, filePath) {
  if (!filePath.endsWith(".jsonl")) return;

  let state = states.get(filePath);
  let stat;

  try {
    stat = await fsp.stat(filePath);
  } catch {
    return;
  }

  if (!state) {
    state = {
      offset: 0,
      buffer: "",
      isVscode: false,
      idleGate: null
    };
    states.set(filePath, state);
  }

  if (stat.size < state.offset) {
    if (state.idleGate) state.idleGate.dispose();
    state.offset = 0;
    state.buffer = "";
    state.isVscode = false;
    state.idleGate = null;
  }

  if (stat.size === state.offset) {
    maybeProcessTail(context, state);
    return;
  }

  const length = stat.size - state.offset;
  let handle;

  try {
    handle = await fsp.open(filePath, "r");
    const buffer = Buffer.alloc(length);
    const result = await handle.read(
      buffer, 0, length, state.offset
    );

    state.offset += result.bytesRead;

    const text =
      state.buffer +
      buffer.subarray(0, result.bytesRead).toString("utf8");

    const lines = text.split(/\r?\n/);
    state.buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        processObject(context, state, JSON.parse(line));
      } catch {}
    }

    maybeProcessTail(context, state);
  } catch (error) {
    log(`read failed ${filePath}: ${String(error)}`);
  } finally {
    if (handle) await handle.close().catch(() => {});
  }
}

function resolveWatchPath(filename) {
  if (!filename) return null;

  const raw = Buffer.isBuffer(filename)
    ? filename.toString("utf8")
    : String(filename);

  return path.join(sessionsRoot, raw);
}

async function startWatcher(context) {
  sessionsRoot = path.join(getCodexHome(), "sessions");

  try {
    await fsp.mkdir(sessionsRoot, { recursive: true });
  } catch (error) {
    log(`cannot access sessions directory: ${String(error)}`);
    return;
  }

  await seedExistingFiles(sessionsRoot);

  try {
    watcher = fs.watch(
      sessionsRoot,
      { recursive: true },
      (_eventType, filename) => {
        const full = resolveWatchPath(filename);

        if (!full) return;
        if (!path.basename(full).startsWith("rollout-")) return;
        if (!full.endsWith(".jsonl")) return;

        setTimeout(() => processFile(context, full), 80);
      }
    );

    watcher.on(
      "error",
      (error) => log(`watcher error: ${String(error)}`)
    );

    context.subscriptions.push({
      dispose() {
        if (watcher) watcher.close();
      }
    });

    log(`watching ${sessionsRoot}`);
  } catch (error) {
    log(`failed to start watcher: ${String(error)}`);
  }
}

async function activate(context) {
  output = vscode.window.createOutputChannel("Codex Completion Sound");
  context.subscriptions.push(output);

  loadState(context);

  log("extension 1.2.2 activated");
  log(
    `platform=${process.platform}; enabled=${enabled}; ` +
    `sound=${selectedSound}; volume=${volumePercent}%`
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.testSound",
      async () => {
        await playWithUi(context, true);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.selectSound",
      async () => {
        const items = VALID_SOUNDS.map((value) => ({
          label: soundLabel(value),
          description:
            value === selectedSound ? msg().current : "",
          value
        }));

        const picked = await vscode.window.showQuickPick(
          items,
          { placeHolder: msg().chooseSound }
        );

        if (!picked) return;

        selectedSound = picked.value;
        await context.globalState.update("sound", selectedSound);

        await playWithUi(context, false);

        vscode.window.showInformationMessage(
          msg().changedSound(
            soundLabel(selectedSound),
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
            description:
              value === volumePercent ? msg().current : "",
            value
          });
        }

        const picked = await vscode.window.showQuickPick(
          items,
          { placeHolder: msg().chooseVolume }
        );

        if (!picked) return;

        volumePercent = picked.value;
        await context.globalState.update(
          "volumePercent",
          volumePercent
        );

        await playWithUi(context, false);

        vscode.window.showInformationMessage(
          msg().changedVolume(volumePercent)
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.toggle",
      async () => {
        enabled = !enabled;
        await context.globalState.update("enabled", enabled);
        vscode.window.showInformationMessage(msg().enabled(enabled));
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codexCompletionSound.diagnostics",
      async () => {
        const info = [
          "version=1.2.2",
          `platform=${process.platform}`,
          `arch=${process.arch}`,
          `enabled=${enabled}`,
          `sound=${selectedSound}`,
          `volumePercent=${volumePercent}`,
          `idleSettleMs=${idleSettleMs}`,
          `sourceWav=${sourceSoundPath(context, selectedSound)}`,
          `sourceWavExists=${fs.existsSync(sourceSoundPath(context, selectedSound))}`,
          `globalStorage=${context.globalStorageUri.fsPath}`,
          `codexHome=${getCodexHome()}`,
          `sessions=${path.join(getCodexHome(), "sessions")}`
        ].join("\n");

        log(info);
        output.show(true);
        await vscode.env.clipboard.writeText(info);
        vscode.window.showInformationMessage(msg().diagnosticCopied);
      }
    )
  );

  await startWatcher(context);
}

function deactivate() {
  if (watcher) watcher.close();
  watcher = null;

  for (const state of states.values()) {
    if (state.idleGate) state.idleGate.dispose();
  }
}

module.exports = {
  activate,
  deactivate
};
