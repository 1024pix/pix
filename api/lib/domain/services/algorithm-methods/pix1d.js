import { Activity } from '../../models/Activity.js';
export { getNextActivityLevel };
function getNextActivityLevel(activities) {
  const activityLevels = [
    Activity.levels.TUTORIAL,
    Activity.levels.TRAINING,
    Activity.levels.VALIDATION,
    Activity.levels.CHALLENGE,
  ];
  if (activities.length === 0) {
    return Activity.levels.VALIDATION;
  }
  if (activities.filter((activity) => activity.level === Activity.levels.VALIDATION).length >= 3) {
    return undefined;
  }
  if (
    activities.filter((activity) => activity.level === Activity.levels.TRAINING).length === 3 &&
    activities[0].status === Activity.status.FAILED
  ) {
    return undefined;
  }
  if (activities[0].status === Activity.status.SUCCEEDED || activities[0].status === Activity.status.STARTED) {
    if (activities.find((activity) => activity.level === Activity.levels.TUTORIAL) === undefined) {
      return activityLevels[activityLevels.indexOf(activities[0].level) + 1];
    } else {
      switch (activities[0].level) {
        case Activity.levels.TUTORIAL:
          return Activity.levels.TRAINING;
        case Activity.levels.TRAINING:
          return Activity.levels.VALIDATION;
        default:
          return undefined;
      }
    }
  } else {
    if (activities.find((activity) => activity.level === Activity.levels.TRAINING) === undefined) {
      if (activities[0].level === Activity.levels.VALIDATION) {
        return Activity.levels.TRAINING;
      }
    } else {
      switch (activities[0].level) {
        case Activity.levels.TRAINING:
          return Activity.levels.TUTORIAL;
        case Activity.levels.VALIDATION:
          return Activity.levels.TUTORIAL;
        default:
          return undefined;
      }
    }
  }
}
