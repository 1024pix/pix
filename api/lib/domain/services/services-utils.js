import { ALL_TREATMENTS } from '../../../src/shared/domain/constants.js';
import { _ } from '../../../src/shared/infrastructure/utils/lodash-utils.js';

function getEnabledTreatments(shouldApplyTreatments, deactivations) {
  return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

function useLevenshteinRatio(enabledTreatments) {
  return _.includes(enabledTreatments, 't3');
}

export { getEnabledTreatments, useLevenshteinRatio };
