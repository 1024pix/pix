import _ from '../../infrastructure/utils/lodash-utils';

function getArrayOfStrings(commaSeparatedStrings) {
  if (!commaSeparatedStrings) return [];
  return _(commaSeparatedStrings).split(',').map(_.trim).map(_.toUpper).value();
}

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
  return _.chain(string).split('\n').reject(_.isEmpty).value();
}

/**
 * Normalize and uppercase a string, remove non canonical characters, zero-width characters and sort the remaining characters alphabetically
 * @param {string} str
 * @returns {string}
 */
function normalizeAndSortChars(str) {
  const normalizedName = normalize(str);
  return [...normalizedName].sort().join('');
}

/**
 * Normalize and uppercase a string, remove non canonical characters and zero-width characters
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  const strCanonical = _removeNonCanonicalChars(str);
  const strUpper = strCanonical.toUpperCase();
  return [...strUpper].filter((char) => Boolean(char.match(/[0-9A-Z]/))).join('');
}

function _removeNonCanonicalChars(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function toArrayOfFixedLengthStringsConservingWords(str, maxLength) {
  const result = [];
  const words = str.split(' ');
  let index = 0;
  words.forEach((word) => {
    if (!result[index]) {
      result[index] = '';
    }
    if (result[index].length + word.length <= maxLength) {
      result[index] += `${word} `;
    } else {
      index++;
      result[index] = `${word} `;
    }
  });
  return result.map((str) => str.trim());
}

export default {
  isNumeric,
  splitIntoWordsAndRemoveBackspaces,
  cleanStringAndParseFloat,
  getArrayOfStrings,
  normalizeAndSortChars,
  normalize,
  toArrayOfFixedLengthStringsConservingWords,
};
