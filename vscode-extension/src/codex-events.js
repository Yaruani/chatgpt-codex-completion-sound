"use strict";

function isVscodeSessionMeta(obj) {
  if (!obj || obj.type !== "session_meta") return false;
  const payload = obj.payload || {};
  return (
    payload.originator === "codex_vscode" ||
    payload.source === "vscode"
  );
}

function isTaskComplete(obj) {
  return Boolean(
    obj &&
    obj.type === "event_msg" &&
    obj.payload &&
    obj.payload.type === "task_complete"
  );
}

module.exports = {
  isVscodeSessionMeta,
  isTaskComplete
};
