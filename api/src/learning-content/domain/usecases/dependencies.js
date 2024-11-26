import { LearningContentCache } from '../../../shared/infrastructure/caches/learning-content-cache.js';
import { frameworkRepository } from '../../infrastructure/repositories/framework-repository.js';
import { lcmsRefreshCacheJobRepository } from '../../infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';

export const dependencies = {
  frameworkRepository,
  lcmsRefreshCacheJobRepository,
  LearningContentCache,
};

/** @typedef {typeof dependencies} Dependencies */
