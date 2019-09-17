const redis = require('redis');
const Redlock = require('redlock');
const logger = require('../logger');
const { promisify } = require('util');

const REDIS_CLIENT_OPTIONS = {
  // To avoid a "thundering herd" effect on the Redis server when it comes back
  // up after a crash or connection loss, which can cause Redis to use more
  // memory (for client buffers) than the OS allows and get killed, causing
  // more Redis queries to get backed up, do not store a backlog of Redis
  // queries. Errors will be reported immediately if the Redis server is not
  // available.
  enable_offline_queue: false,
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
