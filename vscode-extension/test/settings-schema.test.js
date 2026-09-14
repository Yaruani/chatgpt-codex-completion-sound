"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

test("ships native settings schema", () => {
  const pkg = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "package.json"),
      "utf8"
    )
  );

  const properties = pkg.contributes.configuration.properties;

  assert.equal(
    properties["codexCompletionSound.enabled"].default,
    true
  );

  assert.deepEqual(
    properties["codexCompletionSound.sound"].enum,
    [
      "chime", "bell", "double", "soft",
      "microwave", "handbell", "game"
    ]
  );

  const volume = properties["codexCompletionSound.volumePercent"];

  assert.equal(volume.minimum, 0);
  assert.equal(volume.maximum, 100);
  assert.equal(volume.multipleOf, 5);
});
