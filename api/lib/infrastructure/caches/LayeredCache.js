class LayeredCache {

  constructor(level1Cache, level2Cache) {
    this._level1Cache = level1Cache;
    this._level2Cache = level2Cache;
  }

  get(key, generator) {
    const level2CacheGenerator = () => {
      return this._level2Cache.get(key, generator);
    };
    return this._level1Cache.get(key, level2CacheGenerator);
  }

  async set(key, object) {
    await this._level1Cache.flushAll();
    return await this._level2Cache.set(key, object);
  }

  async flushAll() {
    await this._level1Cache.flushAll();
    return this._level2Cache.flushAll();
  }

}

module.exports = LayeredCache;
