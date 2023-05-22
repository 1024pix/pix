import { Cache } from './Cache.js';
import { DistributedCache } from './DistributedCache.js';
import { InMemoryCache } from './InMemoryCache.js';
import { LayeredCache } from './LayeredCache.js';
import { RedisCache } from './RedisCache.js';
import { config } from '../../config.js';

const LEARNING_CONTENT_CHANNEL = 'Learning content';
const LEARNING_CONTENT_CACHE_KEY = 'LearningContent';

class LearningContentCache extends Cache {
  constructor() {
    super();
    if (config.caching.redisUrl) {
      this.distributedCache = new DistributedCache(
        new InMemoryCache(),
        config.caching.redisUrl,
        LEARNING_CONTENT_CHANNEL
      );
      this.redisCache = new RedisCache(config.caching.redisUrl);

      this._underlyingCache = new LayeredCache(this.distributedCache, this.redisCache);
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
    return Promise.all([this._underlyingCache.quit(), this.redisCache.quit(), this.distributedCache.quit()]);
  }
}

const learningContentCache = new LearningContentCache();

export { learningContentCache };
