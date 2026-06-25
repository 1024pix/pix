import levenshtein from 'fast-levenshtein';
import _ from 'lodash';

export function isOneStringCloseEnoughFromMultipleStrings(inputString, references, MAX_ACCEPTABLE_RATIO) {
  return getSmallestLevenshteinRatio(inputString, references) <= MAX_ACCEPTABLE_RATIO;
}

export function getSmallestLevenshteinRatio(inputString, references) {
  return getSmallestLevenshteinDistance(inputString, references) / inputString.length;
}

export function getSmallestLevenshteinDistance(comparative, alternatives) {
  const getLevenshteinDistance = (alternative) => levenshtein.get(comparative, alternative);
  return _(alternatives).map(getLevenshteinDistance).min();
}
