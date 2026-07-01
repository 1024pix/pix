import levenshtein from 'fast-levenshtein';

const DEFAULT_RATIO = 0.25;

/**
 * Tells whether two strings are close enough according to a tolerance threshold.
 * @param {string} inputString - The string being evaluated.
 * @param {string} reference - The reference string.
 * @param {number} [maxRatio=DEFAULT_RATIO] - Maximum accepted ratio (0 = identical).
 * @returns {boolean} `true` if the ratio is lower than or equal to the threshold.
 */
export function isCloseEnough(inputString, reference, maxRatio = DEFAULT_RATIO) {
  return _getRatio(inputString, reference) <= maxRatio;
}

/**
 * Tells whether a string is close enough to at least one of the provided references.
 * @param {string} inputString - The string being evaluated.
 * @param {string[]} references - The candidate reference strings.
 * @param {number} [maxRatio=DEFAULT_RATIO] - Maximum accepted ratio (0 = identical).
 * @returns {boolean} `true` if at least one reference is close enough.
 */
export function isCloseEnoughToOneOf(inputString, references = [], maxRatio = DEFAULT_RATIO) {
  const ratios = references.map((reference) => _getRatio(inputString, reference));
  return Math.min(...ratios) <= maxRatio;
}

function _getRatio(inputString, reference) {
  if (inputString.length === 0) {
    return inputString === reference ? 0 : Infinity;
  }
  return levenshtein.get(inputString, reference) / inputString.length;
}
