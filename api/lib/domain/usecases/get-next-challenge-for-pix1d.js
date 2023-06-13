import { NotFoundError } from '../errors.js';
import { Activity } from '../models/Activity.js';

export async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  let currentActivity;
  let answers = [];
  try {
    currentActivity = await activityRepository.getLastActivity(assessmentId);
    answers = await activityAnswerRepository.findByActivity(currentActivity.id);
    if (_userSucceededLastChallenge(answers)) {
      const challengeNumber = answers.length + 1;
      return await challengeRepository.getForPix1D({
        missionId,
        activityLevel: currentActivity.level,
        challengeNumber,
      });
    }
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
  return _getNextActivityChallenge(
    currentActivity,
    assessmentRepository,
    assessmentId,
    activityRepository,
    challengeRepository,
    missionId,
    _userFailedOrSkippedLastChallenge(answers)
  );
}

const _userSucceededLastChallenge = function (answers) {
  if (answers.length === 0) {
    return false;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.isOK();
};

const _userFailedOrSkippedLastChallenge = function (answers) {
  if (answers.length < 1) {
    return false;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.isKO() || lastAnswerResult.isSKIPPED();
};

async function _getNextActivityChallenge(
  currentActivity,
  assessmentRepository,
  assessmentId,
  activityRepository,
  challengeRepository,
  missionId,
  lastChallengeFailedOrSkipped
) {
  const nextActivityLevel = _getNextActivityLevel(currentActivity?.level, lastChallengeFailedOrSkipped);
  if (nextActivityLevel !== undefined) {
    activityRepository.save(new Activity({ assessmentId, level: nextActivityLevel }));
    return await challengeRepository.getForPix1D({
      missionId,
      activityLevel: nextActivityLevel,
      challengeNumber: 1,
    });
  }
  assessmentRepository.completeByAssessmentId(assessmentId);
}

function _getNextActivityLevel(level, lastChallengeFailedOrSkipped) {
  if (lastChallengeFailedOrSkipped) {
    return undefined;
  }
  if (!level) {
    return Activity.levels.TUTORIAL;
  }
  switch (level) {
    case Activity.levels.TUTORIAL:
      return Activity.levels.TRAINING;
    case Activity.levels.TRAINING:
      return Activity.levels.VALIDATION;
    case Activity.levels.VALIDATION:
      return Activity.levels.CHALLENGE;
    default:
      return undefined;
  }
}
