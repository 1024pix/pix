import ENV from 'mon-pix/config/environment';
const ONE_STEP = 1;

function getMaxStepsNumber(assessment) {
  if (assessment.isPreview) {
    return ONE_STEP;
  }
  if (assessment.isFlash) {
    return ENV.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD;
  }
  if (assessment.isCertification) {
    return assessment.get('certificationCourse.nbChallenges');
  }
  if (assessment.hasCheckpoints) {
    return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
  }
  if (assessment.get('course')) {
    return assessment.get('course.nbChallenges');
  }
  return ONE_STEP;
}

function getCurrentStepIndex(assessment, currentChallengeNumber) {
  return currentChallengeNumber % getMaxStepsNumber(assessment);
}

function getCurrentStepNumber(assessment, currentChallengeNumber) {
  return getCurrentStepIndex(assessment, currentChallengeNumber) + 1;
}

export default { getMaxStepsNumber, getCurrentStepIndex, getCurrentStepNumber };
