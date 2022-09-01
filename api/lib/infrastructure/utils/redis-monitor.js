const settings = require('../../config');
const RedisClient = require('./RedisClient');

class RedisMonitor {
  constructor() {
    if (settings.caching.redisUrl) {
      this._client = new RedisClient(settings.caching.redisUrl, { name: 'redis-monitor' });
    }
  }

  async ping() {
    if (!this._client) {
      return false;
    }
    return this._client.ping();
  }

  quit() {
    this._client.quit();
  }
}

module.exports = new RedisMonitor();
