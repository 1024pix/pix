import { Activity } from '../models/Activity.js';
import { getMissionResult } from './get-mission-result.js';

export async function updateAssessment({
  assessmentId,
  lastActivity,
  assessmentRepository,
  activityRepository,
  missionAssessmentRepository,
}) {
  const terminatedStatuses = [Activity.status.SUCCEEDED, Activity.status.SKIPPED, Activity.status.FAILED];
  if (terminatedStatuses.includes(lastActivity.status)) {
    await assessmentRepository.completeByAssessmentId(assessmentId);
    const activities = await activityRepository.getAllByAssessmentId(assessmentId);
    const result = await getMissionResult({ activities });
    await missionAssessmentRepository.updateResult(assessmentId, result);
  }
}
