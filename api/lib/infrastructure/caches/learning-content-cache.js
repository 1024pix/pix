import Cache from './Cache';
import DistributedCache from './DistributedCache';
import InMemoryCache from './InMemoryCache';
import LayeredCache from './LayeredCache';
import RedisCache from './RedisCache';
import settings from '../../config';

const LEARNING_CONTENT_CHANNEL = 'Learning content';
const LEARNING_CONTENT_CACHE_KEY = 'LearningContent';

class LearningContentCache extends Cache {
  constructor() {
    super();
    if (settings.caching.redisUrl) {
      this.distributedCache = new DistributedCache(
        new InMemoryCache(),
        settings.caching.redisUrl,
        LEARNING_CONTENT_CHANNEL
      );
      this.redisCache = new RedisCache(settings.caching.redisUrl);

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

export default new LearningContentCache();
