const {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
} = require('../../../lib/infrastructure/utils/string-utils');
const { every, includes, isEmpty, isString, map } = require('lodash');
const { applyTreatments, applyPreTreatments } = require('./validation-treatments');
const { validateAnswer } = require('./string-comparison-service');

const AnswerStatus = require('../models/AnswerStatus');

const { ALL_TREATMENTS } = require('../constants');
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

  const enabledTreatments = shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
  const treatedAnswer = applyTreatments(applyPreTreatments(answer), enabledTreatments);
  const treatedSolutions = map(solutions, solution => applyTreatments(solution, enabledTreatments));

  return validateAnswer(treatedAnswer, treatedSolutions, includes( enabledTreatments ,'t3') ) ? AnswerStatus.OK : AnswerStatus.KO;
}
