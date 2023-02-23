const { ALL_TREATMENTS } = require('../constants.js');
const _ = require('../../infrastructure/utils/lodash-utils.js');

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
