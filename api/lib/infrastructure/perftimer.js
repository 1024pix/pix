const { performance } = require('perf_hooks');

class PerfTimer {

  constructor() {
    this._start = {};
    this._time = {};
  }

  start(key) {
    this._start[key] = performance.now();
  }

  stop(key) {
    const time = performance.now() - this._start[key];
    if (this._time[key] === undefined) {
      this._time[key] = 0;
    }
    this._time[key] += time;
  }

  log() {
    console.log(this._time);
  }

  reset() {
    this._time = {};
  }
}

module.exports = PerfTimer;

