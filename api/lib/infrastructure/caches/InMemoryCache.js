const NodeCache = require('node-cache');

class InMemoryCache {

  constructor() {
    this._cache = new NodeCache({ useClones: false });
  }

  async get(key, generator) {
    const value = this._cache.get(key);
    if (value) return value;
    return this.set(key, await generator());
  }

  async set(key, value) {
    this._cache.set(key, value);
    return value;
  }

  async flushAll() {
    this._cache.flushAll();
  }

}

module.exports = InMemoryCache;
