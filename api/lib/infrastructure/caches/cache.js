const InMemoryCache = require('./in-memory-cache');
const RedisCache = require('./redis-cache');
const settings = require('../../config');

class Cache {

  constructor() {
    if (settings.caching.redisUrl) {
      this._cache = new RedisCache(settings.caching.redisUrl);
    } else {
      this._cache = new InMemoryCache();
    }
  }

  get(key, generator) {
    return this._cache.get(key, generator);
  }

  set(key, object) {
    return this._cache.set(key, object);
  }

  flushAll() {
    return this._cache.flushAll();
  }

}

module.exports = new Cache();
