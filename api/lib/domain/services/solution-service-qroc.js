const utils = require('./solution-service-utils');
const deactivationsService = require('../../../lib/domain/services/deactivations-service');
const {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
} = require('../../../lib/infrastructure/utils/string-utils');
const { every, includes, isEmpty, isString, map } = require('lodash');
const { applyTreatments, applyPreTreatments } = require('./validation-treatments');

const AnswerStatus = require('../models/AnswerStatus');

const LEVENSHTEIN_DISTANCE_MAX_RATE = 0.25;
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
  const treatedAnswer = applyPreTreatments(answer);
  const treatedSolutions = _applyTreatmentsToSolutions(solutions, deactivations, shouldApplyTreatments);
  const validations = utils.treatmentT1T2T3(treatedAnswer, treatedSolutions, shouldApplyTreatments);
  return _getAnswerStatusAccordingToLevenshteinDistance(validations, deactivations);
}

function _applyTreatmentsToSolutions(solutions, deactivations, shouldApplyTreatments) {
  return map(solutions, (solution) => {
    if (shouldApplyTreatments === false) {
      return solution;
    }

    const allTreatments = ['t1', 't2', 't3'];
    const enabledTreatments = allTreatments.filter((treatment) => !deactivations[treatment]);
    return applyTreatments(solution, enabledTreatments);
  });
}

function _getAnswerStatusAccordingToLevenshteinDistance(validations, deactivations) {
  if (deactivationsService.isDefault(deactivations)) {
    if (validations.t1t2t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasOnlyT1(deactivations)) {
    if (validations.t2t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasOnlyT2(deactivations)) {
    if (validations.t1t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasOnlyT3(deactivations)) {
    if (includes(validations.adminAnswers, validations.t1t2)) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasOnlyT1T2(deactivations)) {
    if (validations.t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasOnlyT1T3(deactivations)) {
    if (includes(validations.adminAnswers, validations.t2)) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasOnlyT2T3(deactivations)) {
    if (includes(validations.adminAnswers, validations.t1)) {
      return AnswerStatus.OK;
    }
  } else if (deactivationsService.hasT1T2T3(deactivations)) {
    if (includes(validations.adminAnswers, validations.userAnswer)) {
      return AnswerStatus.OK;
    }
  }
  return AnswerStatus.KO;
}
