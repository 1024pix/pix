import _ from 'lodash';

function normalizeAndRemoveAccents(value) {
  // Remove uppercase/spaces/accents/diacritics, see http://stackoverflow.com/a/37511463/827989
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '');
}

function removeSpecialCharacters(value) {
  return value
    .toString()
    .replace(/[^a-zA-Z0-9 ]+/g, '')
    .replace('/ {2,}/', ' ')
    .replace(/\s\s+/g, ' ');
}

function applyPreTreatmentForTolerance(value) {
  return value
    .toString()
    .normalize('NFC')
    .replace(/\u00A0/g, ' ');
}

function applyTolerances(string, enabledTolerances) {
  let result = string.toString();
  if (_.isEmpty(enabledTolerances)) {
    return result;
  }

  if (enabledTolerances.includes('t1')) {
    result = normalizeAndRemoveAccents(result);
  }

  if (enabledTolerances.includes('t2')) {
    result = removeSpecialCharacters(result);
  }

  return result;
}

export { applyPreTreatmentForTolerance, applyTolerances, normalizeAndRemoveAccents, removeSpecialCharacters };
