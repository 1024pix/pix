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
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { config } from '../../config.js';
import { logger } from '../utils/logger.js';
import { InheritedAttributesSpanProcessor } from './inherited-span-attributes.js';
import { scalingoDetector } from './scalingo-detector.js';

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
  const metricExporter = new OTLPMetricExporter({
    compression: 'gzip',
    temporalityPreference: 0 /* 'AggregationTemporality.DELTA' = 0 */,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 30_000,
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    resourceDetectors: [envDetector, hostDetector, osDetector, processDetector, containerDetector, scalingoDetector],
    spanProcessors: [new InheritedAttributesSpanProcessor(), new BatchSpanProcessor({ exporter: traceExporter })],
    logRecordProcessors: [new BatchLogRecordProcessor({ exporter: logExporter })],
    metricReaders: [metricReader],
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
        enhancedDatabaseReporting: false, // prevent the instrumentation to add arguments of SQL in span attributes
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
