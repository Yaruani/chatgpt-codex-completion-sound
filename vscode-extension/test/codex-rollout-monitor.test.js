"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeEventType,
  sessionMetaFromObject,
  createRolloutState,
  applyRolloutObject,
  CodexRolloutMonitor
} = require("../src/codex-rollout-monitor");

test("normalizes legacy and v2 turn lifecycle event names", () => {
  assert.equal(normalizeEventType("task_started"), "turn/started");
  assert.equal(normalizeEventType("turn_started"), "turn/started");
  assert.equal(normalizeEventType("task_complete"), "turn/completed");
  assert.equal(normalizeEventType("turn_complete"), "turn/completed");
  assert.equal(normalizeEventType("agent_message"), null);
});

test("classifies main rollout metadata", () => {
  assert.deepEqual(
    sessionMetaFromObject({
      type: "session_meta",
      payload: {
        id: "main-thread",
        parent_thread_id: null,
        agent_path: null,
        history_mode: "paginated"
      }
    }),
    {
      threadId: "main-thread",
      parentThreadId: null,
      agentPath: null,
      agentRole: null,
      historyMode: "paginated",
      subagentHistoryStartOrdinal: null,
      role: "main"
    }
  );
});

test("classifies subagent rollout metadata and preserves boundary", () => {
  assert.deepEqual(
    sessionMetaFromObject({
      type: "session_meta",
      payload: {
        id: "child-thread",
        parent_thread_id: "main-thread",
        agent_path: "/root/calc_final_1",
        history_mode: "paginated",
        subagent_history_start_ordinal: 65
      }
    }),
    {
      threadId: "child-thread",
      parentThreadId: "main-thread",
      agentPath: "/root/calc_final_1",
      agentRole: null,
      historyMode: "paginated",
      subagentHistoryStartOrdinal: 65,
      role: "subagent"
    }
  );
});

test("does not let inherited parent metadata overwrite child metadata", () => {
  const state = createRolloutState();

  applyRolloutObject(state, {
    type: "session_meta",
    ordinal: 0,
    payload: {
      id: "child-thread",
      parent_thread_id: "main-thread",
      agent_path: "/root/worker",
      subagent_history_start_ordinal: 65
    }
  });

  applyRolloutObject(state, {
    type: "session_meta",
    ordinal: 1,
    payload: {
      id: "main-thread",
      parent_thread_id: null,
      agent_path: null
    }
  });

  assert.equal(state.meta.threadId, "child-thread");
  assert.equal(state.meta.role, "subagent");
  assert.equal(state.meta.subagentHistoryStartOrdinal, 65);
});

test("ignores inherited subagent history below the boundary", () => {
  const state = createRolloutState();

  applyRolloutObject(state, {
    type: "session_meta",
    ordinal: 0,
    payload: {
      id: "child-thread",
      parent_thread_id: "main-thread",
      agent_path: "/root/worker",
      subagent_history_start_ordinal: 65
    }
  });

  assert.equal(
    applyRolloutObject(state, {
      timestamp: "2026-10-01T19:56:25.508Z",
      ordinal: 15,
      type: "event_msg",
      payload: {
        type: "task_complete",
        turn_id: "inherited-turn"
      }
    }, Date.parse("2026-10-01T19:56:25.570Z")),
    null
  );
});

test("emits the subagent's own completion at or above the boundary", () => {
  const state = createRolloutState();

  applyRolloutObject(state, {
    type: "session_meta",
    ordinal: 0,
    payload: {
      id: "child-thread",
      parent_thread_id: "main-thread",
      agent_path: "/root/worker",
      subagent_history_start_ordinal: 65
    }
  });

  const record = applyRolloutObject(state, {
    timestamp: "2026-10-01T19:56:28.367Z",
    ordinal: 76,
    type: "event_msg",
    payload: {
      type: "task_complete",
      turn_id: "child-turn"
    }
  }, Date.parse("2026-10-01T19:56:28.395Z"));

  assert.equal(record.event, "turn/completed");
  assert.equal(record.role, "subagent");
  assert.equal(record.threadId, "child-thread");
  assert.equal(record.turnId, "child-turn");
  assert.equal(record.ordinal, 76);
  assert.equal(record.detectionLagMs, 28);
});

test("emits main completion directly", () => {
  const state = createRolloutState();

  applyRolloutObject(state, {
    type: "session_meta",
    ordinal: 0,
    payload: {
      id: "main-thread",
      parent_thread_id: null,
      agent_path: null
    }
  });

  const record = applyRolloutObject(state, {
    timestamp: "2026-10-01T19:56:35.112Z",
    ordinal: 100,
    type: "event_msg",
    payload: {
      type: "task_complete",
      turn_id: "main-turn"
    }
  }, Date.parse("2026-10-01T19:56:35.152Z"));

  assert.equal(record.event, "turn/completed");
  assert.equal(record.role, "main");
  assert.equal(record.threadId, "main-thread");
  assert.equal(record.turnId, "main-turn");
  assert.equal(record.detectionLagMs, 40);
});


test("suppresses stale main events replayed after monitor startup", () => {
  const events = [];
  const logs = [];
  const monitor = new CodexRolloutMonitor({
    sessionsRoot: "unused",
    onEvent: (event, row) => events.push({ event, row }),
    log: (line) => logs.push(line)
  });

  monitor.acceptEventsAfterMs = Date.parse("2026-10-02T04:20:25.000Z");

  monitor.emitRecord({
    event: "turn/completed",
    role: "main",
    threadId: "main-thread",
    parentThreadId: null,
    agentPath: null,
    turnId: "old-turn",
    ordinal: 23,
    eventTimestamp: "2026-10-01T19:41:55.000Z",
    detectionLagMs: 31_000_000
  }, "old-rollout.jsonl");

  assert.equal(events.length, 0);
  assert.ok(logs.some((line) => line.includes("stale rollout event ignored")));
});

test("accepts current events after monitor startup", () => {
  const events = [];
  const monitor = new CodexRolloutMonitor({
    sessionsRoot: "unused",
    onEvent: (event, row) => events.push({ event, row }),
    log: () => {}
  });

  monitor.acceptEventsAfterMs = Date.parse("2026-10-02T04:20:25.000Z");

  monitor.emitRecord({
    event: "turn/completed",
    role: "main",
    threadId: "main-thread",
    parentThreadId: null,
    agentPath: null,
    turnId: "current-turn",
    ordinal: 60,
    eventTimestamp: "2026-10-02T04:20:30.000Z",
    detectionLagMs: 40
  }, "current-rollout.jsonl");

  assert.equal(events.length, 1);
  assert.equal(events[0].row.completionTurnId, "current-turn");
});

test("suppresses the same rollout event if a file is replayed", () => {
  const events = [];
  const logs = [];
  const monitor = new CodexRolloutMonitor({
    sessionsRoot: "unused",
    onEvent: (event, row) => events.push({ event, row }),
    log: (line) => logs.push(line)
  });

  monitor.acceptEventsAfterMs = Date.parse("2026-10-02T04:20:00.000Z");

  const record = {
    event: "turn/completed",
    role: "main",
    threadId: "main-thread",
    parentThreadId: null,
    agentPath: null,
    turnId: "same-turn",
    ordinal: 60,
    eventTimestamp: "2026-10-02T04:20:30.000Z",
    detectionLagMs: 40
  };

  monitor.emitRecord(record, "first.jsonl");
  monitor.emitRecord(record, "replayed.jsonl");

  assert.equal(events.length, 1);
  assert.ok(logs.some((line) => line.includes("replayed rollout event ignored")));
});
