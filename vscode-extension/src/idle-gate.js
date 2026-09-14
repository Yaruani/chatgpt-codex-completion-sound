"use strict";

class IdleCompletionGate {
  constructor(delayMs, onIdle) {
    this.delayMs = delayMs;
    this.onIdle = onIdle;
    this.timer = null;
    this.running = false;
    this.sequence = 0;
  }

  taskStarted() {
    this.running = true;
    this.sequence += 1;
    this.cancelPending();
  }

  taskComplete() {
    this.running = false;
    this.sequence += 1;
    const sequenceAtComplete = this.sequence;

    this.cancelPending();

    this.timer = setTimeout(() => {
      this.timer = null;

      if (this.running) return;
      if (this.sequence !== sequenceAtComplete) return;

      this.onIdle();
    }, this.delayMs);
  }

  cancelPending() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  dispose() {
    this.cancelPending();
  }
}

module.exports = {
  IdleCompletionGate
};
