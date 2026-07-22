import { isCloseEnoughToOneOf } from '../../../shared/domain/services/string-similarity-service.js';

const ALL_TREATMENTS = ['t1', 't2', 't3'];

export function getEnabledTreatments(shouldApplyTreatments, deactivations) {
  return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

export function useLevenshteinRatio(enabledTreatments = []) {
  return enabledTreatments.includes('t3');
}

/**
 * Tells whether an answer is valid against a set of accepted solutions.
 * @param {string} answer - The answer to validate.
 * @param {string[]} [solutions=[]] - The accepted solutions to compare against.
 * @param {string[]} [enabledTreatments=[]] - The enabled treatment codes. `'t3'` turns on approximate matching.
 * @returns {boolean} `true` if the answer matches one of the solutions.
 */
export function isAnswerValid(answer, solutions = [], enabledTreatments) {
  if (useLevenshteinRatio(enabledTreatments)) {
    return isCloseEnoughToOneOf(answer, solutions);
  }
  return solutions.includes(answer);
}
