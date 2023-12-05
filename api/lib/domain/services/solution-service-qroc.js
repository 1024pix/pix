import {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
} from '../../../src/shared/infrastructure/utils/string-utils.js';
import lodash from 'lodash';
import { applyTreatments, applyPreTreatments } from './validation-treatments.js';
import { validateAnswer } from './string-comparison-service.js';
import { AnswerStatus } from '../../../src/shared/domain/models/AnswerStatus.js';
import { getEnabledTreatments, useLevenshteinRatio } from './services-utils.js';
const CHALLENGE_NUMBER_FORMAT = 'nombre';
const { every, isEmpty, isString, map } = lodash;

const match = function ({ answer, challengeFormat, solution }) {
  const solutionValue = solution.value;
  const deactivations = solution.deactivations;
  const qrocBlocksTypes = solution.qrocBlocksTypes || {};
  const shouldApplyTreatments = qrocBlocksTypes[Object.keys(qrocBlocksTypes)[0]] === 'select' ? false : true;

  const isIncorrectAnswerFormat = !isString(answer);
  const isIncorrectSolutionFormat = !isString(solutionValue) || isEmpty(solutionValue);

  if (isIncorrectAnswerFormat || isIncorrectSolutionFormat) {
    return AnswerStatus.KO;
  }

  const solutions = splitIntoWordsAndRemoveBackspaces(solutionValue);
  const areAllNumericSolutions = every(solutions, (solution) => {
    return isNumeric(solution);
  });

  if (isNumeric(answer) && areAllNumericSolutions && challengeFormat === CHALLENGE_NUMBER_FORMAT) {
    return _getAnswerStatusFromNumberMatching(answer, solutions);
  }

  return _getAnswerStatusFromStringMatching(answer, solutions, deactivations, shouldApplyTreatments);
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
