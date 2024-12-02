import Dataloader from 'dataloader';

import { knex } from '../../../../db/knex-database-connection.js';
import { LearningContentCache } from '../caches/learning-content-cache.js';

export class LearningContentRepository {
  #tableName;
  #idType;
  #dataloader;
  #findCache;
  #findCacheMiss;

  constructor({ tableName, idType = 'text' }) {
    this.#tableName = tableName;
    this.#idType = idType;

    this.#dataloader = new Dataloader((ids) => this.#batchLoad(ids), {
      cacheMap: new LearningContentCache({ name: `${tableName}:entities` }),
    });

    this.#findCache = new LearningContentCache({ name: `${tableName}:results` });

    this.#findCacheMiss = new Map();
  }

  async find(cacheKey, callback) {
    return this.#findDtos(callback, cacheKey);
  }

  async load(id) {
    if (!id) return null;
    return this.#dataloader.load(id);
  }

  async loadMany(ids) {
    const notNullIds = ids.filter((id) => id);
    return this.#dataloader.loadMany(notNullIds);
  }

  #findDtos(callback, cacheKey) {
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

  async #loadDtos(callback, cacheKey) {
    const ids = await callback(knex.pluck(`${this.#tableName}.id`).from(this.#tableName));
    const dtos = await this.#dataloader.loadMany(ids);
    this.#findCache.set(cacheKey, dtos);
    return dtos;
  }

  async #batchLoad(ids) {
    const dtos = await knex
      .select(`${this.#tableName}.*`)
      .from(knex.raw(`unnest(?::${this.#idType}[]) with ordinality as ids(id, idx)`, [ids])) // eslint-disable-line knex/avoid-injections
      .leftJoin(this.#tableName, `${this.#tableName}.id`, 'ids.id')
      .orderBy('ids.idx');
    return dtos.map((dto) => (dto.id ? dto : null));
  }

  clearCache(id) {
    if (id) {
      this.#dataloader.clear(id);
    } else {
      this.#dataloader.clearAll();
    }
    this.#findCache.clear();
  }
}
