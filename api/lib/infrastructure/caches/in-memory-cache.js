const NodeCache = require('node-cache');

class InMemoryCache {

  constructor() {
    this._cache = new NodeCache();
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this._cache.get(key, (error, value) => {
        if (error) return reject(error);
        return resolve(value);
      });
    });
  }

  set(key, object) {
    return new Promise((resolve, reject) => {
      this._cache.set(key, object, (error) => {
        if (error) return reject(error);
        return resolve(object);
      });
    });
  }

  del(key) {
    return new Promise((resolve, reject) => {
      this._cache.del(key, (error, numberOfDeletedKeys) => {
        if (error) return reject(error);
        return resolve(numberOfDeletedKeys);
      });
    });
  }

  flushAll() {
    return new Promise((resolve, reject) => {
      this._cache.flushAll((error) => {
        if (error) return reject(error);
        return resolve();
      });
    });
  }
}

module.exports = InMemoryCache;
