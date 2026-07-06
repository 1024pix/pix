const MAXIMAL_CERTIFICATION_DURATION_IN_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * @param {Date} startDate
 * @returns {boolean}
 */
export function isDurationExceeded(startDate) {
  return Date.now() - startDate.getTime() > MAXIMAL_CERTIFICATION_DURATION_IN_MS;
}
