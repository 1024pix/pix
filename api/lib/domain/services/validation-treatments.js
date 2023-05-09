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

function applyPreTreatments(value) {
  return value
    .toString()
    .normalize('NFC')
    .replace(/\u00A0/g, ' ');
}

const treatments = {
  t1: normalizeAndRemoveAccents,
  t2: removeSpecialCharacters,
};

function applyTreatments(string, enabledTreatments) {
  let result = string.toString();
  if (_.isEmpty(enabledTreatments)) {
    return result;
  }
  _(enabledTreatments)
    .sort()
    .each((treatment) => {
      const treatmentFunction = _.get(treatments, treatment);
      result = treatmentFunction ? treatmentFunction(result) : result;
    });
  return result;
}

export { normalizeAndRemoveAccents, removeSpecialCharacters, applyPreTreatments, applyTreatments, treatments };
