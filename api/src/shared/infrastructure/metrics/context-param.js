import { MetricParam } from './param.js';

export class ContextMetricParam extends MetricParam {
  #key;

  constructor(key) {
    super();
    this.#key = key;
  }

  getValue(context) {
    return context[this.#key];
  }
}
