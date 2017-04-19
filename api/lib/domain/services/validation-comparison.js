const _ = require('../../../lib/infrastructure/utils/lodash-utils');
const levenshtein = require('fast-levenshtein');

function _getSmallestLevenshteinDistance(answer, solutionVariants) {

  let min = levenshtein.get(answer, solutionVariants[0]);

  if (solutionVariants.length === 1) {
    return min;
  }

  _.each(solutionVariants, (variant) => {
    const levenshteinDistance = levenshtein.get(answer, variant);
    if (levenshteinDistance < min) {
      min = levenshteinDistance;
    }
  });

  return min;
}

function t3(answer, solutionVariants) {
  return _getSmallestLevenshteinDistance(answer, solutionVariants) / answer.length;
}

module.exports = {
  _getSmallestLevenshteinDistance,
  t3
};
