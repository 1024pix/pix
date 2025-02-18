/* eslint-disable no-unused-vars */

/**
 * @abstract
 */
export class MetricParam {
  /**
   * @param {object} context
   */
  getValue(context) {
    throw new TypeError('MetricParam must be subclassed and getValue overriden');
  }
}

/* eslint-enable no-unused-vars */
