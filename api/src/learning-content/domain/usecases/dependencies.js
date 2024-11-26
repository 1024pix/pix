import { LearningContentCache } from '../../../shared/infrastructure/caches/learning-content-cache.js';
import { lcmsRefreshCacheJobRepository } from '../../infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';

export const dependencies = {
  lcmsRefreshCacheJobRepository,
  LearningContentCache,
};

/** @typedef {typeof dependencies} Dependencies */
