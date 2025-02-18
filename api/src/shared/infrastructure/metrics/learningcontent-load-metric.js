import { ContainerMetricParam } from './container-param.js';
import { ContainerVersionMetricParam } from './container-version-param.js';
import { ContextMetricParam } from './context-param.js';
import { Metric } from './metric.js';
import { TimeMetricParam } from './time-param.js';

export class LearningContentLoadMetric extends Metric {
  constructor({ storage }) {
    super({
      name: 'learningcontent:load',
      storage: storage,
      params: [
        new ContextMetricParam('tableName'),
        new ContainerMetricParam(),
        new ContainerVersionMetricParam(),
        new TimeMetricParam('15s'),
      ],
    });
  }
}
