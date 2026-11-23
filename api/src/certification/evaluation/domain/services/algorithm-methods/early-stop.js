/**
 * @typedef {import('../../../../../evaluation/domain/models/Answer.js').Answer} Answer
 */

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
