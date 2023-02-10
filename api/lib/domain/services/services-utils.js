const { ALL_TREATMENTS } = require('../constants');
const _ = require('../../infrastructure/utils/lodash-utils');

function getEnabledTreatments(shouldApplyTreatments, deactivations) {
  return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

function useLevenshteinRatio(enabledTreatments) {
  return _.includes(enabledTreatments, 't3');
}

module.exports = {
  getEnabledTreatments,
  useLevenshteinRatio,
};
