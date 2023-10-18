import { Cache } from './Cache.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';

class LayeredCache extends Cache {
  constructor(firstLevelCache, secondLevelCache) {
    super();
    this._firstLevelCache = firstLevelCache;
    this._secondLevelCache = secondLevelCache;
  }

  get(key, generator) {
    return this._firstLevelCache.get(key, () => {
      logger.info(
        { event: 'cache-event', key },
        'Cannot found the key from the firstLevelCache. Fetching on the second one.',
      );
      return this._secondLevelCache.get(key, generator);
    });
  }

  async set(key, object) {
    const cachedObject = await this._secondLevelCache.set(key, object);
    await this._firstLevelCache.flushAll();
    return cachedObject;
  }

  async patch(key, patch) {
    await this._firstLevelCache.patch(key, patch);
    return this._secondLevelCache.patch(key, patch);
  }

  async flushAll() {
    await this._firstLevelCache.flushAll();
    return this._secondLevelCache.flushAll();
  }

  quit() {
    return Promise.all([this._firstLevelCache.quit(), this._secondLevelCache.quit()]);
  }
}

export { LayeredCache };
