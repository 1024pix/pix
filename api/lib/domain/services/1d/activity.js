import { NotFoundError } from '../../errors.js';

export async function getCurrentActivity(activityRepository, assessmentId) {
  try {
    return await activityRepository.getLastActivity(assessmentId);
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
}


