import { collectDefaultMetrics, Counter, Gauge, Histogram, Summary } from 'prom-client';

import { config } from '../../config.js';
import { register } from './register.js';

collectDefaultMetrics({ register });

/**
 * @param {Omit<ConstructorParameters<typeof Counter>[0], 'registers'>} configuration
 */
function createCounter({ name, ...configuration }) {
  return new Counter({
    ...configuration,
    name: `${config.metrics.prometheus.prefix}_${name}`,
    registers: [register],
  });
}

/**
 * @param {Omit<ConstructorParameters<typeof Gauge>[0], 'registers'>} configuration
 */
function createGauge({ name, ...configuration }) {
  return new Gauge({
    ...configuration,
    name: `${config.metrics.prometheus.prefix}_${name}`,
    registers: [register],
  });
}

/**
 * @param {Omit<ConstructorParameters<typeof Histogram>[0], 'registers' | 'buckets'>} configuration
 */
function createHistogram({ name, ...configuration }) {
  return new Histogram({
    ...configuration,
    name: `${config.metrics.prometheus.prefix}_${name}`,
    registers: [register],
    buckets: config.metrics.prometheus.buckets[name] ?? [],
  });
}

/**
 * @param {Omit<ConstructorParameters<typeof Summary>[0], 'registers'>} configuration
 */
function createSummary({ name, ...configuration }) {
  return new Summary({
    ...configuration,
    name: `${config.metrics.prometheus.prefix}_${name}`,
    registers: [register],
  });
}

export const Metrics = {
  createCounter,
  createGauge,
  createHistogram,
  createSummary,
};
