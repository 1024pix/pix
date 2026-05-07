import { RefreshLearningContentJob } from '../models/RefreshLearningContentJob.js';

/**
 * @param {{
 *   userId: number
 * } & import('./dependencies.js').Dependencies}
 */
export async function scheduleRefreshLearningContentJob({
  userId,
  refreshLearningContentJobRepository: lcmsRefreshCacheJobRepository,
}) {
  await lcmsRefreshCacheJobRepository.performAsync(new RefreshLearningContentJob({ userId }));
}
