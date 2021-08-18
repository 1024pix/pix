import ENV from 'mon-pix/config/environment';
const PREVIEW_UNIQUE_STEP = 1;

function getMaxStepsNumber(assessment) {
  if (assessment.isPreview) {
    return PREVIEW_UNIQUE_STEP;
  }
  if (assessment.isCertification) {
    return assessment.get('certificationCourse.nbChallenges');
  }
  if (assessment.isDemo) {
    return assessment.get('course.nbChallenges');
  }
  if (assessment.hasCheckpoints) {
    return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
  }
  return assessment.get('course.nbChallenges');

}

function getCurrentStepIndex(assessment, currentChallengeNumber) {
  return currentChallengeNumber % getMaxStepsNumber(assessment);
}

function getCurrentStepNumber(assessment, currentChallengeNumber) {
  return getCurrentStepIndex(assessment, currentChallengeNumber) + 1;
}

export {
  getMaxStepsNumber,
  getCurrentStepIndex,
  getCurrentStepNumber,
};
