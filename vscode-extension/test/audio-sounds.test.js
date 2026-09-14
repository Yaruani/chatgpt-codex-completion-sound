"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { VALID_SOUNDS } = require("../src/audio");

test("ships all selectable sound files", () => {
  const expected = [
    "chime", "bell", "double", "soft",
    "microwave", "handbell", "game"
  ];
  assert.deepEqual(VALID_SOUNDS, expected);

  for (const sound of expected) {
    const file = path.join(__dirname, "..", "sounds", `${sound}.wav`);
    assert.equal(fs.existsSync(file), true, `missing ${sound}.wav`);
  }
});
