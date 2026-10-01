import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { isEnabledByContainerRatio } from '../feature-toggles/feature-toggles-utils.js';
import { featureToggles } from '../feature-toggles/index.js';

const isLearningContentCacheDisabledFeatureToggle = featureToggles.use('isLearningContentCacheDisabled');

export class LearningContentPostgresRepository {
  #tableName;
  #idType;

  static #isEnabled = isEnabledByContainerRatio(isLearningContentCacheDisabledFeatureToggle.value);

  static {
    isLearningContentCacheDisabledFeatureToggle.watch((value) => {
      LearningContentPostgresRepository.#isEnabled = isEnabledByContainerRatio(value);
    });
  }

  constructor({ tableName, idType = 'text' }) {
    this.#tableName = tableName;
    this.#idType = idType;
  }

  /**
   * Finds several entities using a request.
   * The request is built using a knex query builder given to {@link callback}.
   * @param {string} _cacheKey
   * @param {QueryBuilderCallback} callback
   * @returns {Promise<object[]>}
   */
  async find(_cacheKey, callback) {
    const knexConn = DomainTransaction.getConnection();
    const knexResults = await callback(knexConn.select(`*`).from(this.#tableName));

    return knexResults.map((result) => (result.id ? result : null));
  }

  /**
   * Loads one entity by ID.
   * @param {string | number} id
   * @returns {Promise<object | null>}
   */
  async load(id) {
    const entity = await DomainTransaction.getConnection().select('*').from(this.#tableName).where('id', id).first();

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

    const knexConn = DomainTransaction.getConnection();
    const knexResults = await knexConn
      .select(`${this.#tableName}.*`)
      .from(knexConn.raw(`unnest(?::${this.#idType}[]) with ordinality as ids(id, idx)`, [ids])) // eslint-disable-line knex/avoid-injections
      .leftJoin(this.#tableName, `${this.#tableName}.id`, 'ids.id')
      .orderBy('ids.idx');

    return knexResults.map((result) => (result.id ? result : null));
  }

  static get isEnabled() {
    return LearningContentPostgresRepository.#isEnabled;
  }
}
