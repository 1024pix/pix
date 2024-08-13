import { LcmsRefreshCacheJob } from '../models/LcmsRefreshCacheJob.js';

const refreshLearningContentCache = async function ({ userId, lcmsRefreshCacheJobRepository }) {
  await lcmsRefreshCacheJobRepository.performAsync(new LcmsRefreshCacheJob({ userId }));
};
export { refreshLearningContentCache };
