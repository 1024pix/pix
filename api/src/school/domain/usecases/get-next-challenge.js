import { Activity } from '../models/Activity.js';
import { ActivityInfo } from '../models/ActivityInfo.js';

export async function getNextChallenge({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeToPlayApi,
  activityRepository,
  missionAssessmentRepository,
  missionRepository,
}) {
  const activity = await activityRepository.getLastActivity(assessmentId);
  if (activity.status !== Activity.status.STARTED) {
    return null;
  }
  const { missionId } = await missionAssessmentRepository.getByAssessmentId(assessmentId);
  const mission = await missionRepository.get(missionId);
  const lastAnswer = await activityAnswerRepository.findLastByActivity(activity.id);

  const activityInfo = new ActivityInfo({ level: activity.level, stepIndex: activity.stepIndex });
  let challengeIndex = 0;
  if (lastAnswer) {
    const previousChallengeIndex = mission.getChallengeIndex(activityInfo, lastAnswer?.challengeId);
    challengeIndex = previousChallengeIndex + 1;
  }
  const challengeId = mission.getChallengeId({
    activityInfo,
    challengeIndex,
    alternativeVersion: activity.alternativeVersion,
  });

  if (!challengeId) {
    return null;
  }

  await assessmentRepository.updateWhenNewChallengeIsAsked({ id: assessmentId, lastChallengeId: challengeId });
  return challengeToPlayApi.get(challengeId);
}
