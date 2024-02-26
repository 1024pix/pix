import { Assessment } from '../models/Assessment.js';
import { NotInProgressAssessmentError } from '../school-errors.js';

export async function getCurrentActivity({ assessmentId, activityRepository, assessmentRepository }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.state !== Assessment.states.STARTED) {
    throw new NotInProgressAssessmentError(assessmentId);
  }
  return await activityRepository.getLastActivity(assessmentId);
}
