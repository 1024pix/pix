const _ = require('lodash');
const levenshtein = require('fast-levenshtein');

function getLevenshteinRatio(inputString, reference) {
  return levenshtein.get(inputString, reference) / inputString.length;
}

function areTwoStringsCloseEnough(inputString, reference, MAX_ACCEPTABLE_RATIO) {
  return getLevenshteinRatio(inputString, reference) <= MAX_ACCEPTABLE_RATIO;
}

function isOneStringCloseEnoughFromMultipleStrings(inputString, references, MAX_ACCEPTABLE_RATIO) {
  return getSmallestLevenshteinRatio(inputString, references) <= MAX_ACCEPTABLE_RATIO;
}

function getSmallestLevenshteinRatio(inputString, references) {
  return getSmallestLevenshteinDistance(inputString, references) / inputString.length;
}

function getSmallestLevenshteinDistance(comparative, alternatives) {
  const getLevenshteinDistance = (alternative) => levenshtein.get(comparative, alternative);
  return _(alternatives).map(getLevenshteinDistance).min();
}

module.exports = {
  areTwoStringsCloseEnough,
  isOneStringCloseEnoughFromMultipleStrings,
  getSmallestLevenshteinDistance,
  getSmallestLevenshteinRatio,
  getLevenshteinRatio,
};
