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
    if (_shouldLookForNextChallengeInActivity(answers)) {
      const challengeNumber = answers.length + 1;
      challenge = await _getNextChallenge(missionId, currentActivity.level, challengeNumber, challengeRepository);
    }
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

async function _getNextChallenge(missionId, activityLevel, challengeNumber, challengeRepository) {
  try {
    return await challengeRepository.getForPix1D({
      missionId,
      activityLevel,
      challengeNumber,
    });
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
}

const _lastAnswerStatus = function (answers) {
  if (answers.length < 1) {
    return undefined;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.status;
};

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
    activityRepository.save(new Activity({ assessmentId, level: nextActivityLevel, status: Activity.status.STARTED }));
    return await challengeRepository.getForPix1D({
      missionId,
      activityLevel: nextActivityLevel,
      challengeNumber: FIRST_CHALLENGE_NB,
    });
  }
  assessmentRepository.completeByAssessmentId(assessmentId);
}

const status = {
  aband: Activity.status.SKIPPED,
  ok: Activity.status.SUCCEEDED,
  ko: Activity.status.FAILED,
};
