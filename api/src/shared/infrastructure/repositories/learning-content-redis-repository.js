import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { learningContentCache } from '../caches/learning-content-redis-cache.js';

export class LearningContentRedisRepository {
  #tableName;
  #idType; // eslint-disable-line no-unused-private-class-members
  #cache;

  constructor({ tableName, idType = 'text', cache = learningContentCache }) {
    this.#tableName = tableName;
    this.#idType = idType;
    this.#cache = cache;
  }

  /**
   * Finds several entities using a request and caches results.
   * The request is built using a knex query builder given to {@link callback}.
   * {@link cacheKey} must vary according to params given to the query builder.
   * @param {string} cacheKey
   * @param {QueryBuilderCallback} callback
   * @returns {Promise<object[]>}
   */
  async find(_cacheKey, _callback) {
    // FIXME
  }

  /**
   * Loads one entity by ID.
   * @param {string | number} id
   * @returns {Promise<object | null>}
   */
  async load(id) {
    const key = this.#getEntityCacheKey(id);

    const cachedEntity = await this.#cache.getEntity(key);

    if (cachedEntity !== undefined) return cachedEntity;

    const entity = await DomainTransaction.getConnection().select('*').from(this.#tableName).where('id', id).first();

    await this.#cache.setEntity(key, entity ?? null);

    return entity ?? null;
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

    // FIXME
  }

  /**
   * Loads several entities by ID.
   * @param {string[]|number[]} ids
   * @returns {Promise<(object|null)[]>}
   */
  async loadMany(_ids) {
    // FIXME
  }

  /**
   * @param {string|number} id
   */
  #getEntityCacheKey(id) {
    return `${this.#tableName.split('.').at(-1)}:entity:${id}`;
  }
}
