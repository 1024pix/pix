import Hapi from '@hapi/hapi';
import { context, SpanKind, trace } from '@opentelemetry/api';

import { initializeOpenTelemetry } from '../../src/shared/infrastructure/open-telemetry/initialize-open-telemetry.js';

const isOpenTelemetryEnabled = process.env.OTEL_TESTS === 'true';

if (isOpenTelemetryEnabled) {
  initializeOpenTelemetry('pix-api-test', { forceDataExport: true });

  const tracer = trace.getTracer('pix-api-test');

  const serverPrototype = Object.getPrototypeOf(Hapi.server());
  const originalInject = serverPrototype.inject;

  serverPrototype.inject = async function (options) {
    const { method = 'GET', url } = typeof options === 'string' ? { url: options } : options;
    const span = tracer.startSpan(`${method.toUpperCase()} ${url}`, { kind: SpanKind.SERVER });
    try {
      const response = await context.with(trace.setSpan(context.active(), span), () =>
        originalInject.call(this, options),
      );
      span.setAttribute('http.response.status_code', response.statusCode);
      return response;
    } finally {
      span.end();
    }
  };
}

const { mochaHooks: integrationHooks } = await import('./integration.js');

export const mochaHooks = isOpenTelemetryEnabled
  ? {
      ...integrationHooks,
      afterAll: [integrationHooks.afterAll, () => trace.getTracerProvider().getDelegate().forceFlush()],
    }
  : integrationHooks;
