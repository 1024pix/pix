/* eslint-disable no-unused-vars */

/**
 * Metrics storage contract class.
 *
 * @abstract
 */
export class MetricsStorage {
  /**
   * @param {string} key
   * @param {number} value
   */
  increment(key, value) {
    throw new TypeError('MetricsStorage must be subclassed and increment overriden');
  }
}

/* eslint-enable no-unused-vars */
