import type { QueryBuilder } from 'knex';

import { LearningContentInMemoryRepository } from './learning-content-inmemory-repository.js';
import { LearningContentPostgresRepository } from './learning-content-postgres-repository.js';
import { LearningContentRedisRepository } from './learning-content-redis-repository.js';

export interface LearningContentRepositoryOptions {
  tableName: string;
  idType?: string;
}

export type QueryBuilderCallback = (knex: QueryBuilder) => Promise<string[] | number[]>;

export interface LearningContentRepository {
  /**
   * Finds several entities using a request and optionally caches results.
   * The request is built using a knex query builder given to {@link callback}.
   * {@link cacheKey} must vary according to params given to the query builder.
   */
  find(cacheKey: string, callback: QueryBuilderCallback): Promise<object[]>;

  /**
   * Loads one entity by ID.
   */
  load(id: string | number): Promise<object | null>;

  /**
   * Gets several entities by ID.
   * Deduplicates ids and removes nullish ids before loading.
   */
  getMany(ids: string[] | number[]): Promise<(object | null)[]>;

  /**
   * Loads several entities by ID.
   */
  loadMany(ids: string[] | number[]): Promise<(object | null)[]>;

  /**
   * Clears repository’s cache.
   * If {@link id} is undefined, all cache is cleared.
   * If {@link id} is given, cache is partially cleared.
   */
  clearCache?(id?: string | number): void;
}

interface LearningContentRepositoryClass {
  new (options: LearningContentRepositoryOptions): LearningContentRepository;
  isEnabled?: boolean;
  name: string;
}

const implementations = [
  LearningContentPostgresRepository,
  LearningContentRedisRepository,
] as LearningContentRepositoryClass[];

const defaultImplementation = LearningContentInMemoryRepository as LearningContentRepositoryClass;

export function makeGetInstance(options: LearningContentRepositoryOptions) {
  const instances = new Map<string, LearningContentRepository>();

  return () => {
    const implementation = implementations.find(({ isEnabled }) => isEnabled) ?? defaultImplementation;

    let instance = instances.get(implementation.name);
    if (instance) return instance;

    instance = new implementation(options);
    instances.set(implementation.name, instance);

    return instance;
  };
}
