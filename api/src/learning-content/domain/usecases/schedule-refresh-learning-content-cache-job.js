import { lcmsRefreshCacheJobRepository as injectedLcmsRefreshCacheJobRepository } from '../../infrastructure/repositories/jobs/lcms-refresh-cache-job-repository.js';
import { LcmsRefreshCacheJob } from '../models/LcmsRefreshCacheJob.js';

/**
 * @param {{
 *   userId: number
 * } & import('./dependencies.js').Dependencies}
 */
export async function scheduleRefreshLearningContentCacheJob({
  userId,
  lcmsRefreshCacheJobRepository = injectedLcmsRefreshCacheJobRepository,
} = {}) {
  await lcmsRefreshCacheJobRepository.performAsync(new LcmsRefreshCacheJob({ userId }));
}
