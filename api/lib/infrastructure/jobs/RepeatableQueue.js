const Queue = require('bull');
const logger = require('../logger');

class RepeatableQueue {
  constructor({ job, name, redisUrl, version }) {
    this._job = job;
    this._name = name;
    this._redisUrl = redisUrl;
    this._queue = null;
    this._options = {};
    this._currentVersion = version;
  }

  get isEnabled() {
    throw new Error('Method #init() must be overridden');
  }

  async init() {
    if (this.constructor.name === 'RepeatableQueue') {
      throw new Error('Method #init() must be overridden');
    }
    this._queue = new Queue(this._name, this._redisUrl);
    this._queue.on('error', (err) => logger.error(`Creating ${this._name} queue failed : ${err}`));

    await this._clearOldJobs();

    if (this.isEnabled) {
      await this._setupJob();
    }

  }

  async _clearOldJobs() {
    const repeatableJobs = await this._queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (!this.isEnabled || !this._isJobOfCurrentVersion(job)) {
        await this._queue.removeRepeatableByKey(job.key);
      }
    }
    await this._queue.clean(0, 'delayed');
  }

  async _setupJob() {
    this._queue.process(this._job);
    await this._queue.add({ version: this._currentVersion }, this._options);
  }

  _isJobOfCurrentVersion(job) {
    return job.id !== this._currentVersion;
  }
}

module.exports = RepeatableQueue;
