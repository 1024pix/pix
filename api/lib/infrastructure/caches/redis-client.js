const redis = require('redis');
const Redlock = require('redlock');
const logger = require('../logger');
const { promisify } = require('util');

const REDIS_CLIENT_OPTIONS = {
  // All commands that were unfulfilled while the connection is lost will be
  // retried after the connection has been reestablished.
  // Note that this is safe because all of our commands are idempotent.
  retry_unfulfilled_commands: true
};

module.exports = class RedisClient {

  constructor(redis_url) {
    this._client = redis.createClient(redis_url, REDIS_CLIENT_OPTIONS);
    this._client.on('error', (err) => {
      logger.warn({ err }, 'Redis connection error');
    });
    this._clientWithLock = new Redlock(
      [this._client],
      // As said in the doc, setting retryCount to 0 and treating a failure as the resource being "locked"
      // is a good practice
      { retryCount: 0 }
    );

    this.get = promisify(this._client.get).bind(this._client);
    this.set = promisify(this._client.set).bind(this._client);
    this.del = promisify(this._client.del).bind(this._client);
    this.flushall = promisify(this._client.flushall).bind(this._client);
    this.lockDisposer = this._clientWithLock.disposer.bind(this._clientWithLock);
  }

};
