import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { Activity } from '../models/Activity.js';
import { ActivityInfo } from '../models/ActivityInfo.js';

export const END_OF_MISSION = Symbol('END_OF_MISSION');

const { TUTORIAL, TRAINING, VALIDATION } = Activity.levels;

export function getNextActivityInfo({ activities, stepCount }) {
  const byDescendingCreatedAt = (a, b) => b.createdAt - a.createdAt;
  const sortedActivities = activities.sort(byDescendingCreatedAt);

  if (_isStartingMission(sortedActivities)) {
    return new ActivityInfo({ stepIndex: 0, level: VALIDATION });
  }

  const lastActivity = _lastActivity(sortedActivities);
  const currentStepActivities = sortedActivities.filter((activity) => activity.stepIndex === lastActivity.stepIndex);

  if (_hasRunActivityLevel3Times(currentStepActivities, VALIDATION)) {
    return END_OF_MISSION;
  }
  if (lastActivity.isDare) {
    return END_OF_MISSION;
  }
  if (_hasRunActivityLevel3Times(currentStepActivities, TRAINING) && lastActivity.isFailedOrSkipped) {
    return END_OF_MISSION;
  }
  if (lastActivity.isSucceeded || lastActivity.isTutorial) {
    return _getNextActivityInfoAfterSuccess(currentStepActivities, lastActivity, stepCount);
  }
  if (lastActivity.isFailedOrSkipped) {
    return _getNextActivityInfoOnFailure(currentStepActivities, lastActivity);
  }

  logger.error(`Pix1D - Unexpected status '${lastActivity.status}' on last activity with id: '${lastActivity.id}'`);
  return END_OF_MISSION;
}

function _isStartingMission(activities) {
  return activities.length === 0;
}

function _hasRunActivityLevel3Times(activities, activityLevel) {
  return _nbOfActivitiesOfLevel(activities, activityLevel) >= 3;
}

function _lastActivity(activities) {
  return activities[0];
}

function _hasValidatedTheMissionUsingTutorialInFinalStep(lastActivity, currentStepActivities, stepCount) {
  return _hasValidatedTheMission(lastActivity, stepCount) && _hasAlreadyDoneActivity(currentStepActivities, TUTORIAL);
}

function _hasValidatedTheMission(lastActivity, stepCount) {
  return lastActivity.isValidation && lastActivity.stepIndex === stepCount - 1;
}

/**
 * @param {[Activity]} currentStepActivities
 * @param {Activity} lastActivity
 * @param {number} stepCount
 */
function _getNextActivityInfoAfterSuccess(currentStepActivities, lastActivity, stepCount) {
  if (_hasValidatedTheMissionUsingTutorialInFinalStep(lastActivity, currentStepActivities, stepCount)) {
    return END_OF_MISSION;
  }
  const nextActivityLevel = lastActivity.higherLevel;

  if (nextActivityLevel !== Activity.END_OF_STEP) {
    return new ActivityInfo({ stepIndex: lastActivity.stepIndex, level: nextActivityLevel });
  }

  const isLastStep = lastActivity.stepIndex === stepCount - 1;
  if (isLastStep) {
    return new ActivityInfo({ level: Activity.levels.CHALLENGE });
  } else {
    return new ActivityInfo({ stepIndex: lastActivity.stepIndex + 1, level: Activity.levels.VALIDATION });
  }
}

function _getNextActivityInfoOnFailure(activities, lastActivity) {
  if (lastActivity.isValidation && _neverDoneActivity(activities, TRAINING)) {
    return new ActivityInfo({ stepIndex: lastActivity.stepIndex, level: TRAINING });
  }
  return new ActivityInfo({ stepIndex: lastActivity.stepIndex, level: TUTORIAL });
}

function _nbOfActivitiesOfLevel(activities, level) {
  return activities.filter((activity) => activity.isLevel(level)).length;
}

function _hasAlreadyDoneActivity(activities, level) {
  return _nbOfActivitiesOfLevel(activities, level) !== 0;
}

function _neverDoneActivity(activities, level) {
  return _nbOfActivitiesOfLevel(activities, level) === 0;
}
