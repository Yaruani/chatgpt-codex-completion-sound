"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { PlaybackQueue } = require("../src/playback-queue");

test("serializes simultaneous playback requests", async () => {
  const events = [];

  const queue = new PlaybackQueue(async (name) => {
    events.push(`start:${name}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
    events.push(`end:${name}`);
    return name;
  });

  const results = await Promise.all([
    queue.enqueue("first"),
    queue.enqueue("second"),
    queue.enqueue("third")
  ]);

  assert.deepEqual(results, ["first", "second", "third"]);
  assert.deepEqual(events, [
    "start:first", "end:first",
    "start:second", "end:second",
    "start:third", "end:third"
  ]);
});

test("queue continues after a failed playback", async () => {
  const events = [];

  const queue = new PlaybackQueue(async (name) => {
    events.push(name);
    if (name === "bad") throw new Error("expected");
    return name;
  });

  await assert.rejects(queue.enqueue("bad"), /expected/);
  assert.equal(await queue.enqueue("good"), "good");
  assert.deepEqual(events, ["bad", "good"]);
});
