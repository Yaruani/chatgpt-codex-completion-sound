"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { IdleCompletionGate } = require("../src/idle-gate");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("notifies once after completion remains idle", async () => {
  let count = 0;
  const gate = new IdleCompletionGate(25, () => { count += 1; });

  gate.taskStarted();
  gate.taskComplete();

  await sleep(45);
  assert.equal(count, 1);
  gate.dispose();
});

test("cancels completion notification when next task starts", async () => {
  let count = 0;
  const gate = new IdleCompletionGate(35, () => { count += 1; });

  gate.taskStarted();
  gate.taskComplete();

  await sleep(8);
  gate.taskStarted();

  await sleep(50);
  assert.equal(count, 0);
  gate.dispose();
});

test("auto continuation chain notifies only after final idle", async () => {
  let count = 0;
  const gate = new IdleCompletionGate(30, () => { count += 1; });

  gate.taskStarted();
  gate.taskComplete();
  await sleep(5);
  gate.taskStarted();
  await sleep(5);
  gate.taskComplete();
  await sleep(5);
  gate.taskStarted();
  await sleep(5);
  gate.taskComplete();

  await sleep(50);
  assert.equal(count, 1);
  gate.dispose();
});
