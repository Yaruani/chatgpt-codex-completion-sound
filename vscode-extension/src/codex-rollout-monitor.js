"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const {
  SingleInstanceLock
} = require("./single-instance-lock");

const START_TYPES = new Set(["task_started", "turn_started"]);
const COMPLETE_TYPES = new Set(["task_complete", "turn_complete"]);
const MAX_HEAD_BYTES = 256 * 1024;
const READ_CHUNK_BYTES = 256 * 1024;

function normalizeEventType(type) {
  if (START_TYPES.has(type)) return "turn/started";
  if (COMPLETE_TYPES.has(type)) return "turn/completed";
  return null;
}

function normalizeOrdinal(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function sessionMetaFromObject(obj) {
  if (!obj || obj.type !== "session_meta") return null;

  const payload = obj.payload || {};
  const threadId = payload.id ? String(payload.id) : null;
  const parentThreadId = payload.parent_thread_id
    ? String(payload.parent_thread_id)
    : null;
  const agentPath = payload.agent_path
    ? String(payload.agent_path)
    : null;
  const agentRole = payload.agent_role
    ? String(payload.agent_role)
    : null;
  const subagentHistoryStartOrdinal = normalizeOrdinal(
    payload.subagent_history_start_ordinal
  );

  return {
    threadId,
    parentThreadId,
    agentPath,
    agentRole,
    historyMode: payload.history_mode || null,
    subagentHistoryStartOrdinal,
    role:
      parentThreadId ||
      agentPath ||
      agentRole ||
      subagentHistoryStartOrdinal !== null
        ? "subagent"
        : "main"
  };
}

function createRolloutState() {
  return {
    position: 0,
    tail: "",
    meta: null,
    reading: false,
    pending: false
  };
}

function applyRolloutObject(state, obj, detectedAtMs = Date.now()) {
  if (!state || !obj) return null;

  const meta = sessionMetaFromObject(obj);
  if (meta) {
    // The recorder writes this rollout's own session_meta first. Child rollouts
    // can then contain inherited parent session_meta records, so never overwrite
    // the first metadata record with later inherited metadata.
    if (!state.meta) {
      state.meta = meta;
    }
    return null;
  }

  if (obj.type !== "event_msg") return null;

  const payload = obj.payload || {};
  const event = normalizeEventType(payload.type);
  if (!event || !state.meta?.threadId) return null;

  const ordinal = normalizeOrdinal(obj.ordinal);
  const boundary = state.meta.subagentHistoryStartOrdinal;

  if (
    state.meta.role === "subagent" &&
    boundary !== null &&
    (ordinal === null || ordinal < boundary)
  ) {
    return null;
  }

  const turnId = payload.turn_id ? String(payload.turn_id) : null;
  if (!turnId) return null;

  const eventTimestamp = obj.timestamp ? String(obj.timestamp) : null;
  const eventTimeMs = eventTimestamp ? Date.parse(eventTimestamp) : NaN;
  const detectionLagMs = Number.isFinite(eventTimeMs)
    ? detectedAtMs - eventTimeMs
    : null;

  return {
    event,
    role: state.meta.role,
    threadId: state.meta.threadId,
    parentThreadId: state.meta.parentThreadId,
    agentPath: state.meta.agentPath,
    turnId,
    rootTurnId: payload.root_turn_id ? String(payload.root_turn_id) : null,
    ordinal,
    eventTimestamp,
    detectionLagMs
  };
}

function parseJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

class CodexRolloutMonitor {
  constructor(options) {
    this.sessionsRoot = options.sessionsRoot;
    this.onEvent = options.onEvent;
    this.log = options.log || (() => {});
    this.rescanIntervalMs = options.rescanIntervalMs || 1000;
    this.lockRetryMs = options.lockRetryMs || 2000;
    this.watchDebounceMs = options.watchDebounceMs || 20;
    this.startupGraceMs = options.startupGraceMs ?? 5000;
    this.lockPath =
      options.lockPath ||
      path.join(os.tmpdir(), "codex-completion-sound-monitor.lock");

    this.lock = new SingleInstanceLock(this.lockPath, this.log);
    this.states = new Map();
    this.watchTimers = new Map();
    this.watcher = null;
    this.rescanTimer = null;
    this.lockRetryTimer = null;
    this.backend = "rollout-jsonl";
    this.status = "stopped";
    this.seededFiles = 0;
    this.lastEvent = null;
    this.acceptEventsAfterMs = 0;
    this.seenEventKeys = new Set();
    this.seenEventOrder = [];
  }

  listRolloutFiles(dir, output = []) {
    let entries;

    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return output;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.listRolloutFiles(fullPath, output);
      } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        output.push(fullPath);
      }
    }

    return output;
  }

  readOwnMetaFromHead(filePath) {
    let fd = null;

    try {
      const stat = fs.statSync(filePath);
      const length = Math.min(stat.size, MAX_HEAD_BYTES);
      if (length <= 0) return null;

      fd = fs.openSync(filePath, "r");
      const buffer = Buffer.alloc(length);
      const bytesRead = fs.readSync(fd, buffer, 0, length, 0);
      const text = buffer.subarray(0, bytesRead).toString("utf8");

      for (const line of text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const obj = parseJsonLine(line);
        const meta = sessionMetaFromObject(obj);
        if (meta) return meta;
      }
    } catch {
      return null;
    } finally {
      if (fd !== null) {
        try { fs.closeSync(fd); } catch {}
      }
    }

    return null;
  }

  registerFile(filePath, seedAtEof) {
    if (this.states.has(filePath)) return this.states.get(filePath);

    let size = 0;
    try {
      size = fs.statSync(filePath).size;
    } catch {
      return null;
    }

    const state = createRolloutState();
    state.meta = this.readOwnMetaFromHead(filePath);
    state.position = seedAtEof ? size : 0;
    this.states.set(filePath, state);

    if (seedAtEof) {
      this.seededFiles += 1;
    }

    return state;
  }

  discoverFiles(seedAtEof = false) {
    if (!fs.existsSync(this.sessionsRoot)) return 0;

    const files = this.listRolloutFiles(this.sessionsRoot);
    let added = 0;

    for (const filePath of files) {
      if (this.states.has(filePath)) continue;
      if (this.registerFile(filePath, seedAtEof)) {
        added += 1;
        if (!seedAtEof) {
          void this.processFile(filePath);
        }
      }
    }

    return added;
  }

  rememberEventKey(key) {
    if (this.seenEventKeys.has(key)) return false;

    this.seenEventKeys.add(key);
    this.seenEventOrder.push(key);

    while (this.seenEventOrder.length > 4096) {
      const oldest = this.seenEventOrder.shift();
      this.seenEventKeys.delete(oldest);
    }

    return true;
  }

  emitRecord(record, filePath) {
    if (!record) return;

    const fileName = path.basename(filePath);
    const eventTimeMs = record.eventTimestamp
      ? Date.parse(record.eventTimestamp)
      : NaN;

    if (
      this.acceptEventsAfterMs > 0 &&
      Number.isFinite(eventTimeMs) &&
      eventTimeMs < this.acceptEventsAfterMs
    ) {
      this.log(
        `stale rollout event ignored; ` +
        `role=${record.role}; ` +
        `thread=${record.threadId}; ` +
        `turn=${record.turnId}; ` +
        `event=${record.event}; ` +
        `file=${fileName}`
      );
      return;
    }

    const eventKey =
      `${record.event}:${record.role}:${record.threadId}:${record.turnId}`;

    if (!this.rememberEventKey(eventKey)) {
      this.log(
        `replayed rollout event ignored; ` +
        `role=${record.role}; ` +
        `thread=${record.threadId}; ` +
        `turn=${record.turnId}; ` +
        `event=${record.event}; ` +
        `file=${fileName}`
      );
      return;
    }

    const lagText = record.detectionLagMs === null
      ? "unknown"
      : String(record.detectionLagMs);

    this.lastEvent = {
      ...record,
      fileName,
      detectedAt: new Date().toISOString()
    };

    this.log(
      `Codex rollout ${record.event}; ` +
      `role=${record.role}; ` +
      `thread=${record.threadId}; ` +
      `turn=${record.turnId}; ` +
      `ordinal=${record.ordinal ?? "unknown"}; ` +
      `lagMs=${lagText}; ` +
      `file=${fileName}`
    );

    this.onEvent(record.event, {
      completionRole: record.role,
      completionThreadId: record.threadId,
      completionTurnId: record.turnId,
      completionTrigger: null,
      parentThreadId: record.parentThreadId,
      agentPath: record.agentPath,
      ordinal: record.ordinal,
      eventTimestamp: record.eventTimestamp,
      detectionLagMs: record.detectionLagMs,
      rolloutPath: filePath,
      rolloutFile: fileName
    });
  }

  consumeText(state, text, filePath) {
    const combined = state.tail + text;
    const lines = combined.split(/\r?\n/);
    state.tail = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const obj = parseJsonLine(line);
      if (!obj) continue;

      const record = applyRolloutObject(state, obj, Date.now());
      this.emitRecord(record, filePath);
    }
  }

  async readDelta(filePath, state) {
    let stat;

    try {
      stat = await fs.promises.stat(filePath);
    } catch {
      return;
    }

    if (stat.size < state.position) {
      this.log(
        `rollout file shrank; rescanning with startup/replay guards; ` +
        `file=${path.basename(filePath)}; ` +
        `previousPosition=${state.position}; size=${stat.size}`
      );
      state.position = 0;
      state.tail = "";
      state.meta = null;
    }

    if (stat.size === state.position) return;

    let handle = null;

    try {
      handle = await fs.promises.open(filePath, "r");

      while (state.position < stat.size) {
        const remaining = stat.size - state.position;
        const length = Math.min(READ_CHUNK_BYTES, remaining);
        const buffer = Buffer.alloc(length);
        const { bytesRead } = await handle.read(
          buffer,
          0,
          length,
          state.position
        );

        if (!bytesRead) break;

        state.position += bytesRead;
        this.consumeText(
          state,
          buffer.subarray(0, bytesRead).toString("utf8"),
          filePath
        );
      }
    } catch (error) {
      this.log(
        `rollout read failed; file=${path.basename(filePath)}; ` +
        `error=${String(error)}`
      );
    } finally {
      if (handle) {
        try { await handle.close(); } catch {}
      }
    }
  }

  async processFile(filePath) {
    let state = this.states.get(filePath);
    if (!state) {
      state = this.registerFile(filePath, false);
    }
    if (!state) return;

    if (state.reading) {
      state.pending = true;
      return;
    }

    state.reading = true;

    try {
      do {
        state.pending = false;
        await this.readDelta(filePath, state);
      } while (state.pending);
    } finally {
      state.reading = false;
    }
  }

  scheduleFile(filePath) {
    if (!filePath.endsWith(".jsonl")) return;

    const existing = this.watchTimers.get(filePath);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.watchTimers.delete(filePath);
      void this.processFile(filePath);
    }, this.watchDebounceMs);

    timer.unref?.();
    this.watchTimers.set(filePath, timer);
  }

  startWatcher() {
    if (this.watcher) return true;
    if (!fs.existsSync(this.sessionsRoot)) {
      this.status = "waiting-for-sessions";
      return false;
    }

    try {
      this.watcher = fs.watch(
        this.sessionsRoot,
        { recursive: true },
        (_eventType, filename) => {
          if (!filename) return;
          const relative = String(filename);
          if (!relative.endsWith(".jsonl")) return;
          this.scheduleFile(path.join(this.sessionsRoot, relative));
        }
      );

      this.watcher.on("error", (error) => {
        this.log(`rollout watcher error: ${String(error)}`);
        this.closeWatcher();
        this.status = "watch-error";
      });

      this.status = "monitoring";
      this.log(
        `rollout JSONL monitor active; root=${this.sessionsRoot}; ` +
        `seededFiles=${this.seededFiles}`
      );
      return true;
    } catch (error) {
      this.status = "watch-error";
      this.log(`rollout watcher start failed: ${String(error)}`);
      return false;
    }
  }

  closeWatcher() {
    if (this.watcher) {
      try { this.watcher.close(); } catch {}
      this.watcher = null;
    }
  }

  startRescan() {
    if (this.rescanTimer) return;

    this.rescanTimer = setInterval(() => {
      if (!this.watcher) {
        this.startWatcher();
      }
      this.discoverFiles(false);
    }, this.rescanIntervalMs);

    this.rescanTimer.unref?.();
  }

  startOwned() {
    this.seededFiles = 0;
    this.acceptEventsAfterMs = Date.now() - this.startupGraceMs;
    this.seenEventKeys.clear();
    this.seenEventOrder.length = 0;
    this.discoverFiles(true);
    this.startWatcher();
    this.startRescan();
  }

  start() {
    if (this.lock.tryAcquire()) {
      this.startOwned();
      return;
    }

    this.status = "passive-other-window";
    this.log(
      "another VS Code window already owns the Codex completion monitor; " +
      "this window stays passive"
    );

    this.lockRetryTimer = setInterval(() => {
      if (this.lock.tryAcquire()) {
        clearInterval(this.lockRetryTimer);
        this.lockRetryTimer = null;
        this.startOwned();
      }
    }, this.lockRetryMs);

    this.lockRetryTimer.unref?.();
  }

  stop() {
    this.closeWatcher();

    if (this.rescanTimer) {
      clearInterval(this.rescanTimer);
      this.rescanTimer = null;
    }

    if (this.lockRetryTimer) {
      clearInterval(this.lockRetryTimer);
      this.lockRetryTimer = null;
    }

    for (const timer of this.watchTimers.values()) {
      clearTimeout(timer);
    }
    this.watchTimers.clear();
    this.states.clear();
    this.lock.release();
    this.status = "stopped";
  }

  diagnostics() {
    return {
      backend: this.backend,
      status: this.status,
      sessionsRoot: this.sessionsRoot,
      trackedRollouts: this.states.size,
      seededFiles: this.seededFiles,
      acceptEventsAfter: this.acceptEventsAfterMs
        ? new Date(this.acceptEventsAfterMs).toISOString()
        : null,
      lastEvent: this.lastEvent,
      lockOwned: this.lock.owned,
      lockPath: this.lockPath
    };
  }
}

module.exports = {
  normalizeEventType,
  sessionMetaFromObject,
  createRolloutState,
  applyRolloutObject,
  CodexRolloutMonitor
};
