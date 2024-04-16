import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { Activity } from '../models/Activity.js';

const END_OF_MISSION = undefined;

export const pix1dService = { getNextActivityInfo, END_OF_MISSION };

const { TUTORIAL, TRAINING, VALIDATION, CHALLENGE } = Activity.levels;
const { SUCCEEDED, FAILED, SKIPPED } = Activity.status;
const orderedActivityLevels = Activity.orderedActivityLevels;

const SAME_ACTIVITY_RUN_MAX_NB = 3;

function getNextActivityInfo(activities) {
  if (_isStartingMission(activities)) {
    return VALIDATION;
  }
  if (_hasRunMaxNbOfActivityLevel(activities, VALIDATION)) {
    return END_OF_MISSION;
  }
  const lastActivity = _lastActivity(activities);
  if (_hasRunMaxNbOfActivityLevel(activities, TRAINING) && _hasFailedOrSkipped(lastActivity)) {
    return END_OF_MISSION;
  }
  if (_hasSucceeded(lastActivity)) {
    return _getNextActivityInfoAfterSuccess(activities, lastActivity);
  } else if (_hasFailedOrSkipped(lastActivity)) {
    return _getNextActivityInfoOnFailure(activities, lastActivity);
  } else {
    logger.error(`Pix1D - Unexpected status '${lastActivity.status}' on last activity with id: '${lastActivity.id}'`);
  }
  return END_OF_MISSION;
}

function _hasFailedOrSkipped(lastActivity) {
  return _hasFailed(lastActivity) || _hasSkipped(lastActivity);
}

function _isStartingMission(activities) {
  return activities.length === 0;
}

function _hasRunMaxNbOfActivityLevel(activities, activityLevel) {
  return _nbOfActivitiesOfLevel(activities, activityLevel) >= SAME_ACTIVITY_RUN_MAX_NB;
}

function _lastActivity(activities) {
  return activities[0];
}

function _hasValidatedTheMissionUsingTutorial(lastActivity, activities) {
  return lastActivity.level === VALIDATION && _hasAlreadyDoneActivity(activities, TUTORIAL);
}

function _getNextActivityInfoAfterSuccess(activities, lastActivity) {
  if (_hasValidatedTheMissionUsingTutorial(lastActivity, activities)) {
    return END_OF_MISSION;
  } else {
    return _higherLevelActivity(lastActivity);
  }
}

function _getNextActivityInfoOnFailure(activities, lastActivity) {
  if (lastActivity.level === CHALLENGE) {
    return END_OF_MISSION;
  }
  if (lastActivity.level === VALIDATION && _neverDoneActivity(activities, TRAINING)) {
    return TRAINING;
  }
  return TUTORIAL;
}

function _nbOfActivitiesOfLevel(activities, level) {
  return activities.filter((activity) => activity.level === level).length;
}

function _hasAlreadyDoneActivity(activities, level) {
  return _nbOfActivitiesOfLevel(activities, level) !== 0;
}

function _neverDoneActivity(activities, level) {
  return _nbOfActivitiesOfLevel(activities, level) === 0;
}

function _hasSucceeded(lastActivity) {
  return lastActivity.status === SUCCEEDED;
}

function _hasFailed(lastActivity) {
  return lastActivity.status === FAILED;
}

function _hasSkipped(lastActivity) {
  return lastActivity.status === SKIPPED;
}

function _higherLevelActivity(lastActivity) {
  return orderedActivityLevels[orderedActivityLevels.indexOf(lastActivity.level) + 1];
}
