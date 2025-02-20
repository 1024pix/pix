import ms from 'ms';

import { MetricParam } from './param.js';

export class TimeMetricParam extends MetricParam {
  #duration;

  constructor(duration) {
    super();
    this.#duration = ms(duration);
  }

  getValue(_context, time) {
    return time - (time % this.#duration);
  }
}
