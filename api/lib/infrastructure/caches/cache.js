const util = require('util');
const NodeCache = require('node-cache');
const RedisCache = require('./redis-cache');
const settings = require('../../settings');

// TODO Discuter des différences entre NodeCache et RedisCache
// Redis sur les ReviewApps ?

class Cache {

  constructor() {
    if (settings.redisUrl) {
      this._cache = new RedisCache(settings.redisUrl);
    } else {
      this._cache = new NodeCache();
    }
  }

  get(key) {
    const promisifiedGet = util.promisify(this._cache.get);
    return promisifiedGet(key);
  }

  set(key, object) {
    this._cache.set(key, object);
  }

  del(key) {
    this._cache.del(key);
  }

  flushAll() {
    this._cache.flushAll();
  }

}

module.exports = new Cache();
