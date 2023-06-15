import { Activity } from '../../models/Activity.js';

export { getNextActivityLevel };

function getNextActivityLevel(activities) {
  if (activities.length === 0) {
    return Activity.levels.VALIDATION;
  }
  if (_nbOfActivitiesOfLevel(activities, Activity.levels.VALIDATION) >= 3) {
    return undefined;
  }
  const lastActivity = activities[0];
  if (
    _nbOfActivitiesOfLevel(activities, Activity.levels.TRAINING) === 3 &&
    lastActivity.status === Activity.status.FAILED
  ) {
    return undefined;
  }
  if (_hasSucceeded(lastActivity)) {
    if (
      _nbOfActivitiesOfLevel(activities, Activity.levels.TUTORIAL) !== 0 &&
      lastActivity.level === Activity.levels.VALIDATION
    ) {
      return undefined;
    } else {
      return _higherLevelActivity(lastActivity);
    }
  } else {
    if (_nbOfActivitiesOfLevel(activities, Activity.levels.TRAINING) === 0) {
      if (lastActivity.level === Activity.levels.VALIDATION) {
        return Activity.levels.TRAINING;
      }
    } else {
      if (lastActivity.level === Activity.levels.TRAINING || lastActivity.level === Activity.levels.VALIDATION) {
        return Activity.levels.TUTORIAL;
      } else {
        return undefined;
      }
    }
  }
}

function _nbOfActivitiesOfLevel(activities, level) {
  return activities.filter((activity) => activity.level === level).length;
}

function _hasSucceeded(lastActivity) {
  return lastActivity.status === Activity.status.SUCCEEDED;
}

function _higherLevelActivity(lastActivity) {
  const orderedActivityLevels = [
    Activity.levels.TUTORIAL,
    Activity.levels.TRAINING,
    Activity.levels.VALIDATION,
    Activity.levels.CHALLENGE,
  ];

  return orderedActivityLevels[orderedActivityLevels.indexOf(lastActivity.level) + 1];
}
