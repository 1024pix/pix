import { Activity } from '../../models/Activity.js';
import { logger } from '../../../infrastructure/logger.js';

export { getNextActivityLevel };

const { TUTORIAL, TRAINING, VALIDATION, CHALLENGE } = Activity.levels;
const { SUCCEEDED, FAILED, SKIPPED } = Activity.status;

function getNextActivityLevel(activities) {
  if (activities.length === 0) {
    return VALIDATION;
  }
  if (_nbOfActivitiesOfLevel(activities, VALIDATION) >= 3) {
    return undefined;
  }
  const lastActivity = activities[0];
  if (_nbOfActivitiesOfLevel(activities, TRAINING) === 3 && (_hasFailed(lastActivity) || _hasSkipped(lastActivity))) {
    return undefined;
  }
  if (_hasSucceeded(lastActivity)) {
    if (_alreadyDoneActivity(activities, TUTORIAL) && lastActivity.level === VALIDATION) {
      return undefined;
    } else {
      return _higherLevelActivity(lastActivity);
    }
  } else if (_hasFailed(lastActivity) || _hasSkipped(lastActivity)) {
    if (_neverDoneActivity(activities, TRAINING)) {
      if (lastActivity.level === VALIDATION) {
        return TRAINING;
      }
    } else {
      if (lastActivity.level === CHALLENGE) {
        return undefined;
      }
      return TUTORIAL;
    }
  } else {
    logger.error(`Pix1D - Unexpected status '${lastActivity.status}' on last activity with id: '${lastActivity.id}'`);
  }
  return undefined;
}

function _nbOfActivitiesOfLevel(activities, level) {
  return activities.filter((activity) => activity.level === level).length;
}

function _alreadyDoneActivity(activities, level) {
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
  const orderedActivityLevels = [TUTORIAL, TRAINING, VALIDATION, CHALLENGE];

  return orderedActivityLevels[orderedActivityLevels.indexOf(lastActivity.level) + 1];
}
