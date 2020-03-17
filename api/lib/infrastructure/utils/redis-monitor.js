const redis = require('redis');
const { promisify } = require('util');
const settings = require('../../config');

class RedisMonitor {

  constructor() {
    this._client = redis.createClient(settings.caching.redisUrl);
    this.ping = promisify(this._client.ping).bind(this._client);
  }

  ping() {
    return this._client.ping();
  }
}

module.exports = new RedisMonitor();
