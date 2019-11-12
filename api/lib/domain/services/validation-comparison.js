const _ = require('lodash');
const levenshtein = require('fast-levenshtein');

function _getSmallestLevenshteinDistance(comparative, alternatives) {
  const getLevenshteinDistance = (alternative) => levenshtein.get(comparative, alternative);
  return _(alternatives).map(getLevenshteinDistance).min();
}

function getSmallestLevenshteinRatio(inputString, references) {
  return _getSmallestLevenshteinDistance(inputString, references) / inputString.length;
}

function getLevenshteinRatio(inputString, reference) {
  return levenshtein.get(inputString, reference) / inputString.length;
}

module.exports = {
  _getSmallestLevenshteinDistance,
  getSmallestLevenshteinRatio,
  getLevenshteinRatio
};
