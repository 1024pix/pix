const _ = require('lodash');

function t1(string) {
  // Remove uppercase/spaces/accents/diacritics, see http://stackoverflow.com/a/37511463/827989
  return string.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '');
}

function t2(string) {
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
    result = t1(result);
  }
  if (enabledTreatments.includes('t2')) {
    result = t2(result);
  }
  return result;
}

module.exports = {
  t1,
  t2,
  applyPreTreatments,
  applyTreatments
};
