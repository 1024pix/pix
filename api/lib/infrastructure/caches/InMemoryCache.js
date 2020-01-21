const NodeCache = require('node-cache');
const Cache = require('./Cache');

class InMemoryCache extends Cache {

  constructor() {
    super();
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
    return this._cache.flushAll();
  }

}

module.exports = InMemoryCache;
