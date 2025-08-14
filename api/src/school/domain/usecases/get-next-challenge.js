import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedActivityAnswerRepository from '../../infrastructure/repositories/activity-answer-repository.js';
import * as injectedActivityRepository from '../../infrastructure/repositories/activity-repository.js';
import * as injectedMissionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import * as injectedMissionRepository from '../../infrastructure/repositories/mission-repository.js';
import { Activity } from '../models/Activity.js';
import { ActivityInfo } from '../models/ActivityInfo.js';

export async function getNextChallenge({
  assessmentId,
  assessmentRepository = injectedAssessmentRepository,
  activityAnswerRepository = injectedActivityAnswerRepository,
  challengeRepository = injectedChallengeRepository,
  activityRepository = injectedActivityRepository,
  missionAssessmentRepository = injectedMissionAssessmentRepository,
  missionRepository = injectedMissionRepository,
} = {}) {
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

  await assessmentRepository.updateWhenNewChallengeIsAsked({ id: assessmentId, lastChallengeId: challengeId });
  return challengeRepository.get(challengeId);
}
