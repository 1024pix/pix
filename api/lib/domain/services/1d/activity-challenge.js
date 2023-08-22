import { challengeService } from './challenge.js';
import { Activity } from '../../models/index.js';
import { getLastAnswerStatus } from './last-answer-status.js';
const FIRST_CHALLENGE_NB = 1;

async function getChallengeForCurrentActivity({ currentActivity, missionId, challengeRepository, answers }) {
  if (_shouldLookForNextChallengeInActivity(answers)) {
    const challengeNumber = answers.length + 1;
    return await challengeService.getChallenge({
      missionId,
      activityLevel: currentActivity.level,
      challengeNumber,
      challengeRepository,
      alternativeVersion: currentActivity.alternativeVersion,
    });
  }
}

function _shouldLookForNextChallengeInActivity(answers) {
  return getLastAnswerStatus(answers) === 'ok' || answers.length === 0;
}

async function getNextActivityChallenge({
  missionId,
  assessmentId,
  nextActivityLevel,
  challengeRepository,
  activityRepository,
}) {
  const challenge = await challengeService.getChallenge({
    missionId,
    activityLevel: nextActivityLevel,
    challengeNumber: FIRST_CHALLENGE_NB,
    challengeRepository,
  });

  await activityRepository.save(
    new Activity({
      assessmentId,
      level: nextActivityLevel,
      status: Activity.status.STARTED,
      alternativeVersion: challenge.alternativeVersion,
    }),
  );
  return challenge;
}

export { getNextActivityChallenge, getChallengeForCurrentActivity };
