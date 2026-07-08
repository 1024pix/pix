/**
 * Manual OpenTelemetry instrumentation for Hapi.
 *
 * We used to rely on the community `@opentelemetry/instrumentation-hapi` package (vendored,
 * see git history), which patches the `@hapi/hapi` module exports through the
 * `@opentelemetry/instrumentation` module-hook mechanism. That hook is registered against the
 * CommonJS/ESM loader and only works reliably if it runs before `@hapi/hapi` is first imported
 * anywhere in the process - in practice it silently failed to patch anything in this codebase.
 *
 * Instead, this module instruments the already-created Hapi `server` instance directly:
 * - `Server.prototype.route` is wrapped once (all plugin-scoped server clones share the same
 *   prototype, see `_clone` in `@hapi/hapi`'s `lib/server.js`), so every route registered by
 *   every plugin goes through `instrumentRoute`, which wraps `pre` handlers and the controller
 *   handler in their own spans.
 * - Validation (params/query/payload/headers) isn't an extension point in Hapi, so it's bracketed
 *   with a span started in `onPostAuth` (runs right before validation) and ended in `onPreHandler`
 *   (runs right after validation, before `pre` handlers/the controller run). Validation failures
 *   skip `onPreHandler` entirely, so the span is also closed defensively in `onPreResponse`.
 */
import { context, SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('pix-api-hapi');

const INSTRUMENTED = Symbol('pix-hapi-tracing-instrumented');

async function withChildSpan(name, attributes, fn) {
  if (!trace.getSpan(context.active())) {
    return fn();
  }

  const span = tracer.startSpan(name, { attributes });
  try {
    return await context.with(trace.setSpan(context.active(), span), fn);
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

function wrapPreHandler(method) {
  if (typeof method !== 'function' || method.__pixTraced) return method;

  const name = method.name || 'anonymous';
  function wrapped(_request, _h) {
    return withChildSpan(`pre-handler - ${name}`, { 'hapi.type': 'pre-handler' }, () => method.apply(this, arguments));
  }
  wrapped.__pixTraced = true;
  return wrapped;
}

function wrapPrerequisites(pre) {
  if (!pre) return;
  for (let i = 0; i < pre.length; i++) {
    const entry = pre[i];
    if (Array.isArray(entry)) {
      wrapPrerequisites(entry);
    } else if (typeof entry === 'function') {
      pre[i] = wrapPreHandler(entry);
    } else if (entry && typeof entry.method === 'function') {
      entry.method = wrapPreHandler(entry.method);
    }
  }
}

function wrapController(handler, path, method) {
  if (typeof handler !== 'function' || handler.__pixTraced) return handler;

  const attributes = { 'hapi.type': 'controller', 'http.route': path, 'code.function': handler.name || 'anonymous' };
  function wrapped(_request, _h) {
    return withChildSpan(`controller - ${method.toUpperCase()} ${path}`, attributes, () =>
      handler.apply(this, arguments),
    );
  }
  wrapped.__pixTraced = true;
  return wrapped;
}

function instrumentRoute(route) {
  const path = route.path;
  const method = Array.isArray(route.method) ? route.method.join(',') : route.method;
  const options = route.options ?? route.config;

  if (options) {
    wrapPrerequisites(options.pre);
    if (typeof options.handler === 'function') {
      options.handler = wrapController(options.handler, path, method);
    }
  }

  if (typeof route.handler === 'function') {
    route.handler = wrapController(route.handler, path, method);
  }

  return route;
}

function instrumentValidation(server) {
  const endValidationSpan = (request) => {
    const span = request.app.pixValidationSpan;
    if (!span) return;
    span.end();
    request.app.pixValidationSpan = undefined;
  };

  server.ext('onPostAuth', (request, h) => {
    if (!trace.getSpan(context.active())) return h.continue;

    const validate = request.route.settings.validate;
    const hasValidation =
      validate && (validate.headers || validate.params || validate.query || validate.payload || validate.state);
    if (!hasValidation) return h.continue;

    request.app.pixValidationSpan = tracer.startSpan('validation', {
      attributes: { 'hapi.type': 'validation', 'http.route': request.route.path },
    });
    return h.continue;
  });

  // Success path: validation passed, ends right before pre-handlers/the controller run.
  server.ext('onPreHandler', (request, h) => {
    endValidationSpan(request);
    return h.continue;
  });

  // Failure path fallback: a validation error skips onPreHandler entirely.
  server.ext('onPreResponse', (request, h) => {
    endValidationSpan(request);
    return h.continue;
  });
}

function instrumentHttpResponse(server) {
  server.ext('onPreHandler', (request, h) => {
    const span = trace.getActiveSpan();
    if (!span) return h.continue;

    span.setAttribute("http.route", request.route.path);
    span.updateName(`${request.method.toUpperCase()} ${request.route.path}`);

    request.app.traceId = span.spanContext().traceId;

    return h.continue;
  });

  server.ext('onPreResponse', (request, h) => {
    const traceId = request.app.traceId;
    const response = request.response;

    if (!traceId) return h.continue;

    if (response.isBoom) {
      response.output.headers['X-Trace-Id'] = traceId;
    } else {
      response.header('X-Trace-Id', traceId);
    }

    return h.continue;
  });
}

/**
 * Instruments a freshly created Hapi server so that spans are created for `pre` handlers,
 * controllers (route handlers) and payload/query/params validation. Must be called before any
 * route or plugin is registered on the server.
 * @param server - a server created via `Hapi.server(...)`
 */
export function instrumentHapiServer(server) {
  const serverPrototype = Object.getPrototypeOf(server);
  if (serverPrototype[INSTRUMENTED]) return;
  serverPrototype[INSTRUMENTED] = true;

  const originalRoute = serverPrototype.route;
  serverPrototype.route = function (routes) {
    for (const route of [].concat(routes)) {
      instrumentRoute(route);
    }
    return originalRoute.call(this, routes);
  };

  instrumentValidation(server);

  instrumentHttpResponse(server);
}
