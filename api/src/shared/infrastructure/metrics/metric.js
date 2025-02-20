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

  /** @type {WeakSet<Timer>} */
  #timers = new WeakSet();

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
   * @returns {Timer}
   */
  start(context) {
    const timer = new Timer(context);
    this.#timers.add(timer);
    return timer;
  }

  /**
   * @param {Timer} timer
   */
  end(timer) {
    if (!this.#timers.has(timer)) {
      throw new TypeError(`timer ${timer} does not belong to metric ${this.#name}`);
    }

    this.#storage.increment(this.#keyFor(timer.context, timer.start), Date.now() - timer.start);
  }

  /**
   * @param {Context} context
   */
  #keyFor(context, time = Date.now()) {
    return [this.#name, ...this.#params.map((param) => param.getValue(context, time))].join(':');
  }
}

class Timer {
  static #nextId = 1;

  #id = Timer.#nextId++;

  #start = Date.now();

  /** @type {object} */
  #context;

  /**
   * @param {object} context
   */
  constructor(context) {
    this.#context = context;
  }

  get start() {
    return this.#start;
  }

  get context() {
    return this.#context;
  }

  toString() {
    return `Timer #${this.#id}`;
  }
}
