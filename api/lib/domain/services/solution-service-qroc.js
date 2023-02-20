import {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
} from '../../../lib/infrastructure/utils/string-utils';
import { every, isEmpty, isString, map } from 'lodash';
import { applyTreatments, applyPreTreatments } from './validation-treatments';
import { validateAnswer } from './string-comparison-service';
import AnswerStatus from '../models/AnswerStatus';
import { getEnabledTreatments, useLevenshteinRatio } from './services-utils';
const CHALLENGE_NUMBER_FORMAT = 'nombre';

export default {
  match({ answer, challengeFormat, solution }) {
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
  },
};

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
