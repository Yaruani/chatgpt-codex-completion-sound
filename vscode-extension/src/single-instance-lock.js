"use strict";

const fs = require("fs");
const path = require("path");

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

module.exports = {
  SingleInstanceLock
};
