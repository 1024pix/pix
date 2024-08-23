import { LcmsRefreshCacheJob } from '../models/jobs/LcmsRefreshCacheJob.js';

const refreshLearningContentCache = async function ({ userId, lcmsRefreshCacheJobRepository }) {
  await lcmsRefreshCacheJobRepository.performAsync(new LcmsRefreshCacheJob({ userId }));
};
export { refreshLearningContentCache };
