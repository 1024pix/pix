/**
 * @typedef {import('./storage').MetricsStorage} MetricsStorage
 */

/**
 * @typedef {import('./param').MetricParam} MetricParam
 */

/**
 * Parent class for a metric.
 *
 * @abstract
 * @template {object} Context
 */
export class Metric {
  /** @type {string} */
  #name;

  /** @type {MetricsStorage} */
  #storage;

  /** @type {MetricParam[]} */
  #params;

  /**
   * @param {{
   *   name: string
   *   storage: MetricsStorage
   *   params?: MetricParam[]
   * }} options
   */
  constructor({ name, params = [], storage }) {
    this.#name = name;
    this.#params = params;
    this.#storage = storage;
  }

  /**
   * @param {Context} context
   * @param {number} value
   */
  increment(context, value = 1) {
    const key = this.#keyFor(context);
    return this.#storage.increment(key, value);
  }

  /**
   * @param {Context} context
   */
  #keyFor(context) {
    return [this.#name, ...this.#params.map((param) => param.getValue(context))].join(':');
  }
}
