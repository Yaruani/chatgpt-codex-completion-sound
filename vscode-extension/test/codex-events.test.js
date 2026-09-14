"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isVscodeSessionMeta,
  isTaskStarted,
  isTaskComplete
} = require("../src/codex-events");

test("detects VS Code originator", () => {
  assert.equal(
    isVscodeSessionMeta({
      type: "session_meta",
      payload: { originator: "codex_vscode" }
    }),
    true
  );
});

test("detects VS Code source", () => {
  assert.equal(
    isVscodeSessionMeta({
      type: "session_meta",
      payload: { source: "vscode" }
    }),
    true
  );
});

test("rejects non-VS Code session metadata", () => {
  assert.equal(
    isVscodeSessionMeta({
      type: "session_meta",
      payload: { source: "cli" }
    }),
    false
  );
});

test("detects task_complete", () => {
  assert.equal(
    isTaskComplete({
      type: "event_msg",
      payload: { type: "task_complete" }
    }),
    true
  );
});


test("detects task_started", () => {
  assert.equal(
    isTaskStarted({
      type: "event_msg",
      payload: { type: "task_started", turn_id: "turn-1" }
    }),
    true
  );
});
