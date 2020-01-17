const Cache = require('./Cache');

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
    await this._firstLevelCache.flushAll();
    return this._secondLevelCache.set(key, object);
  }

  async flushAll() {
    await this._firstLevelCache.flushAll();
    return this._secondLevelCache.flushAll();
  }

}

module.exports = LayeredCache;
