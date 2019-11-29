const _ = require('lodash');

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

module.exports = {
  normalizeAndRemoveAccents,
  removeSpecialCharacters,
  applyPreTreatments,
  applyTreatments
};
