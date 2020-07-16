import ENV from 'mon-pix/config/environment';
const PREVIEW_UNIQUE_STEP = 1;
const PREVIEW_UNIQUE_CURRENT_STEP_INDEX = 0;

function getMaxStepsNumber(assessment) {
  if (assessment.isPreview) {
    return PREVIEW_UNIQUE_STEP;
  }

  if (assessment.hasCheckpoints) {
    return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
  }

  if (assessment.isCertification) {
    return assessment.get('certificationCourse.nbChallenges');
  }

  return assessment.get('course.nbChallenges');
}

function getCurrentStepIndex(assessment, answerId) {
  if (assessment.isPreview) {
    return PREVIEW_UNIQUE_CURRENT_STEP_INDEX;
  }
  const persistedAnswersIds = assessment.hasMany('answers').ids().filter((id) => id != null);
  const currentAnswerId = answerId;

  let index = persistedAnswersIds.indexOf(currentAnswerId);

  if (index === -1) {
    index = persistedAnswersIds.length;
  }

  return index % getMaxStepsNumber(assessment);
}

function getCurrentStepNumber(assessment, answerId) {
  return getCurrentStepIndex(assessment, answerId) + 1;
}

export {
  getMaxStepsNumber,
  getCurrentStepIndex,
  getCurrentStepNumber,
};
