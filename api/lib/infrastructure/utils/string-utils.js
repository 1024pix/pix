const _ = require('../../infrastructure/utils/lodash-utils');

function isNumeric(string) {
  if (typeof string != 'string') {
    return false;
  }
  const stringWithoutComma = string.replace(',', '.').trim();
  const stringWithoutCommaAndSpace = stringWithoutComma.replace(' ', '');
  return !isNaN(stringWithoutCommaAndSpace) && !isNaN(parseFloat(stringWithoutCommaAndSpace));
}

function cleanStringAndParseFloat(string) {
  const stringWithoutSpace = string.replace(' ', '');
  return parseFloat(stringWithoutSpace.replace(',', '.'));
}

function splitIntoWordsAndRemoveBackspaces(string) {
  return _.chain(string)
    .split('\n')
    .reject(_.isEmpty)
    .value();
}

/**
 * Normalize and uppercase a string, remove non canonical characters and sort the remaining characters alphabetically
 * @param {string} str
 * @returns {string}
 */
function sanitizeAndSortChars(str) {
  const normalizedName = str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return [...normalizedName].filter((char) => Boolean(char.match(/[A-Z]/))).sort().join('');
}

module.exports = {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
  sanitizeAndSortChars,
};
