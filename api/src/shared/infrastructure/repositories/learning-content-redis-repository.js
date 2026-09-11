import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { learningContentCache } from '../caches/learning-content-redis-cache.js';
import { child, SCOPES } from '../utils/logger.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export class LearningContentRedisRepository {
  #tableName;
  #idType;
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
  getMany(ids) {
    const idsToLoad = new Set(ids);
    idsToLoad.delete(undefined);
    idsToLoad.delete(null);

    return this.loadMany(idsToLoad);
  }

  /**
   * Loads several entities by ID.
   * @param {string[]|number[]} ids
   * @returns {Promise<(object|null)[]>}
   */
  async loadMany(ids) {
    const keys = ids.map((id) => this.#getEntityCacheKey(id));

    const cachedEntities = await this.#cache.mget(keys);

    const missingIds = ids.filter((id, index) => cachedEntities[index] === undefined);

    if (missingIds.length === 0) return cachedEntities;

    try {
      const knexConn = DomainTransaction.getConnection();
      const entities = await knexConn
        .select(`${this.#tableName}.*`)
        .from(knexConn.raw(`unnest(?::${this.#idType}[]) with ordinality as ids(id, idx)`, [missingIds])) // eslint-disable-line knex/avoid-injections
        .leftJoin(this.#tableName, `${this.#tableName}.id`, 'ids.id')
        .orderBy('ids.idx');

      await this.#cache.setMany(ids.map((id, index) => [id, entities[index] ?? null]));

      let missingIndex = 0;
      return cachedEntities.map((cachedEntity) =>
        cachedEntity === undefined ? entities[missingIndex++] : cachedEntity,
      );
    } catch (err) {
      logger.error({ err, table: this.#tableName }, 'error loading entities');
      throw err;
    }
  }

  /**
   * @param {string|number} id
   */
  #getEntityCacheKey(id) {
    return `${this.#tableName.split('.').at(-1)}:entity:${id}`;
  }
}
