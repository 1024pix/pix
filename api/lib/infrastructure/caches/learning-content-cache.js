import { DistributedCache } from './DistributedCache.js';
import { InMemoryCache } from './InMemoryCache.js';
import { LayeredCache } from './LayeredCache.js';
import { RedisCache } from './RedisCache.js';
import { config } from '../../config.js';

const LEARNING_CONTENT_CHANNEL = 'Learning content';
const LEARNING_CONTENT_CACHE_KEY = 'LearningContent';

class LearningContentCache {
  constructor() {
    if (config.caching.redisUrl) {
      const distributedCache = new DistributedCache(
        new InMemoryCache(),
        config.caching.redisUrl,
        LEARNING_CONTENT_CHANNEL,
      );
      const redisCache = new RedisCache(config.caching.redisUrl);

      this._underlyingCache = new LayeredCache(distributedCache, redisCache);
    } else {
      this._underlyingCache = new InMemoryCache();
    }
  }

  get(generator) {
    return this._underlyingCache.get(LEARNING_CONTENT_CACHE_KEY, generator);
  }

  set(object) {
    return this._underlyingCache.set(LEARNING_CONTENT_CACHE_KEY, object);
  }

  flushAll() {
    return this._underlyingCache.flushAll();
  }

  quit() {
    return this._underlyingCache.quit();
  }
}

export const learningContentCache = new LearningContentCache();
