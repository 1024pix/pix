const settings = require('../../config');
const RedisClient = require('../caches/RedisClient');

class RedisMonitor {

  constructor() {
    if (settings.caching.redisUrl) {
      this._client = new RedisClient(settings.caching.redisUrl, 'redis-monitor');
    }
  }

  async ping() {
    if (!this._client) {
      return false;
    }
    return this._client.ping();
  }
}

module.exports = new RedisMonitor();
