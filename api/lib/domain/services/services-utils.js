import { _ } from '../../../src/shared/infrastructure/utils/lodash-utils.js';
import { ALL_TREATMENTS } from '../constants.js';

function getEnabledTreatments(shouldApplyTreatments, deactivations) {
  return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

function useLevenshteinRatio(enabledTreatments) {
  return _.includes(enabledTreatments, 't3');
}

export { getEnabledTreatments, useLevenshteinRatio };
