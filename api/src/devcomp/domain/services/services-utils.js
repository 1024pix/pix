import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';

const ALL_TOLERANCES = [
  't1',
  't2',
  't3',
  't4',
  't5',
  't6',
  't7',
  't8',
  't9',
  't10',
  't11',
  't12',
  't13',
  't14',
  't15',
  't16',
  't17',
  't18',
  't19',
  't20',
  't21',
  't22',
  't23',
  't24',
  't25',
  't26',
  't27',
  't28',
  't29',
  't30',
  't31',
  't32',
];

function getEnabledTolerances(shouldApplyTolerances, deactivations) {
  return shouldApplyTolerances ? ALL_TOLERANCES.filter((tolerance) => !deactivations[tolerance]) : [];
}

function useLevenshteinRatio(enabledTolerances) {
  return _.includes(enabledTolerances, 't3');
}

export { getEnabledTolerances, useLevenshteinRatio };
