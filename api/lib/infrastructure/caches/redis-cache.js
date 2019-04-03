const { using } = require('bluebird');
const logger = require('../logger');
const settings = require('../../settings');
const RedisClient = require('./redis-client');
const Redlock = require('redlock');

const REDIS_LOCK_PREFIX = 'locks:';

class RedisCache {

  constructor(redis_url) {
    this._client = RedisCache.createClient(redis_url);
  }

  static createClient(redis_url) {
    return new RedisClient(redis_url);
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
      const locker = this._client.lockDisposer(keyToLock, settings.redisCacheKeyLockTTL, unlockErrorHandler);
      const value = await using(locker, retrieveAndSetValue);
      return value;
    } catch (err) {
      if (err instanceof Redlock.LockError) {
        logger.trace({ keyToLock }, 'Could not lock Redis key, waiting');
        await new Promise((resolve) => setTimeout(resolve, settings.redisCacheLockedWaitBeforeRetry));
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

  del(key) {
    logger.info({ key }, 'Removing Redis key');

    return this._client.del(key);
  }

  flushAll() {
    logger.info('Flusing Redis database');

    return this._client.flushall();
  }
}

module.exports = RedisCache;
