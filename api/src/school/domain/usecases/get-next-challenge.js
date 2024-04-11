import { Activity } from '../models/Activity.js';

export async function getNextChallenge({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeRepository,
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
  const answers = await activityAnswerRepository.findByActivity(activity.id);

  const challengeId = mission.getChallengeId({
    activityLevel: activity.level,
    challengeIndex: answers.length,
    alternativeVersion: activity.alternativeVersion,
  });

  await assessmentRepository.updateWhenNewChallengeIsAsked({ id: assessmentId, lastChallengeId: challengeId });

  return challengeRepository.get(challengeId);
}
