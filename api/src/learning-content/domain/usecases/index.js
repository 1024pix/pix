import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { createLearningContentRelease } from './create-learning-content-release.js';
import { dependencies } from './dependencies.js';
import { getFrameworkAreas } from './get-framework-areas.js';
import { getFrameworks } from './get-frameworks.js';
import { patchLearningContentCacheEntry } from './patch-learning-content-cache-entry.js';
import { refreshLearningContentCache } from './refresh-learning-content-cache.js';
import { scheduleCreateLearningContentReleaseJob } from './schedule-create-learning-content-release-job.js';
import { scheduleRefreshLearningContentCacheJob } from './schedule-refresh-learning-content-cache-job.js';

const usecasesWithoutInjectedDependencies = {
  createLearningContentRelease,
  getFrameworkAreas,
  getFrameworks,
  patchLearningContentCacheEntry,
  refreshLearningContentCache,
  scheduleCreateLearningContentReleaseJob,
  scheduleRefreshLearningContentCacheJob,
};

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);
