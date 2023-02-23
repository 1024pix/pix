const { using } = require('bluebird');
const Redlock = require('redlock');
const Cache = require('./Cache.js');
const RedisClient = require('../utils/RedisClient.js');
const logger = require('../logger.js');
const settings = require('../../config.js');

const REDIS_LOCK_PREFIX = 'locks:';

class RedisCache extends Cache {
  constructor(redis_url) {
    super();
    this._client = RedisCache.createClient(redis_url);
  }

  static createClient(redis_url) {
    return new RedisClient(redis_url, { name: 'redis-cache-query-client', prefix: 'cache:' });
  }

  async get(key, generator) {
    const value = await this._client.get(key);

    if (value) return JSON.parse(value);

    return this._manageValueNotFoundInCache(key, generator);
  }

  async _manageValueNotFoundInCache(key, generator) {
    const keyToLock = REDIS_LOCK_PREFIX + key;
    const retrieveAndSetValue = async () => {
      logger.info({ key }, 'Executing generator for Redis key');
      const value = await generator();
      return this.set(key, value);
    };
    const unlockErrorHandler = (err) => logger.error({ key }, 'Error while trying to unlock Redis key', err);

    try {
      const locker = this._client.lockDisposer(keyToLock, settings.caching.redisCacheKeyLockTTL, unlockErrorHandler);
      const value = await using(locker, retrieveAndSetValue);
      return value;
    } catch (err) {
      if (err instanceof Redlock.LockError) {
        logger.trace({ keyToLock }, 'Could not lock Redis key, waiting');
        await new Promise((resolve) => setTimeout(resolve, settings.caching.redisCacheLockedWaitBeforeRetry));
        return this.get(key, generator);
      }
      logger.error({ err }, 'Error while trying to update value in Redis cache');
      throw err;
    }
  }

  async set(key, object) {
    const objectAsString = JSON.stringify(object);

    logger.info({ key, length: objectAsString.length }, 'Setting Redis key');

    await this._client.set(key, objectAsString);

    return object;
  }

  flushAll() {
    logger.info('Flushing Redis database');

    return this._client.flushall();
  }

  async quit() {
    await this._client.quit();
  }
}

module.exports = RedisCache;
