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

import { logger } from '../utils/logger.js';
import { withDataExportGate } from './gated-exporter.js';
import { InheritedAttributesSpanProcessor } from './inherited-span-attributes.js';
import { scalingoDetector } from './scalingo-detector.js';
import { setDataExportEnabled, setOpenTelemetryInitialized } from './state.js';

const OPEN_TELEMETRY_FEATURE_TOGGLE = 'isOpenTelemetryEnabled';

const GatedOTLPLogExporter = withDataExportGate(OTLPLogExporter);
const GatedOTLPTraceExporter = withDataExportGate(OTLPTraceExporter);
const GatedOTLPMetricExporter = withDataExportGate(OTLPMetricExporter);

export function initializeOpenTelemetry(serviceName) {
  diag.setLogger(
    {
      ...console,
      // eslint-disable-next-line no-console
      verbose: console.debug,
    },
    DiagLogLevel.WARN,
  );

  const logExporter = new GatedOTLPLogExporter();
  const traceExporter = new GatedOTLPTraceExporter();
  const metricExporter = new GatedOTLPMetricExporter({
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
    setOpenTelemetryInitialized(true);
    logger.info('OpenTelemetry initialized');
  } catch (error) {
    logger.error('Error initializing OpenTelemetry', error);
  }

  watchDataExportFeatureToggle();

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

function watchDataExportFeatureToggle() {
  import('../feature-toggles/index.js')
    .then(({ featureToggles }) => {
      const featureToggleRef = featureToggles.use(OPEN_TELEMETRY_FEATURE_TOGGLE);
      setDataExportEnabled(featureToggleRef.value);
      logger.info(`OpenTelemetry data export is ${featureToggleRef.value ? 'enabled' : 'disabled'}`);

      featureToggleRef.watch((value) => {
        setDataExportEnabled(value);
        logger.info(`OpenTelemetry data export is now ${value ? 'enabled' : 'disabled'}`);
      });
    })
    .catch((error) => {
      logger.error('Error watching the OpenTelemetry feature toggle, data export stays disabled', error);
    });
}
