const InMemoryCache = require('./in-memory-cache');
const RedisCache = require('./redis-cache');
const settings = require('../../settings');

class Cache {

  constructor() {
    if (settings.redisUrl) {
      this._cache = new RedisCache(settings.redisUrl);
    } else {
      this._cache = new InMemoryCache();
    }
  }

  get(key) {
    return this._cache.get(key);
  }

  set(key, object) {
    return this._cache.set(key, object);
  }

  del(key) {
    return this._cache.del(key);
  }

  flushAll() {
    return this._cache.flushAll();
  }

}

module.exports = new Cache();
