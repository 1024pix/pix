import { diag, DiagLogLevel } from '@opentelemetry/api';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { FsInstrumentation } from '@opentelemetry/instrumentation-fs';
import { HostMetricsInstrumentation } from '@opentelemetry/instrumentation-host-metrics';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { envDetector, hostDetector, osDetector, processDetector } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { config } from '../../config.js';
import { logger } from '../utils/logger.js';
import { scalingoDetector } from './scalingo-detector.js';

const { resourceFromAttributes } = resources;

export function initializeOpenTelemetry(serviceName) {
  if (!config.logging.otelEnabled) {
    return;
  }
  diag.setLogger(
    {
      ...logger,
      verbose: logger.debug,
    },
    DiagLogLevel.WARN,
  );

  const logExporter = new OTLPLogExporter();
  const traceExporter = new OTLPTraceExporter();
  const metricExporter = new OTLPMetricExporter();

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    resourceDetectors: [envDetector, hostDetector, osDetector, processDetector, containerDetector, scalingoDetector],
    traceExporter,
    metricExporter,
    logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
    instrumentations: [
      new HostMetricsInstrumentation(),
      new HttpInstrumentation(),
      new UndiciInstrumentation({
        requestHook(span, request) {
          span.updateName(`${request.method} ${request.origin}${request.path}`);
        },
      }),
      new PgInstrumentation({
        requireParentSpan: true,
        enhancedDatabaseReporting: true,
        requestHook(span, pgRequest) {
          const statementWithoutComment = pgRequest.query.text.replace(/\/\* .* \*\/ /, '');
          span.setAttribute('db.statement', statementWithoutComment);
        },
      }),
      new FsInstrumentation({
        requireParentSpan: true,
      }),
    ],
  });

  try {
    sdk.start();
    logger.info('OpenTelemetry initialized');
  } catch (error) {
    logger.error('Error initializing OpenTelemetry', error);
  }

  async function shutdown() {
    try {
      await sdk.shutdown();
      logger.info('OpenTelemetry shut down');
    } catch (error) {
      logger.error('Error shutting down OpenTelemetry', error);
    }
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
