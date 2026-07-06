import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { config } from '../../config.js';
import { logger } from '../utils/logger.js';

const { resourceFromAttributes } = resources;

let sdk;

export function setupOtel(serviceName) {
  if (!config.logging.otelEnabled) {
    return;
  }

  const exporter = new OTLPTraceExporter();

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
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

setupOtel('pix-api');
