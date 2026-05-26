import metrics from 'datadog-metrics';

import { child } from '../utils/logger.js';

const logger = child('metrics', { event: 'metrics' });

export class DatadogMetrics {
  static intervals = [];
  static metricDefinitions = {};

  constructor({ config }) {
    if (!config.metrics.isDirectMetricsEnabled) {
      logger.info('Metric initialisation : no reporter => no metrics sent');
      metrics.init({ reporter: new metrics.reporters.NullReporter(), flushIntervalSeconds: 0 });
    }

    if (config.metrics.isDirectMetricsEnabled) {
      logger.info('Metric initialisation : linked to Datadog');
      metrics.init({
        host: config.infra.containerName,
        prefix: '',
        flushIntervalSeconds: config.infra.metricsFlushIntervalSecond,
        defaultTags: [`service:${config.infra.appName}`],
      });
    }
  }

  addMetricPoint({ type, name, tags, value }) {
    this.#addMetricPointWithoutRegistration({ type, name, tags, value });
    this.#registerMetric({ type, name, tags });
  }

  #addMetricPointWithoutRegistration({ type, name, tags, value }) {
    switch (type) {
      case 'gauge':
        metrics.gauge(name, value, tags);
        break;
      case 'histogram':
        metrics.histogram(name, value, tags);
        break;
      case 'increment':
        metrics.increment(name, value, tags);
        break;
      default:
        throw new Error(`${type} is not supported.`);
    }
  }

  addRecurrentMetrics(metricDefinitionsArray, intervalInSeconds, valueProducer) {
    const f = (mem) => () => {
      metricDefinitionsArray.forEach(({ type, name, tags, value, constValue }) => {
        if (constValue) {
          this.#addMetricPointWithoutRegistration({ type, name, tags, value: constValue });
        } else {
          this.#addMetricPointWithoutRegistration({ type, name, tags, value: mem()[value] });
        }
      });
    };
    DatadogMetrics.intervals.push(setInterval(f(valueProducer), intervalInSeconds));
    metricDefinitionsArray.forEach(({ type, name, tags }) => {
      this.#registerMetric({ type, name, tags });
    });
  }

  #registerMetric({ type, name, tags }) {
    const metricSignature = `${type}|${name}|${tags}`;
    if (!DatadogMetrics.metricDefinitions[metricSignature]) {
      logger.info(`Metric registered with : ${type}, ${name}, ${tags}`);
      DatadogMetrics.metricDefinitions[metricSignature] = { type, name, tags };
    }
  }

  async clearMetrics() {
    DatadogMetrics.intervals.forEach(clearInterval);
    logger.info(JSON.stringify(DatadogMetrics.metricDefinitions));
    Object.values(DatadogMetrics.metricDefinitions).forEach((v) => {
      const zero = v;
      zero.value = 0;
      this.#addMetricPointWithoutRegistration(zero);
    });
    await metrics.flush();
  }
}
