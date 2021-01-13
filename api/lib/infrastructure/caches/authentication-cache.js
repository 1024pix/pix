const Cache = require('./Cache');
const RedisCache = require('./RedisCache');
const InMemoryCache = require('./InMemoryCache');
const settings = require('../../config');

const AUTHENTICATION_KEY = 'authentication_';

class AuthenticationCache extends Cache {

  constructor() {
    super();
    if (settings.caching.redisUrl) {
      this._cache = new RedisCache(settings.caching.redisUrl);
    } else {
      this._cache = new InMemoryCache();
    }
  }

  get(key) {
    return this._cache.get(AUTHENTICATION_KEY + key, () => {});
  }

  set(key, object) {
    return this._cache.set(AUTHENTICATION_KEY + key, object);
  }

  flushAll() {
    return this._cache.flushAll();
  }
}

module.exports = new AuthenticationCache();
