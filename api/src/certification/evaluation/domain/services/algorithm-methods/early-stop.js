/**
 * @typedef {import('../../../../../evaluation/domain/models/Answer.js').Answer} Answer
 */

// Smallest standard deviation the flash posterior grid can represent (step of 18/80 over sqrt(12))
const MINIMUM_ERROR_RATE = 18 / 80 / Math.sqrt(12);

/**
 * Standard normal cumulative distribution function.
 * Abramowitz & Stegun 7.1.26 approximation, absolute error < 1.5e-7.
 * @param {number} z
 * @returns {number}
 */
export function normalCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/**
 * @param {Answer[]} answers
 * @returns {number} number of consecutive failed answers at the end of the list
 */
export function countTrailingFailures(answers) {
  let count = 0;
  for (let index = answers.length - 1; index >= 0 && !answers[index].isOk(); index--) {
    count++;
  }
  return count;
}

/**
 * Normal approximation of P(θ < threshold | answers), posterior being N(capacity, errorRate).
 * @param {object} params
 * @param {number} params.capacity
 * @param {number} params.errorRate
 * @param {number} params.threshold
 * @returns {number}
 */
export function getProbabilityBelowThreshold({ capacity, errorRate, threshold }) {
  const standardDeviation = errorRate > MINIMUM_ERROR_RATE ? errorRate : MINIMUM_ERROR_RATE;
  return normalCdf((threshold - capacity) / standardDeviation);
}

/**
 * R1: the last `consecutiveFailures` answers are failures.
 * @param {object} params
 * @param {Answer[]} params.answers
 * @param {number} params.consecutiveFailures
 * @returns {boolean}
 */
export function hasConsecutiveFailures({ answers, consecutiveFailures }) {
  return countTrailingFailures(answers) >= consecutiveFailures;
}

/**
 * R3: P(θ < capacityThreshold | answers) >= confidence.
 * @param {object} params
 * @param {number} params.capacity
 * @param {number} params.errorRate
 * @param {number} params.capacityThreshold
 * @param {number} params.confidence
 * @returns {boolean}
 */
export function isCapacityProbablyBelowThreshold({ capacity, errorRate, capacityThreshold, confidence }) {
  return getProbabilityBelowThreshold({ capacity, errorRate, threshold: capacityThreshold }) >= confidence;
}

/**
 * R4 = R1 AND R3, evaluated once at least `minimumLength` answers have been given.
 * @param {object} params
 * @param {Answer[]} params.answers
 * @param {number} params.capacity
 * @param {number} params.errorRate
 * @param {number} params.consecutiveFailures
 * @param {number} params.minimumLength
 * @param {number} params.capacityThreshold
 * @param {number} params.confidence
 * @returns {boolean}
 */
export function shouldStopEarly({
  answers,
  capacity,
  errorRate,
  consecutiveFailures,
  minimumLength,
  capacityThreshold,
  confidence,
}) {
  if (answers.length < minimumLength) {
    return false;
  }

  return (
    hasConsecutiveFailures({ answers, consecutiveFailures }) &&
    isCapacityProbablyBelowThreshold({ capacity, errorRate, capacityThreshold, confidence })
  );
}
