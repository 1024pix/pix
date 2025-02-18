import { MetricParam } from './param.js';

export class ContainerVersionMetricParam extends MetricParam {
  getValue() {
    return process.env.CONTAINER_VERSION;
  }
}
