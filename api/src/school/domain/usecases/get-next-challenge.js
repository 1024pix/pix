import { getCurrentActivity } from '../services/activity.js';
import { getChallengeForCurrentActivity, getNextActivityChallenge } from '../services/activity-challenge.js';
import { getLastAnswerStatus } from '../services/last-answer-status.js';
import { Activity } from '../models/Activity.js';

export async function getNextChallenge({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
  missionAssessmentRepository,
}) {
  const { missionId } = await missionAssessmentRepository.getByAssessmentId(assessmentId);
  const currentActivity = await getCurrentActivity(activityRepository, assessmentId);
  const locale = 'fr-fr';

  if (currentActivity) {
    const answers = await activityAnswerRepository.findByActivity(currentActivity.id);
    const challenge = await getChallengeForCurrentActivity({
      currentActivity,
      missionId,
      challengeRepository,
      answers,
      locale,
    });
    if (challenge) {
      return challenge;
    } else {
      const lastAnswerStatus = getLastAnswerStatus(answers);
      if (lastAnswerStatus) {
        await activityRepository.updateStatus({
          activityId: currentActivity.id,
          status: _getActivityStatusFromAnswerStatus(lastAnswerStatus),
        });
      }
    }
  }

  const nextChallenge = await getNextActivityChallenge({
    missionId,
    assessmentId,
    challengeRepository,
    activityRepository,
    locale,
  });

  if (nextChallenge === undefined) {
    await assessmentRepository.completeByAssessmentId(assessmentId);
    return null;
  } else {
    await assessmentRepository.updateWhenNewChallengeIsAsked({
      id: assessmentId,
      lastChallengeId: nextChallenge.id,
    });

    return nextChallenge;
  }
}

function _getActivityStatusFromAnswerStatus(answerStatus) {
  const status = {
    aband: Activity.status.SKIPPED,
    ok: Activity.status.SUCCEEDED,
    ko: Activity.status.FAILED,
  };
  return status[answerStatus];
}
