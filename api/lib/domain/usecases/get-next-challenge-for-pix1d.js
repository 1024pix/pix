import { NotFoundError } from '../errors.js';
import { Activity } from '../models/Activity.js';
import { getNextActivityLevel } from '../services/algorithm-methods/pix1d.js';

const FIRST_CHALLENGE_NB = 1;

export async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  const currentActivity = await _getCurrentActivity(activityRepository, assessmentId);

  let answers = [];

  let challenge;
  if (currentActivity) {
    answers = await activityAnswerRepository.findByActivity(currentActivity.id);
    challenge = await _getChallengeForCurrentActivity(currentActivity, missionId, challengeRepository, answers);
  }
  if (!challenge) {
    challenge = _getNextActivityChallenge(
      missionId,
      currentActivity,
      assessmentId,
      _lastAnswerStatus(answers),
      challengeRepository,
      assessmentRepository,
      activityRepository,
    );
  }
  return challenge;
}

async function _getChallengeForCurrentActivity(currentActivity, missionId, challengeRepository, answers) {
  if (_shouldLookForNextChallengeInActivity(answers)) {
    const challengeNumber = answers.length + 1;
    return await _getNextChallenge(
      missionId,
      currentActivity.level,
      challengeNumber,
      challengeRepository,
      currentActivity.alternativeVersion,
    );
  }
}

async function _getNextChallenge(missionId, activityLevel, challengeNumber, challengeRepository, alternativeVersion) {
  return _getChallenge({
    missionId,
    activityLevel,
    challengeNumber,
    alternativeVersion,
    challengeRepository,
  });
}

function _lastAnswerStatus(answers) {
  if (answers.length < 1) {
    return undefined;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.status;
}

async function _getCurrentActivity(activityRepository, assessmentId) {
  try {
    return await activityRepository.getLastActivity(assessmentId);
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
}

function _shouldLookForNextChallengeInActivity(answers) {
  return _lastAnswerStatus(answers) === 'ok' || answers.length === 0;
}

async function _getNextActivityChallenge(
  missionId,
  currentActivity,
  assessmentId,
  lastAnswerStatus,
  challengeRepository,
  assessmentRepository,
  activityRepository,
) {
  if (lastAnswerStatus) {
    await activityRepository.updateStatus({ activityId: currentActivity.id, status: status[lastAnswerStatus] });
  }
  const nextActivityLevel = getNextActivityLevel(await activityRepository.getAllByAssessmentId(assessmentId));
  if (nextActivityLevel !== undefined) {
    const challenge = await _getChallenge({
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
  await assessmentRepository.completeByAssessmentId(assessmentId);
  return null;
}

async function _getChallenge({ missionId, activityLevel, challengeNumber, alternativeVersion, challengeRepository }) {
  try {
    const challenges = await challengeRepository.getForPix1D({
      missionId,
      activityLevel,
      challengeNumber,
    });

    if (alternativeVersion) {
      return challenges.find((challenge) => challenge.alternativeVersion === alternativeVersion);
    } else {
      return challenges[_randomIndexForChallenges(challenges.length)];
    }
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
}

function _randomIndexForChallenges(length, random = Math.random()) {
  return Math.floor(random * length);
}

const status = {
  aband: Activity.status.SKIPPED,
  ok: Activity.status.SUCCEEDED,
  ko: Activity.status.FAILED,
};
