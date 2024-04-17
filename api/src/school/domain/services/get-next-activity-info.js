import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { Activity } from '../models/Activity.js';
import { ActivityInfo } from '../models/ActivityInfo.js';

export const END_OF_MISSION = Symbol('END_OF_MISSION');
const END_OF_STEP = Symbol('END_OF_STEP');

const { TUTORIAL, TRAINING, VALIDATION, CHALLENGE } = Activity.levels;
const { SUCCEEDED, FAILED, SKIPPED } = Activity.status;
const SAME_ACTIVITY_RUN_MAX_NB = 3;

export function getNextActivityInfo(activities) {
  if (_isStartingMission(activities)) {
    return new ActivityInfo({ stepIndex: 0, level: VALIDATION });
  }
  if (_hasRunMaxNbOfActivityLevel(activities, VALIDATION)) {
    return END_OF_MISSION;
  }
  const lastActivity = _lastActivity(activities);
  if (
    (_hasRunMaxNbOfActivityLevel(activities, TRAINING) && _hasFailedOrSkipped(lastActivity)) ||
    lastActivity.level === Activity.levels.CHALLENGE
  ) {
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
  }
  const nextActivityLevel = _higherLevelActivity(lastActivity);
  if (nextActivityLevel === END_OF_STEP) {
    // only one step for the moment, so next level is CHALLENGE
    return new ActivityInfo({ level: Activity.levels.CHALLENGE });
  }
  return new ActivityInfo({ stepIndex: 0, level: nextActivityLevel });
}

function _getNextActivityInfoOnFailure(activities, lastActivity) {
  if (lastActivity.level === CHALLENGE) {
    return END_OF_MISSION;
  }
  if (lastActivity.level === VALIDATION && _neverDoneActivity(activities, TRAINING)) {
    return new ActivityInfo({ stepIndex: 0, level: TRAINING });
  }
  return new ActivityInfo({ stepIndex: 0, level: TUTORIAL });
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
  const orderedActivityLevels = [Activity.levels.TUTORIAL, Activity.levels.TRAINING, Activity.levels.VALIDATION];

  return orderedActivityLevels[orderedActivityLevels.indexOf(lastActivity.level) + 1] ?? END_OF_STEP;
}
