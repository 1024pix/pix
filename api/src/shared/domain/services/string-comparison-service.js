import levenshtein from 'fast-levenshtein';

function getLevenshteinRatio(inputString, reference) {
  return levenshtein.get(inputString, reference) / inputString.length;
}

function areTwoStringsCloseEnough(inputString, reference, MAX_ACCEPTABLE_RATIO) {
  return getLevenshteinRatio(inputString, reference) <= MAX_ACCEPTABLE_RATIO;
}

export { areTwoStringsCloseEnough, getLevenshteinRatio };
