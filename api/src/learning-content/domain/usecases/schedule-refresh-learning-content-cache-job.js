import { LcmsRefreshCacheJob } from '../models/LcmsRefreshCacheJob.js';

/**
 * @param {{
 *   userId: number
 * } & import('./dependencies.js').Dependencies}
 */
export async function scheduleRefreshLearningContentCacheJob({ userId, lcmsRefreshCacheJobRepository }) {
  await lcmsRefreshCacheJobRepository.performAsync(new LcmsRefreshCacheJob({ userId }));
}
