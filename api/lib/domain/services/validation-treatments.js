const _ = require('lodash');
const deactivationsService = require('./deactivations-service');

function normalizeAndRemoveAccents(string) {
  // Remove uppercase/spaces/accents/diacritics, see http://stackoverflow.com/a/37511463/827989
  return string.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '');
}

function removeSpecialCharacters(string) {
  return string.toString().replace(/[^a-zA-Z0-9 ]+/g, '').replace('/ {2,}/', ' ').replace(/\s\s+/g, ' ');
}

function applyPreTreatments(string) {
  return string.replace(/\u00A0/g, ' ');
}

function applyTreatments(string, enabledTreatments) {
  let result = string.toString();
  if (_.isEmpty(enabledTreatments)) {
    return result;
  }
  if (enabledTreatments.includes('t1')) {
    result = normalizeAndRemoveAccents(result);
  }
  if (enabledTreatments.includes('t2')) {
    result = removeSpecialCharacters(result);
  }
  return result;
}

function applyTreatmentsUnlessIfDesactivated(string, deactivations) {

  if (deactivationsService.isDefault(deactivations) || deactivationsService.hasOnlyT3(deactivations)) {
    return removeSpecialCharacters(normalizeAndRemoveAccents(string));
  }
  else if (deactivationsService.hasOnlyT1(deactivations) || deactivationsService.hasOnlyT1T3(deactivations)) {
    return removeSpecialCharacters(string);
  }
  else if (deactivationsService.hasOnlyT2(deactivations) || deactivationsService.hasOnlyT2T3(deactivations)) {
    return normalizeAndRemoveAccents(string);
  }
  else if (deactivationsService.hasOnlyT1T2(deactivations) || deactivationsService.hasT1T2T3(deactivations)) {
    return string;
  } else {
    return string;
  }
}

module.exports = {
  normalizeAndRemoveAccents,
  removeSpecialCharacters,
  applyPreTreatments,
  applyTreatments,
  applyTreatmentsUnlessIfDesactivated,
};
