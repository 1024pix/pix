import { trace } from '@opentelemetry/api';

import { DomainError } from '../../domain/errors.js';
const otelProxySymbol = Symbol('otelProxy');

function isAlreadyProxied(resource) {
  return resource[otelProxySymbol] === true;
}

function wrapFunction(func, target, methodName, defaultAttributes) {
  if (isAlreadyProxied(func)) return func;

  const wrapped = function (...args) {
    const tracer = trace.getTracer('otel-proxy');
    return tracer.startActiveSpan(methodName, (span) => {
      if (defaultAttributes) {
        span.setAttributes(defaultAttributes);
      }
      try {
        const result = func.apply(target, args);
        if (result instanceof Promise) {
          return result
            .then((result) => {
              span.end();
              return result;
            })
            .catch((error) => {
              span.recordException(error);
              if (!(error instanceof DomainError)) {
                span.setStatus({
                  code: 2, /* SpanStatusCode.ERROR */
                  message: error.message,
               });
              }
              span.end();
              throw error;
            });
        }
        span.end();
        return result;
      } catch (error) {
        span.recordException(error);
        if (!(error instanceof DomainError)) {
          span.setStatus({
            code: 2, /* SpanStatusCode.ERROR */
            message: error.message,
          });
        }
        span.end();
        throw error;
      }
    });
  };

  wrapped[otelProxySymbol] = true;
  return wrapped;
}

function wrapObject(resource, name, defaultAttributes) {
  if (isAlreadyProxied(resource)) return resource;

  return new Proxy(resource, {
    get: (target, prop) => {
      if (prop === otelProxySymbol) {
        return true;
      }

      const value = target[prop];

      if (typeof value === 'function') {
        return wrapFunction(value, target, `${name}->${prop.toString()}`, defaultAttributes);
      }
      if (typeof value === 'object' && value !== null) {
        return wrapObject(value, name, defaultAttributes);
      }

      return value;
    },
  });
}

/**
 * Wraps an object or function with an OpenTelemetry proxy that automatically
 * creates a span around each method call (or the call itself, if `resource`
 * is a function).
 *
 * @param {object|Function} resource - The object whose methods should be traced, or a function to trace directly.
 * @param {string} name - Base name used to build span names (e.g. `${name}->${methodName}`).
 * @param {Record<string, unknown>} [defaultAttributes] - Attributes set on every span created by this proxy.
 * @returns {object|Function} A proxy (or wrapped function) that behaves like `resource` but emits spans.
 */
export function otelProxy(resource, name, defaultAttributes) {
  if (typeof resource === 'function') {
    return wrapFunction(resource, null, name, defaultAttributes);
  }
  return wrapObject(resource, name, defaultAttributes);
}
