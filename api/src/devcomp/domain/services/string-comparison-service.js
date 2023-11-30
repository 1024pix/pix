import _ from 'lodash';
import levenshtein from 'fast-levenshtein';
import { LEVENSHTEIN_DISTANCE_MAX_RATE } from '../../../shared/domain/constants.js';

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

function validateAnswer(answer, solutions, useLevenshteinRatio) {
  if (useLevenshteinRatio) {
    return getSmallestLevenshteinRatio(answer, solutions) <= LEVENSHTEIN_DISTANCE_MAX_RATE;
  }
  return _.includes(solutions, answer);
}

export {
  isOneStringCloseEnoughFromMultipleStrings,
  getSmallestLevenshteinDistance,
  getSmallestLevenshteinRatio,
  validateAnswer,
};
