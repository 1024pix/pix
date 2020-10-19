const NodeCache = require('node-cache');
const Cache = require('./Cache');

class InMemoryCache extends Cache {

  constructor() {
    super();
    this._cache = new NodeCache({ useClones: false });
    this._queue = Promise.resolve();
  }

  async get(key, generator) {
    return this._syncGet(key, () => this._chainPromise(() => {
      return this._syncGet(key, () => this._generateAndSet(key, generator));
    }));
  }

  async set(key, value) {
    return this._chainPromise(() => {
      this._cache.set(key, value);
      return value;
    });
  }

  async flushAll() {
    return this._chainPromise(() => {
      this._cache.flushAll();
    });
  }

  async _generateAndSet(key, generator) {
    const generatedValue = await generator();
    this._cache.set(key, generatedValue);
    return generatedValue;
  }

  async _chainPromise(fn) {
    const queuedPromise = this._queue.then(fn);
    this._queue = queuedPromise.catch(() => {});
    return queuedPromise;
  }

  _syncGet(key, generator) {
    const value = this._cache.get(key);
    if (value) return value;
    return generator();
  }
}

module.exports = InMemoryCache;
