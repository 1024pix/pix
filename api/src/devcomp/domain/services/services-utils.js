import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';

const ALL_TREATMENTS = ['t1', 't2', 't3'];

function getEnabledTreatments(shouldApplyTreatments, deactivations) {
  return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

function useLevenshteinRatio(enabledTreatments) {
  return _.includes(enabledTreatments, 't3');
}

export { getEnabledTreatments, useLevenshteinRatio };
