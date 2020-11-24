const utils = require('./solution-service-utils');
const deactivationsService = require('../../../lib/domain/services/deactivations-service');
const { isNumeric, splitIntoWordsAndRemoveBackspaces, cleanStringAndParseFloat } = require('../../../lib/infrastructure/utils/string-utils');
const { every, includes, isEmpty, isString, map } = require('lodash');
const {
  normalizeAndRemoveAccents,
  removeSpecialCharacters,
  applyPreTreatments,
} = require('./validation-treatments');

const AnswerStatus = require('../models/AnswerStatus');

const LEVENSHTEIN_DISTANCE_MAX_RATE = 0.25;

module.exports = {

  match(answer, solution, deactivations) {

    const isIncorrectAnswerFormat = !isString(answer);
    const isIncorrectSolutionFormat = !isString(solution) || isEmpty(solution);

    if (isIncorrectAnswerFormat || isIncorrectSolutionFormat) {
      return AnswerStatus.KO;
    }

    const solutions = splitIntoWordsAndRemoveBackspaces(solution);
    const areAllNumericSolutions = every(solutions, (solution) => {
      return isNumeric(solution);
    });

    if (isNumeric(answer) && areAllNumericSolutions) {
      return _getAnswerStatusFromNumberMatching(answer, solution);
    }

    return _getAnswerStatusFromStringMatching(answer, solutions, deactivations);
  },
};

function _getAnswerStatusFromNumberMatching(answer, solution) {
  if (cleanStringAndParseFloat(answer) === cleanStringAndParseFloat(solution)) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
}

function _getAnswerStatusFromStringMatching(answer, solutions, deactivations) {
  const treatedAnswer = applyPreTreatments(answer);
  const treatedSolutions = _applyTreatmentsToSolutions(solutions, deactivations);
  const validations = utils.treatmentT1T2T3(treatedAnswer, treatedSolutions);
  return _getAnswerStatusAccordingToLevenshteinDistance(validations, deactivations);
}

function _applyTreatmentsToSolutions(solutions, deactivations) {
  return map(solutions, (solution) => {

    if (deactivationsService.isDefault(deactivations)) {
      const normalizedWithoutAccentsSolution = normalizeAndRemoveAccents(solution);
      return removeSpecialCharacters(normalizedWithoutAccentsSolution);
    }
    else if (deactivationsService.hasOnlyT1(deactivations)) {
      return removeSpecialCharacters(solution);
    }
    else if (deactivationsService.hasOnlyT2(deactivations)) {
      return normalizeAndRemoveAccents(solution);
    }
    else if (deactivationsService.hasOnlyT3(deactivations)) {
      const normalizedWithoutAccentsSolution = normalizeAndRemoveAccents(solution);
      return removeSpecialCharacters(normalizedWithoutAccentsSolution);
    }
    else if (deactivationsService.hasOnlyT1T2(deactivations)) {
      return solution;
    }
    else if (deactivationsService.hasOnlyT1T3(deactivations)) {
      return removeSpecialCharacters(solution);
    }
    else if (deactivationsService.hasOnlyT2T3(deactivations)) {
      return normalizeAndRemoveAccents(solution);
    }
    else if (deactivationsService.hasT1T2T3(deactivations)) {
      return solution;
    }
  });
}

function _getAnswerStatusAccordingToLevenshteinDistance(validations, deactivations) {

  if (deactivationsService.isDefault(deactivations)) {
    if (validations.t1t2t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasOnlyT1(deactivations)) {
    if (validations.t2t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasOnlyT2(deactivations)) {
    if (validations.t1t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasOnlyT3(deactivations)) {
    if (includes(validations.adminAnswers, validations.t1t2)) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasOnlyT1T2(deactivations)) {
    if (validations.t3Ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasOnlyT1T3(deactivations)) {
    if (includes(validations.adminAnswers, validations.t2)) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasOnlyT2T3(deactivations)) {
    if (includes(validations.adminAnswers, validations.t1)) {
      return AnswerStatus.OK;
    }
  }
  else if (deactivationsService.hasT1T2T3(deactivations)) {
    if (includes(validations.adminAnswers, validations.userAnswer)) {
      return AnswerStatus.OK;
    }
  }
  return AnswerStatus.KO;
}
