import http from 'node:http';
import https from 'node:https';

import { Pushgateway } from 'prom-client';

import { config } from '../../../../config/config.js';
import { child } from '../utils/logger.js';
import { register } from './register.js';

const logger = child('metrics:pushgateway', { event: 'metrics' });

const headers = {};

if (config.metrics.prometheus.pushgateway.basicAuth) {
  headers.authorization = `Basic ${Buffer.from(config.metrics.prometheus.pushgateway.basicAuth).toString('base64')}`;
}

register.setDefaultLabels({
  instance: config.infra.containerName ?? 'localhost',
});

const httpAgentOptions = {
  keepAlive: true,
  keepAliveMsec: config.metrics.prometheus.pushgateway.keepAlive,
  maxSockets: 1,
};

let httpAgent;
if (URL.canParse(config.metrics.prometheus.pushgateway.url)) {
  const { protocol } = new URL(config.metrics.prometheus.pushgateway.url);
  httpAgent = protocol === 'https:' ? new https.Agent(httpAgentOptions) : new http.Agent(httpAgentOptions);
}

const pushgateway = new Pushgateway(
  config.metrics.prometheus.pushgateway.url,
  {
    headers,
    timeout: config.metrics.prometheus.pushgateway.timeout,
    agent: httpAgent,
  },
  register,
);

async function pushMetrics() {
  logger.debug('pushing metrics');
  await pushgateway.pushAdd({ jobName: config.infra.hostname ?? 'pix-api-localhost' });
}

let pushMetricsInterval;

export function startPushingMetrics() {
  if (!config.metrics.prometheus.enabled) return;
  logger.info('Start pushing metrics to Prometheus pushgateway');

  if (pushMetricsInterval !== undefined) return;
  pushMetricsInterval = setInterval(() => {
    pushMetrics().catch((err) => logger.error({ err }, 'error while pushing metrics'));
  }, config.metrics.prometheus.pushgateway.pushInterval);
}

export async function stopPushingMetrics() {
  if (!config.metrics.prometheus.enabled) return;
  logger.info('Flush and stop pushing metrics to Prometheus pushgateway');

  if (pushMetricsInterval === undefined) return;
  clearInterval(pushMetricsInterval);
  await pushMetrics();
}
