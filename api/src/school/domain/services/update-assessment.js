import { Activity } from '../models/Activity.js';

export async function updateAssessment({ assessmentId, lastActivity, assessmentRepository }) {
  const terminatedStatuses = [Activity.status.SUCCEEDED, Activity.status.SKIPPED, Activity.status.FAILED];
  if (terminatedStatuses.includes(lastActivity.status)) {
    await assessmentRepository.completeByAssessmentId(assessmentId);
  }
}
