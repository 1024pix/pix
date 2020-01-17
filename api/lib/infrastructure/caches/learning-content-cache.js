const Cache = require('./Cache');
const DistributedCache = require('./DistributedCache');
const InMemoryCache = require('./InMemoryCache');
const LayeredCache = require('./LayeredCache');
const RedisCache = require('./RedisCache');
const settings = require('../../config');

const LEARNING_CONTENT_CHANNEL = 'Learning content';

class LearningContentCache extends Cache {

  constructor() {
    super();
    if (settings.caching.redisUrl) {
      const distributedCache = new DistributedCache(new InMemoryCache(), settings.caching.redisUrl, LEARNING_CONTENT_CHANNEL);
      const redisCache = new RedisCache(settings.caching.redisUrl);

      this._underlyingCache = new LayeredCache(distributedCache, redisCache);
    } else {
      this._underlyingCache = new InMemoryCache();
    }
  }

  get(key, generator) {
    return this._underlyingCache.get(key, generator);
  }

  set(key, object) {
    return this._underlyingCache.set(key, object);
  }

  flushAll() {
    return this._underlyingCache.flushAll();
  }
}

module.exports = new LearningContentCache();
