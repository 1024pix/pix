import { CreateLearningContentReleaseJob } from '../models/CreateLearningReleaseJob.js';

/**
 * @param {{
 *   userId: number
 * } & import('./dependencies.js').Dependencies}
 */
export async function scheduleCreateLearningContentReleaseJob({
  userId,
  createLearningContentReleaseJobRepository: lcmsCreateReleaseJobRepository,
}) {
  await lcmsCreateReleaseJobRepository.performAsync(new CreateLearningContentReleaseJob({ userId }));
}
