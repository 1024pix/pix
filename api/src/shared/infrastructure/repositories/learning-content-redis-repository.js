import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { learningContentCache } from '../caches/learning-content-redis-cache.js';

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
  async find(cacheKey, callback) {
    const qualifiedCacheKey = this.#getResultsCacheKey(cacheKey);

    const cachedIds = await this.#cache.getIds(qualifiedCacheKey);

    if (cachedIds !== undefined) return this.loadMany(cachedIds);

    const knexConn = DomainTransaction.getConnection();
    const ids = await callback(knexConn.pluck(`${this.#tableName}.id`).from(this.#tableName));

    await this.#cache.setIds(qualifiedCacheKey, ids);

    return this.loadMany(ids);
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
  getMany(ids) {
    const idsToLoad = new Set(ids);
    idsToLoad.delete(undefined);
    idsToLoad.delete(null);

    return this.loadMany(Array.from(idsToLoad));
  }

  /**
   * Loads several entities by ID.
   * @param {string[]|number[]} ids
   * @returns {Promise<(object|null)[]>}
   */
  async loadMany(ids) {
    if (ids.length === 0) return [];

    const keys = ids.map((id) => this.#getEntityCacheKey(id));

    const cachedEntities = await this.#cache.getEntities(keys);

    const missingIds = ids.filter((id, index) => cachedEntities[index] === undefined);

    if (missingIds.length === 0) return cachedEntities;

    const knexConn = DomainTransaction.getConnection();
    const knexResults = await knexConn
      .select(`${this.#tableName}.*`)
      .from(knexConn.raw(`unnest(?::${this.#idType}[]) with ordinality as ids(id, idx)`, [missingIds])) // eslint-disable-line knex/avoid-injections
      .leftJoin(this.#tableName, `${this.#tableName}.id`, 'ids.id')
      .orderBy('ids.idx');

    const entities = knexResults.map((result) => (result.id ? result : null));

    const missingKeys = keys.filter((key, index) => cachedEntities[index] === undefined);
    await this.#cache.setEntities(missingKeys.map((key, index) => [key, entities[index] ?? null]));

    let missingIndex = 0;
    return cachedEntities.map((cachedEntity) => (cachedEntity === undefined ? entities[missingIndex++] : cachedEntity));
  }

  /**
   * @param {string|number} id
   */
  #getEntityCacheKey(id) {
    return `${this.#shortTableName}:entity:${id}`;
  }

  /**
   * @param {string} cacheKey
   */
  #getResultsCacheKey(cacheKey) {
    return `${this.#shortTableName}:results:${cacheKey}`;
  }

  get #shortTableName() {
    return this.#tableName.split('.').at(-1);
  }
}
