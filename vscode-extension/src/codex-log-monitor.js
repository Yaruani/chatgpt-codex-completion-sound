"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const TARGET = "codex_app_server::outgoing_message";
const START_PREFIX = "app-server event: turn/started";
const COMPLETE_PREFIX = "app-server event: turn/completed";

function classifyAppServerLog(row) {
  if (!row || row.target !== TARGET) return null;

  const body = String(row.feedback_log_body || "");

  if (body.startsWith(START_PREFIX)) {
    return "turn/started";
  }

  if (body.startsWith(COMPLETE_PREFIX)) {
    return "turn/completed";
  }

  return null;
}

class SingleInstanceLock {
  constructor(lockPath, log) {
    this.lockPath = lockPath;
    this.log = log || (() => {});
    this.owned = false;
  }

  pidAlive(pid) {
    if (!Number.isInteger(pid) || pid <= 0) return false;
    if (pid === process.pid) return true;

    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return error && error.code === "EPERM";
    }
  }

  readOwnerPid() {
    try {
      const text = fs.readFileSync(this.lockPath, "utf8");
      const data = JSON.parse(text);
      return Number(data.pid);
    } catch {
      return null;
    }
  }

  tryAcquire() {
    if (this.owned) return true;

    fs.mkdirSync(path.dirname(this.lockPath), { recursive: true });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const fd = fs.openSync(this.lockPath, "wx");
        try {
          fs.writeFileSync(
            fd,
            JSON.stringify({
              pid: process.pid,
              startedAt: new Date().toISOString()
            }),
            "utf8"
          );
        } finally {
          fs.closeSync(fd);
        }

        this.owned = true;
        this.log(`single-instance monitor lock acquired; pid=${process.pid}`);
        return true;
      } catch (error) {
        if (!error || error.code !== "EEXIST") {
          this.log(`single-instance lock failed: ${String(error)}`);
          return false;
        }

        const ownerPid = this.readOwnerPid();

        if (this.pidAlive(ownerPid)) {
          return false;
        }

        try {
          fs.unlinkSync(this.lockPath);
          this.log(`removed stale monitor lock; oldPid=${ownerPid || "unknown"}`);
        } catch {
          return false;
        }
      }
    }

    return false;
  }

  release() {
    if (!this.owned) return;

    try {
      const ownerPid = this.readOwnerPid();
      if (ownerPid === process.pid) {
        fs.unlinkSync(this.lockPath);
      }
    } catch {}

    this.owned = false;
  }
}

class CodexLogMonitor {
  constructor(options) {
    this.dbPath = options.dbPath;
    this.onEvent = options.onEvent;
    this.log = options.log || (() => {});
    this.intervalMs = options.intervalMs || 250;
    this.lockPath =
      options.lockPath ||
      path.join(os.tmpdir(), "codex-completion-sound-monitor.lock");

    this.db = null;
    this.statement = null;
    this.lastId = 0;
    this.timer = null;
    this.lockRetryTimer = null;
    this.polling = false;
    this.lock = new SingleInstanceLock(this.lockPath, this.log);
    this.backend = "node:sqlite";
    this.status = "stopped";
  }

  sqliteModule() {
    // Dynamic require keeps activation graceful on VS Code builds whose
    // extension-host Node runtime does not provide node:sqlite.
    return require("node:sqlite");
  }

  openDatabase() {
    if (this.db) return true;
    if (!fs.existsSync(this.dbPath)) {
      this.status = "waiting-for-database";
      return false;
    }

    try {
      const { DatabaseSync } = this.sqliteModule();

      this.db = new DatabaseSync(this.dbPath, {
        readOnly: true
      });

      this.statement = this.db.prepare(
        "SELECT id, ts, target, feedback_log_body, process_uuid " +
        "FROM logs WHERE id > ? ORDER BY id ASC LIMIT 2000"
      );

      const row = this.db
        .prepare("SELECT COALESCE(MAX(id), 0) AS max_id FROM logs")
        .get();

      // Critical: start at the current end of the log. Historical completion
      // rows must never produce sounds when VS Code reloads.
      this.lastId = Number(row?.max_id || 0);
      this.status = "monitoring";

      this.log(
        `SQLite monitor opened at EOF; ` +
        `lastLogId=${this.lastId}; db=${this.dbPath}`
      );
      return true;
    } catch (error) {
      this.status = "backend-error";
      this.log(`SQLite monitor open failed: ${String(error)}`);
      this.closeDatabase();
      return false;
    }
  }

  closeDatabase() {
    this.statement = null;

    if (this.db) {
      try {
        this.db.close();
      } catch {}
    }

    this.db = null;
  }

  pollOnce() {
    if (!this.db || !this.statement || this.polling) return;

    this.polling = true;

    try {
      for (;;) {
        const rows = this.statement.all(this.lastId);

        if (!rows.length) break;

        for (const row of rows) {
          const id = Number(row.id);
          if (id > this.lastId) this.lastId = id;

          const event = classifyAppServerLog(row);
          if (event) {
            this.log(
              `Codex app-server ${event}; ` +
              `logId=${id}; process=${row.process_uuid || "unknown"}`
            );
            this.onEvent(event, row);
          }
        }

        if (rows.length < 2000) break;
      }
    } catch (error) {
      this.status = "read-error";
      this.log(`SQLite monitor poll failed: ${String(error)}`);
      this.closeDatabase();
    } finally {
      this.polling = false;
    }
  }

  startPolling() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      if (!this.db) {
        this.openDatabase();
      }

      if (this.db) {
        this.pollOnce();
      }
    }, this.intervalMs);

    this.timer.unref?.();
  }

  start() {
    if (this.lock.tryAcquire()) {
      this.openDatabase();
      this.startPolling();
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
        this.openDatabase();
        this.startPolling();
      }
    }, 2000);

    this.lockRetryTimer.unref?.();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.lockRetryTimer) {
      clearInterval(this.lockRetryTimer);
      this.lockRetryTimer = null;
    }

    this.closeDatabase();
    this.lock.release();
    this.status = "stopped";
  }

  diagnostics() {
    return {
      backend: this.backend,
      status: this.status,
      dbPath: this.dbPath,
      lastLogId: this.lastId,
      lockOwned: this.lock.owned,
      lockPath: this.lockPath
    };
  }
}

module.exports = {
  TARGET,
  START_PREFIX,
  COMPLETE_PREFIX,
  classifyAppServerLog,
  SingleInstanceLock,
  CodexLogMonitor
};
