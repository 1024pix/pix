import { ALL_TREATMENTS } from '../constants';
import _ from '../../infrastructure/utils/lodash-utils';

function getEnabledTreatments(shouldApplyTreatments, deactivations) {
  return shouldApplyTreatments ? ALL_TREATMENTS.filter((treatment) => !deactivations[treatment]) : [];
}

function useLevenshteinRatio(enabledTreatments) {
  return _.includes(enabledTreatments, 't3');
}

export default {
  getEnabledTreatments,
  useLevenshteinRatio,
};
