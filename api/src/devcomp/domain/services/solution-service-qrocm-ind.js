import levenshtein from 'fast-levenshtein';

import { LEVENSHTEIN_DISTANCE_MAX_RATE } from '../../../shared/domain/constants.js';
import { AnswerStatus } from '../../../shared/domain/models/AnswerStatus.js';
import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { useLevenshteinRatio } from './services-utils.js';
import { applyTreatments } from './validation-treatments.js';

function match({ answerValue, solution }) {
  const solutionValue = solution.value;
  const enabledTreatments = solution.enabledTreatments;
  const qrocBlocksTypes = solution.qrocBlocksTypes || {};

  // Input checking
  if (_.isString(solutionValue) || _.isEmpty(solutionValue) || _.isString(answerValue) || _.isEmpty(answerValue)) {
    return { result: AnswerStatus.KO };
  }

  // Treatments
  const treatedSolutions = _applyTreatmentsToSolutions(solutionValue, enabledTreatments, qrocBlocksTypes);
  const treatedAnswers = _applyTreatmentsToAnswers(answerValue, enabledTreatments, qrocBlocksTypes);

  // Comparison
  const resultDetails = _compareAnswersAndSolutions(
    treatedAnswers,
    treatedSolutions,
    enabledTreatments,
    qrocBlocksTypes,
  );

  // Restitution
  return {
    result: _formatResult(resultDetails),
    resultDetails: resultDetails,
  };
}

function _applyTreatmentsToSolutions(solutions, enabledTreatments, qrocBlocksTypes = {}) {
  return _.forEach(solutions, (solution, solutionKey) => {
    solution.forEach((variant, variantIndex) => {
      if (qrocBlocksTypes[solutionKey] === 'select') {
        solutions[solutionKey][variantIndex] = applyTreatments(variant, []);
      } else {
        solutions[solutionKey][variantIndex] = applyTreatments(variant, enabledTreatments);
      }
    });
  });
}

function _applyTreatmentsToAnswers(answers, enabledTreatments, qrocBlocksTypes = {}) {
  return _.forEach(answers, (answer, answerKey) => {
    if (qrocBlocksTypes[answerKey] === 'select') {
      answers[answerKey] = applyTreatments(answer, []);
    } else {
      answers[answerKey] = applyTreatments(answer, enabledTreatments);
    }
  });
}

function _areApproximatelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants) {
  let smallestLevenshteinDistance = answer.length;
  solutionVariants.forEach((variant) => {
    const levenshteinDistance = levenshtein.get(answer, variant);
    smallestLevenshteinDistance = Math.min(smallestLevenshteinDistance, levenshteinDistance);
  });
  const ratio = smallestLevenshteinDistance / answer.length;
  return ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE;
}

function _compareAnswersAndSolutions(answers, solutions, enabledTreatments, qrocBlocksTypes = {}) {
  const results = {};
  _.map(answers, (answer, answerKey) => {
    const solutionVariants = solutions[answerKey];
    if (!solutionVariants) {
      logger.warn(
        `[ERREUR CLE ANSWER] La clé ${answerKey} n'existe pas. Première clé de l'épreuve : ${
          Object.keys(solutions)[0]
        }`,
      );
      throw new Error('An error occurred because there is no solution found for an answer.');
    }
    if (useLevenshteinRatio(enabledTreatments) && qrocBlocksTypes[answerKey] != 'select') {
      results[answerKey] = _areApproximatelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants);
    } else if (solutionVariants) {
      results[answerKey] = solutionVariants.includes(answer);
    }
  });
  return results;
}

function _formatResult(resultDetails) {
  let result = AnswerStatus.OK;
  _.forEach(resultDetails, (resultDetail) => {
    if (!resultDetail) {
      result = AnswerStatus.KO;
    }
  });
  return result;
}

export { _applyTreatmentsToAnswers, _applyTreatmentsToSolutions, _compareAnswersAndSolutions, _formatResult, match };
