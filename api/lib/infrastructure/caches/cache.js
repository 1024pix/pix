const NodeCache = require('node-cache');
const RedisCache = require('./redis-cache');
const settings = require('../../settings');

class Cache {

  constructor() {
    if (settings.redisUrl) {
      this._cache = new RedisCache(settings.redisUrl);
    } else {
      this._cache = new NodeCache();
    }
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
      this._cache.set(key, object, (error, value) => {
        if (error) return reject(error);
        return resolve(value);
      });
    });
  }

  del(key) {
    return new Promise((resolve, reject) => {
      this._cache.del(key, (error) => {
        if (error) return reject(error);
        return resolve();
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

module.exports = new Cache();
