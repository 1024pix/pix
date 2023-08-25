import { getCurrentActivity } from '../services/1d/activity.js';
import { getChallengeForCurrentActivity, getNextActivityChallenge } from '../services/1d/activity-challenge.js';
import { getLastAnswerStatus } from '../services/1d/last-answer-status.js';
import { Activity } from '../models/index.js';
import { getNextActivityLevel } from '../services/algorithm-methods/pix1d.js';

export async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  const currentActivity = await getCurrentActivity(activityRepository, assessmentId);

  if (currentActivity) {
    const answers = await activityAnswerRepository.findByActivity(currentActivity.id);
    const challenge = await getChallengeForCurrentActivity({
      currentActivity,
      missionId,
      challengeRepository,
      answers,
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

  const nextActivityLevel = getNextActivityLevel(await activityRepository.getAllByAssessmentId(assessmentId));
  if (nextActivityLevel === undefined) {
    await assessmentRepository.completeByAssessmentId(assessmentId);
    return null;
  }

  return getNextActivityChallenge({
    missionId,
    assessmentId,
    challengeRepository,
    activityRepository,
    nextActivityLevel,
  });
}

function _getActivityStatusFromAnswerStatus(answerStatus) {
  const status = {
    aband: Activity.status.SKIPPED,
    ok: Activity.status.SUCCEEDED,
    ko: Activity.status.FAILED,
  };
  return status[answerStatus];
}
