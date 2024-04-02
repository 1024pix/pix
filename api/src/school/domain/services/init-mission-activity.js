import { Activity } from '../models/Activity.js';
import { pix1dService } from '../services/algorithm-method.js';
import { challengeService } from '../services/challenge.js';

export async function initMissionActivity({
  assessmentId,
  lastActivity,
  activityRepository,
  missionAssessmentRepository,
  missionRepository,
  domainTransaction,
}) {
  if (lastActivity?.status === Activity.status.STARTED) {
    return lastActivity;
  }
  const activities = await activityRepository.getAllByAssessmentId(assessmentId, domainTransaction);
  const activityLevel = pix1dService.getNextActivityLevel(activities);

  if (activityLevel === pix1dService.END_OF_MISSION) {
    return lastActivity;
  }
  const { missionId } = await missionAssessmentRepository.getByAssessmentId(assessmentId, domainTransaction);
  const mission = await missionRepository.get(missionId);

  const alternativeVersion = challengeService.getAlternativeVersion({ mission, activities, activityLevel });

  const activity = new Activity({
    assessmentId,
    level: activityLevel,
    status: Activity.status.STARTED,
    alternativeVersion,
  });

  return activityRepository.save(activity, domainTransaction);
}
