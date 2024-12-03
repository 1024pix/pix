import Dataloader from 'dataloader';

import { knex } from '../../../../db/knex-database-connection.js';
import { LearningContentCache } from '../caches/learning-content-cache.js';
import { child } from '../utils/logger.js';

const logger = child('learningcontent:repository', { event: 'learningcontent' });

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

  /**
   * @param {{
   *   tableName: string
   *   idType?: 'text' | 'integer'
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
    let dtos = this.#findCache.get(cacheKey);
    if (dtos) return dtos;

    dtos = this.#findCacheMiss.get(cacheKey);
    if (dtos) return dtos;

    dtos = this.#loadDtos(callback, cacheKey).finally(() => {
      this.#findCacheMiss.delete(cacheKey);
    });
    this.#findCacheMiss.set(cacheKey, dtos);

    return dtos;
  }

  /**
   * Loads one entity by ID.
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async load(id) {
    if (!id) return null;
    return this.#dataloader.load(id);
  }

  /**
   * Loads several entities by ID.
   * @param {string[]|number[]} ids
   * @returns {Promise<object[]>}
   */
  async loadMany(ids) {
    const notNullIds = ids.filter((id) => id);
    return this.#dataloader.loadMany(notNullIds);
  }

  /**
   * Loads entities from database using a request and writes result to cache.
   * @param {string} cacheKey
   * @param {QueryBuilderCallback} callback
   * @returns {Promise<object[]>}
   */
  async #loadDtos(callback, cacheKey) {
    const ids = await callback(knex.pluck(`${this.#tableName}.id`).from(this.#tableName));
    const dtos = await this.#dataloader.loadMany(ids);

    logger.debug({ tableName: this.#tableName, cacheKey }, 'caching find result');
    this.#findCache.set(cacheKey, dtos);

    return dtos;
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
    const dtos = await knex
      .select(`${this.#tableName}.*`)
      .from(knex.raw(`unnest(?::${this.#idType}[]) with ordinality as ids(id, idx)`, [ids])) // eslint-disable-line knex/avoid-injections
      .leftJoin(this.#tableName, `${this.#tableName}.id`, 'ids.id')
      .orderBy('ids.idx');
    return dtos.map((dto) => (dto.id ? dto : null));
  }

  /**
   * Clears repository’s cache.
   * If {@link id} is undefined, all cache is cleared.
   * If {@link id} is given, cache is partially cleared.
   * @param {string|number|undefined} id
   */
  clearCache(id) {
    logger.debug({ tableName: this.#tableName, id }, 'trigerring cache clear');

    if (id) {
      this.#dataloader.clear(id);
    } else {
      this.#dataloader.clearAll();
    }
    this.#findCache.clear();
  }
}
