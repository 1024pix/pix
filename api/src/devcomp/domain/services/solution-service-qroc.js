import { cleanStringAndParseFloat, isNumeric } from '../../../shared/infrastructure/utils/string-utils.js';
import lodash from 'lodash';
import { applyPreTreatments, applyTreatments } from '../../../../lib/domain/services/validation-treatments.js';
import { validateAnswer } from '../../../../lib/domain/services/string-comparison-service.js';
import { AnswerStatus } from '../models/validator/AnswerStatus.js';
import { getEnabledTreatments, useLevenshteinRatio } from '../../../../lib/domain/services/services-utils.js';

const CHALLENGE_NUMBER_FORMAT = 'nombre';
const { every, isEmpty, isString, map } = lodash;

const match = function ({ answer, challengeFormat, solutions }) {
  const deactivations = solutions.deactivations;
  const qrocBlocksTypes = solutions.qrocBlocksTypes || {};
  const shouldApplyTreatments = qrocBlocksTypes[Object.keys(qrocBlocksTypes)[0]] === 'select' ? false : true;

  const isIncorrectAnswerFormat = !isString(answer);
  const isIncorrectSolutionFormat = solutions.value?.some((s) => !isString(s) || isEmpty(s));

  if (isIncorrectAnswerFormat || isIncorrectSolutionFormat) {
    return AnswerStatus.KO;
  }

  const solutionsValue = solutions.value;
  const areAllNumericSolutions = every(solutionsValue, (solution) => {
    return isNumeric(solution);
  });

  if (isNumeric(answer) && areAllNumericSolutions && challengeFormat === CHALLENGE_NUMBER_FORMAT) {
    return _getAnswerStatusFromNumberMatching(answer, solutionsValue);
  }

  return _getAnswerStatusFromStringMatching(answer, solutionsValue, deactivations, shouldApplyTreatments);
};

export { match };

function _getAnswerStatusFromNumberMatching(answer, solutions) {
  const treatedSolutions = solutions.map((solution) => cleanStringAndParseFloat(solution));
  const treatedAnswer = cleanStringAndParseFloat(answer);
  const indexOfSolution = treatedSolutions.indexOf(treatedAnswer);
  const isAnswerMatchingSolution = indexOfSolution !== -1;
  if (isAnswerMatchingSolution) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
}

function _getAnswerStatusFromStringMatching(answer, solutions, deactivations, shouldApplyTreatments) {
  const enabledTreatments = getEnabledTreatments(shouldApplyTreatments, deactivations);
  const treatedAnswer = applyTreatments(applyPreTreatments(answer), enabledTreatments);
  const treatedSolutions = map(solutions, (solution) => applyTreatments(solution, enabledTreatments));

  return validateAnswer(treatedAnswer, treatedSolutions, useLevenshteinRatio(enabledTreatments))
    ? AnswerStatus.OK
    : AnswerStatus.KO;
}
