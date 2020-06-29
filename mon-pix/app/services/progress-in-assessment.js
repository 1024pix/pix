import Service  from '@ember/service';
import ENV from '../config/environment';

function _getMaxStepsNumber(assessment) {
  if (assessment.hasCheckpoints) {
    return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
  }

  if (assessment.isCertification) {
    return assessment.get('certificationCourse.nbChallenges');
  }

  return assessment.get('course.nbChallenges');
}
function _getCurrentStepIndex(assessment, answerId) {
  const persistedAnswersIds = assessment.hasMany('answers').ids().filter((id) => id != null);
  const currentAnswerId = answerId;

  let index = persistedAnswersIds.indexOf(currentAnswerId);

  if (index === -1) {
    index = persistedAnswersIds.length;
  }

  return index % _getMaxStepsNumber(assessment);
}

export default class ProgressInEvaluation extends Service {
  getCurrentStepIndex(assessment, answerId) {
    return _getCurrentStepIndex(assessment, answerId);
  }

  getMaxStepsNumber(assessment) {
    return _getMaxStepsNumber(assessment);
  }

  getCurrentStepNumber(assessment, answerId) {
    return _getCurrentStepIndex(assessment, answerId) + 1;
  }

}
