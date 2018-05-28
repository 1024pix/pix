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
    const promisifiedSet = util.promisify(this._cache.set);
    return promisifiedSet(key, object);
  }

  del(key) {
    const promisifiedDel = util.promisify(this._cache.del);
    return promisifiedDel(key);
  }

  flushAll() {
    const promisifiedFlushAll = util.promisify(this._cache.flushAll);
    return promisifiedFlushAll();
  }

}

module.exports = new Cache();
