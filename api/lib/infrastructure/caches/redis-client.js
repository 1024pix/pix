const redis = require('redis');
const Redlock = require('redlock');
const { promisify } = require('util');

module.exports = class RedisClient {

  constructor(redis_url) {
    this._client = redis.createClient(redis_url);
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
