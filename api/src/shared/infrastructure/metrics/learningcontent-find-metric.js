import { ContainerMetricParam } from './container-param.js';
import { ContainerVersionMetricParam } from './container-version-param.js';
import { ContextMetricParam } from './context-param.js';
import { Metric } from './metric.js';
import { TimeMetricParam } from './time-param.js';

export class LearningContentFindMetric extends Metric {
  constructor({ name, storage }) {
    super({
      name,
      storage,
      params: [
        new ContextMetricParam('tableName'),
        new ContextMetricParam('findKey'),
        new ContainerMetricParam(),
        new ContainerVersionMetricParam(),
        new TimeMetricParam('15s'),
      ],
    });
  }
}
