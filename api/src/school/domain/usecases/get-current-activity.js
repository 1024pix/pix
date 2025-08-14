import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedActivityRepository from '../../infrastructure/repositories/activity-repository.js';
import { Assessment } from '../models/Assessment.js';
import { NotInProgressAssessmentError } from '../school-errors.js';

export async function getCurrentActivity({
  assessmentId,
  activityRepository = injectedActivityRepository,
  assessmentRepository = injectedAssessmentRepository,
} = {}) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.state !== Assessment.states.STARTED) {
    throw new NotInProgressAssessmentError(assessmentId);
  }
  return await activityRepository.getLastActivity(assessmentId);
}
