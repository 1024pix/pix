import { lcmsCreateReleaseJobRepository as injectedLcmsCreateReleaseJobRepository } from '../../infrastructure/repositories/jobs/lcms-create-release-job-repository.js';
import { LcmsCreateReleaseJob } from '../models/LcmsCreateReleaseJob.js';

/**
 * @param {{
 *   userId: number
 * } & import('./dependencies.js').Dependencies}
 */
export async function scheduleCreateLearningContentReleaseJob({
  userId,
  lcmsCreateReleaseJobRepository = injectedLcmsCreateReleaseJobRepository,
} = {}) {
  await lcmsCreateReleaseJobRepository.performAsync(new LcmsCreateReleaseJob({ userId }));
}
