/**
 * Manual OpenTelemetry instrumentation for Hapi.
 *
 * This module instruments the already-created Hapi `server` instance directly:
 * - `Server.prototype.route` is wrapped once (all plugin-scoped server clones share the same
 *   prototype, see `_clone` in `@hapi/hapi`'s `lib/server.js`), so every route registered by
 *   every plugin goes through `instrumentRoute`, which wraps `pre` handlers and the controller
 *   handler in their own spans.
 * - Validation (params/query/payload/headers) isn't an extension point in Hapi, so it's bracketed
 *   with a span started in `onPostAuth` (runs right before validation) and ended in `onPreHandler`
 *   (runs right after validation, before `pre` handlers/the controller run). Validation failures
 *   skip `onPreHandler` entirely, so the span is also closed defensively in `onPreResponse`.
 *   See https://hapi.dev/api/21.x.x#request-lifecycle for more information.
 * - Authentication does not use extension points either, since we have access to the actual function.
 *   Instead, `server.auth.scheme` is wrapped so that whatever `authenticate()` method a scheme
 *   returns is wrapped in its own span.
 */
import { context, metrics, SpanStatusCode, trace } from '@opentelemetry/api';

import { config } from '../../config.js';
import { routeDomainToOwnerTeam } from '../utils/route-domain-to-owner-team.js';
import { setInheritedAttributes } from './inherited-span-attributes.js';

const tracer = trace.getTracer('hapi');

const INSTRUMENTED = Symbol('pix-hapi-tracing-instrumented');

/**
 * @typedef {import('@hapi/hapi').Server} HapiServer
 */

/**
 * @template {Function} OriginalFunction
 *
 * @param {string} name
 * @param {Record<string, string | number>} attributes
 * @param {OriginalFunction} fn
 * @param {import('@opentelemetry/api').Context} [parentContext]
 * @returns {ReturnType<OriginalFunction>}
 */
async function withChildSpan(name, attributes, fn, parentContext = context.active()) {
  if (!trace.getSpan(parentContext)) {
    return fn();
  }

  const span = tracer.startSpan(name, { attributes }, parentContext);
  try {
    return await context.with(trace.setSpan(parentContext, span), fn);
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}

function wrapPreHandler(method) {
  if (method[INSTRUMENTED]) return method;

  const name = method.name || 'anonymous';
  function wrapped(request, _h) {
    return withChildSpan(
      `pre-handler - ${name}`,
      { 'hapi.type': 'pre-handler' },
      () => method.apply(this, arguments),
      request.app.pixContext,
    );
  }
  wrapped[INSTRUMENTED] = true;
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
  if (handler[INSTRUMENTED]) return handler;

  const attributes = { 'hapi.type': 'controller', 'http.route': path, 'code.function': handler.name || 'anonymous' };
  function wrapped(request, _h) {
    return withChildSpan(
      `controller - ${method.toUpperCase()} ${path}`,
      attributes,
      () => handler.apply(this, arguments),
      request.app.pixContext,
    );
  }
  wrapped[INSTRUMENTED] = true;
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

// Stashed on the strategy options by the `server.auth.strategy` wrapper below, so the scheme
// wrapper can read back which strategy name it's building `authenticate()` for (schemes are
// shared across strategies, e.g. `jwt-scheme` backs both `jwt-user` and `jwt-application`).
const STRATEGY_NAME = Symbol('pix-hapi-tracing-strategy-name');

function wrapAuthenticate(authenticate, attributes) {
  if (typeof authenticate !== 'function' || authenticate.__pixTraced) return authenticate;

  function wrapped(request, _h) {
    const spanAttributes = { 'hapi.type': 'auth', 'http.route': request.route?.path, ...attributes };
    return withChildSpan('auth', spanAttributes, () => authenticate.apply(this, arguments), request.app.pixContext);
  }
  wrapped[INSTRUMENTED] = true;
  return wrapped;
}

function wrapAuthScheme(schemeName, schemeFn) {
  if (typeof schemeFn !== 'function' || schemeFn.__pixTraced) return schemeFn;
  wrapped[INSTRUMENTED] = true;
  function wrapped(schemeServer, options) {
    const strategy = schemeFn.call(this, schemeServer, options);
    if (strategy && typeof strategy.authenticate === 'function') {
      strategy.authenticate = wrapAuthenticate(strategy.authenticate, {
        'hapi.auth.scheme': schemeName,
        'hapi.auth.strategy': options?.[STRATEGY_NAME],
      });
    }
    return strategy;
  }
  wrapped.__pixTraced = true;
  return wrapped;
}

function instrumentAuth(server) {
  const originalScheme = server.auth.scheme;
  server.auth.scheme = function (name, schemeFn) {
    return originalScheme.call(this, name, wrapAuthScheme(name, schemeFn));
  };

  const originalStrategy = server.auth.strategy;
  server.auth.strategy = function (name, scheme, options) {
    return originalStrategy.call(this, name, scheme, { ...options, [STRATEGY_NAME]: name });
  };
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

    request.app.pixValidationSpan = tracer.startSpan(
      'validation',
      { attributes: { 'hapi.type': 'validation', 'http.route': request.route.path } },
      request.app.pixContext,
    );
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

/**
 * Computes attributes derived from the matched route (`routeDomain`, `teamsToContact`, ...) as
 * early as possible - right after route lookup, before auth/validation run - and stashes them on
 * `request.app.pixContext` (a `Context` carrying them under `inheritedAttributes`). All spans
 * created downstream for this request (auth, validation, pre-handlers, controller) are started
 * with that context as their parent, so `InheritedAttributesSpanProcessor` can copy the attributes
 * onto every one of them without each call site having to know about them individually.
 * @param {HapiServer} server
 */
function instrumentInheritedAttributes(server) {
  server.ext('onPreAuth', (request, h) => {
    if (!trace.getSpan(context.active())) return h.continue;

    const routeDomain = request.route.realm?.plugin;
    request.app.pixInheritedAttributes = {
      'pix.routeDomain': routeDomain,
      'pix.teamsToContact': routeDomainToOwnerTeam(config.routeDomainToOwnerTeamMapping, routeDomain).join(','),
    };
    request.app.pixContext = setInheritedAttributes(context.active(), request.app.pixInheritedAttributes);

    return h.continue;
  });
}

/**
 * @param {HapiServer} server
 */
function instrumentHttpResponse(server) {
  server.ext('onPreHandler', (request, h) => {
    const span = trace.getActiveSpan();
    if (!span) return h.continue;

    span.setAttribute('http.route', request.route.path);
    if (request.app.pixInheritedAttributes) {
      span.setAttributes(request.app.pixInheritedAttributes);
    }
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
 * @param {HapiServer} server
 */
function instrumentRequestId(server) {
  server.ext('onPreHandler', (request, h) => {
    const span = trace.getActiveSpan();
    if (!span) return h.continue;

    span.setAttribute('http.request.id', request.headers['x-request-id']);

    return h.continue;
  });
}

/**
 * @param {HapiServer} server
 */
export function instrumentActiveRequestsCount(server) {
  const meter = metrics.getMeter('hapi');
  const activeRequestsHistogram = meter.createHistogram('hapi.activeRequests', { unit: 'request' });
  let activeRequestsCount = 0;

  server.ext('onRequest', (_req, h) => {
    activeRequestsCount++;
    activeRequestsHistogram.record(activeRequestsCount);
    return h.continue;
  });

  server.ext('onPostResponse', (_req, h) => {
    activeRequestsCount--;
    return h.continue;
  });
}

/**
 * Instruments a freshly created Hapi server so that spans are created for `pre` handlers,
 * controllers (route handlers), authentication and payload/query/params validation. Must be
 * called before any route, auth scheme/strategy or plugin is registered on the server.
 * @param {HapiServer} server
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

  instrumentInheritedAttributes(server);

  instrumentAuth(server);

  instrumentValidation(server);

  instrumentHttpResponse(server);

  instrumentRequestId(server);

  instrumentActiveRequestsCount(server);
}
