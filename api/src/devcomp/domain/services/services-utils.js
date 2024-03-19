import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';

const ALL_TOLERANCES = ['t1', 't2', 't3'];

function getEnabledTolerances(shouldApplyTolerances, deactivations) {
  return shouldApplyTolerances ? ALL_TOLERANCES.filter((tolerance) => !deactivations[tolerance]) : [];
}

function useLevenshteinRatio(enabledTolerances) {
  return _.includes(enabledTolerances, 't3');
}

export { getEnabledTolerances, useLevenshteinRatio };
