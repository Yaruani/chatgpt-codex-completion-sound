"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  classifyAppServerLog
} = require("../src/codex-log-monitor");

test("classifies app-server turn lifecycle records", () => {
  assert.equal(
    classifyAppServerLog({
      target: "codex_app_server::outgoing_message",
      feedback_log_body: "app-server event: turn/started targeted_connections=1"
    }),
    "turn/started"
  );

  assert.equal(
    classifyAppServerLog({
      target: "codex_app_server::outgoing_message",
      feedback_log_body: "app-server event: turn/completed targeted_connections=1"
    }),
    "turn/completed"
  );
});

test("ignores unrelated records", () => {
  assert.equal(
    classifyAppServerLog({
      target: "other",
      feedback_log_body: "app-server event: turn/completed targeted_connections=1"
    }),
    null
  );
});
