import ms from 'ms';

import { MetricParam } from './param.js';

export class TimeMetricParam extends MetricParam {
  #duration;

  constructor(duration) {
    super();
    this.#duration = ms(duration);
  }

  getValue() {
    const now = Date.now();
    return now - (now % this.#duration);
  }
}
