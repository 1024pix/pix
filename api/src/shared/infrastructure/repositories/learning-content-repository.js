import Dataloader from 'dataloader';

import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { LearningContentCache } from '../caches/learning-content-cache.js';
import { Metrics } from '../metrics/metrics.js';
import { child, SCOPES } from '../utils/logger.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

const metrics = {
  read: Metrics.createHistogram({
    name: 'lc_read',
    help: 'Learning content entities read count',
    labelNames: ['table', 'cache'],
  }),
  cacheMiss: Metrics.createHistogram({
    name: 'lc_cachemiss',
    help: 'Learning content cache miss count',
    labelNames: ['table', 'cache'],
  }),
  cachePenalty: Metrics.createHistogram({
    name: 'lc_cachepenalty',
    help: 'Learning content cache penalty',
    labelNames: ['table', 'cache'],
  }),
};

/**
 * @typedef {(knex: import('knex').QueryBuilder) => Promise<string[]|number[]>} QueryBuilderCallback
 */

/**
 * Datasource for learning content repositories.
 * This datasource uses a {@link Dataloader} to load and cache entities.
 */
export class LearningContentRepository {
  #tableName;
  #idType;
  #dataloader;
  #findCache;
  #findCacheMiss;
  #metrics;

  /**
   * @param {{
   *   tableName: string
   *   idType?: 'text' | 'integer' | 'uuid'
   * }} config
   */
  constructor({ tableName, idType = 'text' }) {
    this.#tableName = tableName;
    this.#idType = idType;

    this.#dataloader = new Dataloader((ids) => this.#batchLoad(ids), {
      cacheMap: new LearningContentCache({ name: `${tableName}:entities` }),
    });

    this.#findCache = new LearningContentCache({ name: `${tableName}:results` });

    this.#findCacheMiss = new Map();

    const table = this.#tableName.split('.').at(-1);
    this.#metrics = {
      load: metrics.read.labels({ table, cache: 'entities' }),
      find: metrics.read.labels({ table, cache: 'results' }),
      loadCacheMiss: metrics.cacheMiss.labels({ table, cache: 'entities' }),
      findCacheMiss: metrics.cacheMiss.labels({ table, cache: 'results' }),
      loadCachePenalty: metrics.cachePenalty.labels({ table, cache: 'entities' }),
      findCachePenalty: metrics.cachePenalty.labels({ table, cache: 'results' }),
    };
  }

  /**
   * Finds several entities using a request and caches results.
   * The request is built using a knex query builder given to {@link callback}.
   * {@link cacheKey} must vary according to params given to the query builder.
   * @param {string} cacheKey
   * @param {QueryBuilderCallback} callback
   * @returns {Promise<object[]>}
   */
  async find(cacheKey, callback) {
    const ids = await this.#findIds(cacheKey, callback);

    return this.#loadMany(ids);
  }

  /**
   * Finds several entity ids using a request and caches results.
   * @param {string} cacheKey
   * @param {QueryBuilderCallback} callback
   * @returns {Promise<string[]|number[]>}
   */
  async #findIds(cacheKey, callback) {
    let ids;
    let stopFindCachePenaltyTimer;

    try {
      ids = this.#findCache.get(cacheKey);
      if (ids) return ids;

      let idsPromise = this.#findCacheMiss.get(cacheKey);
      if (idsPromise) {
        stopFindCachePenaltyTimer = this.#metrics.findCachePenalty.startTimer();
        ids = await idsPromise.finally(() => {
          stopFindCachePenaltyTimer();
        });

        this.#metrics.findCacheMiss.observe(ids.length);

        return ids;
      }

      stopFindCachePenaltyTimer = this.#metrics.findCachePenalty.startTimer();
      idsPromise = this.#loadIds(callback, cacheKey).finally(() => {
        this.#findCacheMiss.delete(cacheKey);
        stopFindCachePenaltyTimer();
      });
      this.#findCacheMiss.set(cacheKey, idsPromise);

      ids = await idsPromise;

      this.#metrics.findCacheMiss.observe(ids.length);

      return ids;
    } finally {
      if (ids) this.#metrics.find.observe(ids.length);
    }
  }

  /**
   * Loads one entity by ID.
   * @param {string|number} id
   * @returns {Promise<object|null>}
   */
  async load(id) {
    this.#metrics.load.observe(1);
    return this.#dataloader.load(id);
  }

  /**
   * Gets several entities by ID.
   * Deduplicates ids and removes nullish ids before loading.
   * @param {string[]|number[]} ids
   * @returns {Promise<(object|null)[]>}
   */
  async getMany(ids) {
    const idsToLoad = new Set(ids);
    idsToLoad.delete(undefined);
    idsToLoad.delete(null);

    const dtos = await this.loadMany(Array.from(idsToLoad));

    return dtos;
  }

  /**
   * Loads several entities by ID.
   * @param {string[]|number[]} ids
   * @returns {Promise<(object|null)[]>}
   */
  async loadMany(ids) {
    return this.#loadMany(ids);
  }

  /**
   * Loads several entities by ID.
   * @param {string[]|number[]} ids
   * @param {string=} cacheKey for debug purposes only
   * @returns {Promise<(object|null)[]>}
   */
  async #loadMany(ids, cacheKey) {
    this.#metrics.load.observe(ids.length);

    const dtos = await this.#dataloader.loadMany(ids);

    if (dtos[0] instanceof Error) {
      const err = dtos[0];
      logger.error({ tableName: this.#tableName, cacheKey, err }, 'error while loading entities by ids');
      throw new Error('error while loading entities by ids', { cause: err });
    }

    return dtos;
  }

  /**
   * Loads entity ids from database using a request and writes result to cache.
   * @param {string} cacheKey
   * @param {QueryBuilderCallback} callback
   * @returns {Promise<string[]|number[]>}
   */
  async #loadIds(callback, cacheKey) {
    const knexConn = DomainTransaction.getConnection();
    const ids = await callback(knexConn.pluck(`${this.#tableName}.id`).from(this.#tableName));

    logger.debug({ tableName: this.#tableName, cacheKey }, 'caching find result');
    this.#findCache.set(cacheKey, ids);

    return ids;
  }

  /**
   * Loads a batch of entities from database by ID.
   * Entities are returned in the same order as {@link ids}.
   * If an ID is not found, it is null in results.
   * @param {string[]|number[]} ids
   * @returns {Promise<(object|null)[]>}
   */
  async #batchLoad(ids) {
    logger.debug({ tableName: this.#tableName, count: ids.length }, 'loading from PG');

    this.#metrics.loadCacheMiss.observe(ids.length);
    const stopLoadCachePenaltyTimer = this.#metrics.loadCachePenalty.startTimer();

    try {
      const knexConn = DomainTransaction.getConnection();
      const dtos = await knexConn
        .select(`${this.#tableName}.*`)
        .from(knexConn.raw(`unnest(?::${this.#idType}[]) with ordinality as ids(id, idx)`, [ids])) // eslint-disable-line knex/avoid-injections
        .leftJoin(this.#tableName, `${this.#tableName}.id`, 'ids.id')
        .orderBy('ids.idx');
      return dtos.map((dto) => (dto.id ? dto : null));
    } finally {
      stopLoadCachePenaltyTimer();
    }
  }

  /**
   * Clears repository’s cache.
   * If {@link id} is undefined, all cache is cleared.
   * If {@link id} is given, cache is partially cleared.
   * @param {string|number|undefined} id
   */
  clearCache(id) {
    logger.debug({ tableName: this.#tableName, id }, 'triggering cache clear');

    if (id) {
      this.#dataloader.clear(id);
    } else {
      this.#dataloader.clearAll();
    }
    this.#findCache.clear();
  }
}
