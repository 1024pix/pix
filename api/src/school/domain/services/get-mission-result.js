import _ from 'lodash';

export const results = {
  REACHED: 'reached',
  NOT_REACHED: 'not-reached',
  PARTIALLY_REACHED: 'partially-reached',
  EXCEEDED: 'exceeded',
};

const { REACHED, EXCEEDED, NOT_REACHED, PARTIALLY_REACHED } = results;

export function getMissionResult({ activities }) {
  if (hasSucceededDare(activities)) {
    return EXCEEDED;
  }

  if (hasValidatedEverySteps(activities)) {
    return REACHED;
  }

  if (hasValidatedFirstStep(activities)) {
    return PARTIALLY_REACHED;
  }

  return NOT_REACHED;
}

function hasSucceededDare(activities) {
  return activities.some((activity) => activity.isDare && activity.isSucceeded);
}

function hasValidatedEverySteps(activities) {
  const activitiesWithoutDare = activities.filter((activity) => !activity.isDare);
  const missionsByStepIndex = _.groupBy(activitiesWithoutDare, 'stepIndex');
  return Object.entries(missionsByStepIndex).every(([stepIndex, stepActivities]) => {
    return hasValidatedStep(stepActivities, Number(stepIndex));
  });
}

function hasValidatedStep(activities, stepIndex) {
  return activities.some((activity) => {
    return activity.stepIndex === stepIndex && activity.isValidation && activity.isSucceeded;
  });
}

function hasValidatedFirstStep(activities) {
  return hasValidatedStep(activities, 0);
}
