"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");

const { SingleInstanceLock } = require("../src/single-instance-lock");

test("single-instance lock excludes another owner and can be reacquired after release", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-done-sound-lock-test-"));
  const lockPath = path.join(dir, "monitor.lock");

  const first = new SingleInstanceLock(lockPath);
  const second = new SingleInstanceLock(lockPath);

  try {
    assert.equal(first.tryAcquire(), true);
    assert.equal(second.tryAcquire(), false);

    first.release();

    assert.equal(second.tryAcquire(), true);
  } finally {
    second.release();
    first.release();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
