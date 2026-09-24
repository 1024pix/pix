import { createClientPool } from '@redis/client';

import { config } from '../../../../config/config.js';
import { child, SCOPES } from '../utils/logger.js';

const logger = child('learningcontent:cache', { event: SCOPES.LEARNING_CONTENT });

class LearningContentRedisCache {
  #pool;

  constructor({ pool = LearningContentRedisCache.createClientPool() } = {}) {
    this.#pool = pool;

    this.#pool?.on('error', (err) => logger.error({ err }, 'redis cache client pool error'));
  }

  async connect() {
    return this.#pool?.connect();
  }

  async close() {
    return this.#pool?.close();
  }

  /**
   * @param {string} key
   */
  async getEntity(key) {
    const value = await this.#pool?.get(key);
    if (value == null) return undefined;
    return JSON.parse(value);
  }

  /**
   * @param {string[]} keys
   */
  async getEntities(keys) {
    const values = await this.#pool?.mGet(keys);
    return values.map((value) => {
      if (value == null) return undefined;
      return JSON.parse(value);
    });
  }

  /**
   * @param {string} key
   */
  async getIds(key) {
    const value = await this.#pool?.get(key);
    if (value == null) return undefined;
    if (value === '') return [];
    return value.split(',');
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  setEntity(key, value) {
    return this.#pool?.set(key, JSON.stringify(value), { condition: 'NX' });
  }

  /**
   * @param {[key: string, entity: any][]} entities
   */
  setEntities(entities) {
    return this.#pool?.mSetNX(entities.map(([key, entity]) => [key, JSON.stringify(entity)]));
  }

  /**
   * @param {string} key
   * @param {string[]} ids
   */
  setIds(key, ids) {
    return this.#pool?.set(key, ids.join(','), { condition: 'NX' });
  }

  clear() {
    return this.#pool?.flushDb();
  }

  static createClientPool() {
    if (!config.redisUrl) return undefined;
    const poolConfig = {};
    if (config.lcms.redisCache.clientPoolMinimum != undefined) {
      poolConfig.minimum = config.lcms.redisCache.clientPoolMinimum;
    }
    if (config.lcms.redisCache.clientPoolMaximum != undefined) {
      poolConfig.maximum = config.lcms.redisCache.clientPoolMaximum;
    }
    return createClientPool({ url: config.redisUrl, database: config.lcms.redisCache.database }, poolConfig);
  }
}

export const learningContentCache = new LearningContentRedisCache();
