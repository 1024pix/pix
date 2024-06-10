import levenshtein from 'fast-levenshtein';

import { LEVENSHTEIN_DISTANCE_MAX_RATE } from '../../../shared/domain/constants.js';
import { AnswerStatus } from '../../../shared/domain/models/AnswerStatus.js';
import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { useLevenshteinRatio } from './services-utils.js';
import { applyTolerances } from './validation-tolerances.js';

function match({ answerValue, solution }) {
  const solutionValue = solution.value;
  const enabledTolerances = solution.enabledTolerances;
  const qrocBlocksTypes = solution.qrocBlocksTypes || {};

  // Input checking
  if (
    _.isString(solutionValue) ||
    _.isEmpty(solutionValue) ||
    _.isString(answerValue) ||
    _.isEmpty(answerValue) ||
    _.isString(enabledTolerances) ||
    _.isEmpty(enabledTolerances)
  ) {
    return { result: AnswerStatus.KO };
  }

  // Sets comparison
  if (!_areAnswersComparableToSolutions(answerValue, solutionValue)) {
    throw new Error('An error occurred because there is no solution found for an answer.');
  }

  // Tolerances
  const treatedSolutions = _applyTolerancesToSolutions(solutionValue, enabledTolerances, qrocBlocksTypes);
  const treatedAnswers = _applyTolerancesToAnswers(answerValue, enabledTolerances, qrocBlocksTypes);

  // Comparison
  const resultDetails = _compareAnswersAndSolutions(
    treatedAnswers,
    treatedSolutions,
    enabledTolerances,
    qrocBlocksTypes,
  );

  // Restitution
  return {
    result: _formatResult(resultDetails),
    resultDetails: resultDetails,
  };
}

function _applyTolerancesToSolutions(solutions, enabledTolerances, qrocBlocksTypes = {}) {
  const treatedSolutions = {};
  for (const solutionKey in solutions) {
    const solutionVariants = solutions[solutionKey];
    const solutionType = qrocBlocksTypes[solutionKey];

    treatedSolutions[solutionKey] = solutionVariants.map((variant) => {
      if (solutionType === 'select') {
        return applyTolerances(variant, []);
      }

      const tolerancesForVariant = enabledTolerances[solutionKey];

      return applyTolerances(variant, tolerancesForVariant);
    });
  }

  return treatedSolutions;
}

function _applyTolerancesToAnswers(answers, enabledTolerances, qrocBlocksTypes = {}) {
  const treatedAnswers = {};
  for (const answerKey in answers) {
    const answer = answers[answerKey];
    const answerType = qrocBlocksTypes[answerKey];
    if (answerType === 'select') {
      treatedAnswers[answerKey] = applyTolerances(answer, []);
    } else {
      const tolerancesForAnswer = enabledTolerances[answerKey];
      treatedAnswers[answerKey] = applyTolerances(answer, tolerancesForAnswer);
    }
  }

  return treatedAnswers;
}

function _areApproximatelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants) {
  let smallestLevenshteinDistance = answer.length;
  for (const variant of solutionVariants) {
    const levenshteinDistance = levenshtein.get(answer, variant);
    smallestLevenshteinDistance = Math.min(smallestLevenshteinDistance, levenshteinDistance);
  }
  const ratio = smallestLevenshteinDistance / answer.length;
  return ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE;
}

function _areAnswersComparableToSolutions(answers, solutions) {
  for (const answerKey in answers) {
    const solutionVariants = solutions[answerKey];
    if (!solutionVariants) {
      logger.warn(
        `[ERREUR CLE ANSWER] La clé ${answerKey} n'existe pas. Première clé de l'épreuve : ${
          Object.keys(solutions)[0]
        }`,
      );
      return false;
    }
  }
  return true;
}

function _compareAnswersAndSolutions(answers, solutions, enabledTolerances, qrocBlocksTypes = {}) {
  const results = {};
  for (const answerKey in answers) {
    const answer = answers[answerKey];
    const solutionVariants = solutions[answerKey];

    if (useLevenshteinRatio(enabledTolerances[answerKey]) && qrocBlocksTypes[answerKey] !== 'select') {
      results[answerKey] = _areApproximatelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants);
    } else if (solutionVariants) {
      results[answerKey] = solutionVariants.includes(answer);
    }
  }

  return results;
}

function _formatResult(resultDetails) {
  for (const resultDetail of Object.values(resultDetails)) {
    if (!resultDetail) {
      return AnswerStatus.KO;
    }
  }
  return AnswerStatus.OK;
}

export default {
  _applyTolerancesToAnswers,
  _applyTolerancesToSolutions,
  _areAnswersComparableToSolutions,
  _compareAnswersAndSolutions,
  _formatResult,
  match,
};
