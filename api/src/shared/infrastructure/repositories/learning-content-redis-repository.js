import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { learningContentCache } from '../caches/learning-content-redis-cache.js';
import { child, SCOPES } from '../utils/logger.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

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

    const cachedEntity = await this.#cache.get(key);

    if (cachedEntity !== undefined) return cachedEntity;

    try {
      const entity = await DomainTransaction.getConnection().select('*').from(this.#tableName).where('id', id).first();

      await this.#cache.set(key, entity ?? null);

      return entity ?? null;
    } catch (err) {
      logger.error({ err, id, table: this.#tableName }, 'error loading entity');
      throw err;
    }
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
