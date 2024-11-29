import Dataloader from 'dataloader';

import { knex } from '../../../../db/knex-database-connection.js';
import * as learningContentPubSub from '../caches/learning-content-pubsub.js';

export class LearningContentRepository {
  #tableName;
  #idType;
  #dataloader;
  #findCache;
  #findCacheMiss;

  constructor({ tableName, idType = 'text', pubSub = learningContentPubSub.getPubSub() }) {
    this.#tableName = tableName;
    this.#idType = idType;

    this.#dataloader = new Dataloader((ids) => this.#batchLoad(ids), {
      cacheMap: new LearningContentCache({
        name: `${tableName}:entities`,
        pubSub,
      }),
    });

    this.#findCache = new LearningContentCache({
      name: `${tableName}:results`,
      pubSub,
    });

    this.#findCacheMiss = new Map();
  }

  async find(cacheKey, callback) {
    return this.#findDtos(callback, cacheKey);
  }

  async load(id) {
    return this.#dataloader.load(id);
  }

  async loadMany(ids) {
    return this.#dataloader.loadMany(ids);
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

  clearCache() {
    this.#dataloader.clearAll();
    this.#findCache.clear();
  }
}

class LearningContentCache {
  #map = new Map();
  #pubSub;
  #name;

  /**
   * @param {{
   *   pubSub: import('../caches/learning-content-pubsub.js').LearningContentPubSub
   *   name: string
   * }} config
   * @returns
   */
  constructor({ pubSub, name }) {
    this.#pubSub = pubSub;
    this.#name = name;

    (async () => {
      for await (const message of pubSub.subscribe(name)) {
        if (message.type === 'clear') this.#map.clear();
        if (message.type === 'delete') this.#map.delete(this.message.key);
      }
    })();
  }

  get(key) {
    return this.#map.get(key);
  }

  set(key, value) {
    return this.#map.set(key, value);
  }

  delete(key) {
    return this.#pubSub.publish(this.#name, { type: 'delete', key });
  }

  clear() {
    return this.#pubSub.publish(this.#name, { type: 'clear' });
  }
}
