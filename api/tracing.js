import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { envDetector, hostDetector, osDetector, processDetector } from '@opentelemetry/resources';
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { config } from './src/shared/config.js';
import { scalingoDetector } from './src/shared/infrastructure/open-telemetry/scalingo-detector.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';

const { resourceFromAttributes } = resources;

if (config.logging.otelEnabled) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const exporter = new OTLPTraceExporter();

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.infra.appName || 'pix-api',
    }),
    resourceDetectors: [envDetector, hostDetector, osDetector, processDetector, containerDetector, scalingoDetector],
    traceExporter: exporter,
    instrumentations: [
      new HttpInstrumentation(),
      new UndiciInstrumentation({
        requestHook(span, request) {
          span.updateName(`${request.method} ${request.origin}${request.path}`);
        },
      }),
      new PgInstrumentation({
        requireParentSpan: true,
        enhancedDatabaseReporting: true,
      }),
    ],
  });

  try {
    sdk.start();
    logger.info('OpenTelemetry initialized');
  } catch (error) {
    logger.error('Error initializing OpenTelemetry', error);
  }

  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown();
      logger.info('OpenTelemetry shut down');
    } catch (error) {
      logger.error('Error shutting down OpenTelemetry', error);
    }
  });
}
