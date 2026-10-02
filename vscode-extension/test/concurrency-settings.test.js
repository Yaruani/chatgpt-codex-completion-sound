"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

test("completion sound settings are application-wide", () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  );

  const properties = pkg.contributes.configuration.properties;

  for (const key of [
    "codexCompletionSound.enabled",
    "codexCompletionSound.sound",
    "codexCompletionSound.volumePercent",
    "codexCompletionSound.subagentEnabled",
    "codexCompletionSound.subagentSound"
  ]) {
    assert.equal(properties[key].scope, "application", key);
  }
});

test("main completion dedupe is per thread and turn instead of per process", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "src", "extension.js"),
    "utf8"
  );

  assert.match(
    source,
    /row\?\.completionThreadId/
  );
  assert.match(
    source,
    /row\?\.completionTurnId/
  );
  assert.doesNotMatch(source, /main:\$\{processKey\}/);
});

test("automatic settings preview is limited to the monitor owner", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "src", "extension.js"),
    "utf8"
  );

  assert.match(
    source,
    /const shouldPreview\s*=\s*\n\s*enabled && isMonitorOwner\(\)/
  );
});
