import { config } from '../../config.js';
import { RedisClient } from './RedisClient.js';

class RedisMonitor {
  constructor() {
    if (config.caching.redisUrl) {
      this._client = new RedisClient(config.caching.redisUrl, { name: 'redis-monitor' });
    }
  }

  async ping() {
    if (!this._client) {
      return false;
    }
    return this._client.ping();
  }

  async quit() {
    await this._client.quit();
  }
}

const redisMonitor = new RedisMonitor();

export { redisMonitor };
