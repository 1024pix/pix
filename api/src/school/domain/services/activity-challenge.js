import { challengeService } from './challenge.js';
import { Activity } from '../models/Activity.js';
import { getLastAnswerStatus } from './last-answer-status.js';
import { pix1dService } from './algorithm-method.js';

const FIRST_CHALLENGE_NB = 1;

async function getChallengeForCurrentActivity({ currentActivity, missionId, challengeRepository, answers }) {
  if (_shouldLookForNextChallengeInActivity(answers)) {
    const challengeNumber = answers.length + 1;
    return await challengeService.getChallenge({
      missionId,
      activityLevel: currentActivity.level,
      challengeNumber,
      challengeRepository,
      alternativeVersion: _convertAlternativeVersionToUndefined(currentActivity.alternativeVersion),
    });
  }
}

function _shouldLookForNextChallengeInActivity(answers) {
  return getLastAnswerStatus(answers) === 'ok' || answers.length === 0;
}

async function getNextActivityChallenge({ missionId, assessmentId, challengeRepository, activityRepository }) {
  const allActivities = await activityRepository.getAllByAssessmentId(assessmentId);
  const nextActivityLevel = pix1dService.getNextActivityLevel(allActivities);

  const alreadyPlayedAlternativeVersions = allActivities
    .filter((activity) => activity.level === nextActivityLevel)
    .map((activity) => _convertAlternativeVersionToUndefined(activity.alternativeVersion));
  if (nextActivityLevel === undefined) {
    return;
  }
  const alternativeVersion = await challengeService.getAlternativeVersion({
    missionId,
    activityLevel: nextActivityLevel,
    alreadyPlayedAlternativeVersions,
    challengeRepository,
  });

  await activityRepository.save(
    new Activity({
      assessmentId,
      level: nextActivityLevel,
      status: Activity.status.STARTED,
      alternativeVersion: _convertAlternativeVersionTo0(alternativeVersion),
    }),
  );

  return await challengeService.getChallenge({
    missionId,
    activityLevel: nextActivityLevel,
    challengeNumber: FIRST_CHALLENGE_NB,
    alternativeVersion,
    challengeRepository,
  });
}

function _convertAlternativeVersionTo0(alternativeVersion) {
  if (alternativeVersion === undefined) {
    return 0;
  }
  return alternativeVersion;
}

function _convertAlternativeVersionToUndefined(alternativeVersion) {
  if (alternativeVersion === 0) {
    return undefined;
  }
  return alternativeVersion;
}

export { getNextActivityChallenge, getChallengeForCurrentActivity };
