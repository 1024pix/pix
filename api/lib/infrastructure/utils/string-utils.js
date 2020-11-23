const _ = require('../../infrastructure/utils/lodash-utils');

function isNumeric(string) {
  if (typeof string != 'string') {
    return false;
  }
  const stringWithoutComma = string.replace(',', '.').trim();
  const stringWithoutCommaAndSpace = stringWithoutComma.replace(' ', '');
  return !isNaN(stringWithoutCommaAndSpace) && !isNaN(parseFloat(stringWithoutCommaAndSpace));
}

function splitIntoWordsAndRemoveBackspaces(string) {
  return _.chain(string)
    .split('\n')
    .reject(_.isEmpty)
    .value();
}

module.exports = {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
};
