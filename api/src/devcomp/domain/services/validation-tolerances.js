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

const tolerances = {
  t1: normalizeAndRemoveAccents,
  t2: removeSpecialCharacters,
};

function applyTolerances(string, enabledTolerances) {
  let result = string.toString();
  if (_.isEmpty(enabledTolerances)) {
    return result;
  }
  _(enabledTolerances)
    .sort()
    .each((tolerance) => {
      const toleranceFunction = _.get(tolerances, tolerance);
      result = toleranceFunction ? toleranceFunction(result) : result;
    });
  return result;
}

function registerTolerance(tCode, tFunc) {
  tolerances[tCode] = tFunc;
}

export {
  applyPreTreatmentForTolerance,
  applyTolerances,
  normalizeAndRemoveAccents,
  registerTolerance,
  removeSpecialCharacters,
  tolerances,
};
