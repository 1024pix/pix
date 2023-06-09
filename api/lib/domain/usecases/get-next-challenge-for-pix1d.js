import { NotFoundError } from '../errors.js';
import { Activity } from '../models/Activity.js';

export async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  answerRepository,
  challengeRepository,
  activityRepository,
}) {
  const currentActivity = await _getCurrentActivity(activityRepository, assessmentId);
  const answers = await answerRepository.findByActivity(currentActivity.id);
  if (_userFailedOrSkippedLastChallenge(answers)) {
    return _endMission(assessmentRepository, assessmentId);
  }

  const { missionId } = await assessmentRepository.get(assessmentId);
  try {
    const challengeNumber = answers.length + 1;
    return await challengeRepository.getForPix1D({
      missionId,
      activityLevel: currentActivity.level,
      challengeNumber,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      const nextActivityLevel = _getNextActivityLevel(currentActivity.level);
      if (nextActivityLevel === undefined) {
        return _endMission(assessmentRepository, assessmentId);
      } else {
        activityRepository.save(new Activity({ assessmentId, level: nextActivityLevel }));
        return await challengeRepository.getForPix1D({
          missionId,
          activityLevel: nextActivityLevel,
          challengeNumber: 1,
        });
      }
    }
    throw error;
  }
}

async function _getCurrentActivity(activityRepository, assessmentId) {
  try {
    return await activityRepository.getLastActivity(assessmentId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return await activityRepository.save(new Activity({ assessmentId, level: Activity.levels.TUTORIAL }));
    }
    throw error;
  }
}

const _userFailedOrSkippedLastChallenge = function (answers) {
  if (answers.length <= 0) {
    return false;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.isKO() || lastAnswerResult.isSKIPPED();
};

function _getNextActivityLevel(level) {
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

function _endMission(assessmentRepository, assessmentId) {
  assessmentRepository.completeByAssessmentId(assessmentId);
  return;
}
