import Redlock from 'redlock';

import { config } from '../../config.js';
import { logger } from '../utils/logger.js';
import { RedisClient } from '../utils/RedisClient.js';
import { applyPatch } from './apply-patch.js';
import { Cache } from './Cache.js';

const REDIS_LOCK_PREFIX = 'locks:';
export const PATCHES_KEY = 'patches';

class RedisCache extends Cache {
  constructor(redis_url) {
    super();
    this._client = RedisCache.createClient(redis_url);
  }

  static createClient(redis_url) {
    return new RedisClient(redis_url, { name: 'redis-cache-query-client', prefix: 'cache:' });
  }

  async get(key, generator) {
    const keyToLock = REDIS_LOCK_PREFIX + key;

    let lock;
    try {
      lock = await this._client.lock(keyToLock, config.caching.redisCacheKeyLockTTL);
      const value = await this._client.get(key);

      if (value) {
        const parsed = JSON.parse(value);
        const patches = await this._client.lrange(`${key}:${PATCHES_KEY}`, 0, -1);
        patches.map((patchJSON) => JSON.parse(patchJSON)).forEach((patch) => applyPatch(parsed, patch));
        return parsed;
      }

      return this._manageValueNotFoundInCache(key, generator);
    } catch (err) {
      if (err instanceof Redlock.LockError) {
        logger.trace({ keyToLock }, 'Could not lock Redis key, waiting');
        await new Promise((resolve) => setTimeout(resolve, config.caching.redisCacheLockedWaitBeforeRetry));
        return this.get(key, generator);
      }
      logger.error({ err }, 'Error while trying to get value in Redis cache');
      throw err;
    } finally {
      if (lock) await lock.unlock();
    }
  }

  async _manageValueNotFoundInCache(key, generator) {
    logger.info({ key }, 'Executing generator for Redis key');
    const value = await generator();
    return this.set(key, value);
  }

  async set(key, object) {
    const objectAsString = JSON.stringify(object);

    logger.info({ key, length: objectAsString.length }, 'Setting Redis key');

    await this._client.set(key, objectAsString);
    await this._client.del(`${key}:${PATCHES_KEY}`);

    return object;
  }

  async patch(key, patch) {
    const patchesKey = `${key}:${PATCHES_KEY}`;

    return this._client.rpush(patchesKey, JSON.stringify(patch));
  }

  flushAll() {
    logger.info('Flushing Redis database');

    return this._client.flushall();
  }

  async quit() {
    await this._client.quit();
  }
}

export { RedisCache };
