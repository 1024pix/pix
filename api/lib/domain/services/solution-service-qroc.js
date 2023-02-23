const {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
} = require('../../../lib/infrastructure/utils/string-utils.js');
const { every, isEmpty, isString, map } = require('lodash');
const { applyTreatments, applyPreTreatments } = require('./validation-treatments.js');
const { validateAnswer } = require('./string-comparison-service.js');

const AnswerStatus = require('../models/AnswerStatus.js');

const { getEnabledTreatments, useLevenshteinRatio } = require('./services-utils.js');
const CHALLENGE_NUMBER_FORMAT = 'nombre';

module.exports = {
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
