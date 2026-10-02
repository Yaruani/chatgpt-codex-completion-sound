"use strict";

class PlaybackQueue {
  constructor(play) {
    this.play = play;
    this.tail = Promise.resolve();
  }

  enqueue(...args) {
    const run = () => this.play(...args);
    const result = this.tail.then(run, run);
    this.tail = result.catch(() => {});
    return result;
  }
}

module.exports = {
  PlaybackQueue
};
