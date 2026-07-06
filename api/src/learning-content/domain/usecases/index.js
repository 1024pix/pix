import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { createLearningContentRelease } from './create-learning-content-release.js';
import { dependencies } from './dependencies.js';
import { findFrameworksByIds } from './find-frameworks-by-ids.js';
import { findSkillsByIds } from './find-skills-by-ids.js';
import { getFrameworkAreas } from './get-framework-areas.js';
import { getFrameworks } from './get-frameworks.js';
import { patchLearningContentEntry } from './patch-learning-content-entry.js';
import { refreshLearningContent } from './refresh-learning-content.js';
import { scheduleCreateLearningContentReleaseJob } from './schedule-create-learning-content-release-job.js';
import { scheduleRefreshLearningContentJob } from './schedule-refresh-learning-content-job.js';

const usecasesWithoutInjectedDependencies = {
  createLearningContentRelease,
  findFrameworksByIds,
  findSkillsByIds,
  getFrameworkAreas,
  getFrameworks,
  patchLearningContentEntry,
  refreshLearningContent,
  scheduleCreateLearningContentReleaseJob,
  scheduleRefreshLearningContentJob,
};

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
