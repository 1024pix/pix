import { createClientPool } from '@redis/client';

import { config } from '../../../../config/config.js';
import { child, SCOPES } from '../utils/logger.js';

const logger = child('learningcontent:cache', { event: SCOPES.LEARNING_CONTENT });

export class LearningContentRedisCache {
  #pool;

  constructor({ pool = LearningContentRedisCache.createClientPool() } = {}) {
    this.#pool = pool;

    this.#pool.on('error', (err) => logger.error({ err }, 'redis cache client pool error'));
  }

  async connect() {
    return this.#pool.connect();
  }

  async close() {
    return this.#pool.close();
  }

  /**
   * @param {string} key
   */
  async get(key) {
    const value = await this.#pool.get(key);
    if (value == null) return undefined;
    return JSON.parse(value);
  }

  /**
   * @param {string[]} keys
   */
  async getMany(keys) {
    const values = await this.#pool.mGet(keys);
    return values.map((value) => {
      if (value == null) return undefined;
      return JSON.parse(value);
    });
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    return this.#pool.set(key, JSON.stringify(value), { condition: 'NX' });
  }

  /**
   * @param {[key: string, value: any][]} values
   */
  setMany(values) {
    this.#pool.mSetNX(values.map(([key, value]) => [key, JSON.stringify(value)]));
  }

  clear() {
    return this.#pool.flushDb();
  }

  static createClientPool() {
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
