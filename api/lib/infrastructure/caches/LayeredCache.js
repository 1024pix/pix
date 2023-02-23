const Cache = require('./Cache.js');

class LayeredCache extends Cache {
  constructor(firstLevelCache, secondLevelCache) {
    super();
    this._firstLevelCache = firstLevelCache;
    this._secondLevelCache = secondLevelCache;
  }

  get(key, generator) {
    return this._firstLevelCache.get(key, () => {
      return this._secondLevelCache.get(key, generator);
    });
  }

  async set(key, object) {
    const cachedObject = await this._secondLevelCache.set(key, object);
    await this._firstLevelCache.flushAll();
    return cachedObject;
  }

  async flushAll() {
    await this._firstLevelCache.flushAll();
    return this._secondLevelCache.flushAll();
  }

  quit() {
    return Promise.all([this._firstLevelCache.quit(), this._secondLevelCache.quit()]);
  }
}

module.exports = LayeredCache;
