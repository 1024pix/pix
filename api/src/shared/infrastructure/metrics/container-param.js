import { MetricParam } from './param.js';

export class ContainerMetricParam extends MetricParam {
  getValue() {
    return process.env.CONTAINER;
  }
}
