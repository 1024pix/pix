import { trace } from '@opentelemetry/api';

import { config } from '../../config.js';
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
                  code: 2 /* SpanStatusCode.ERROR */,
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
            code: 2 /* SpanStatusCode.ERROR */,
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

  // Wrapping a method or a nested object allocates a new closure/Proxy, so
  // it's cached per property here - without it, every single property
  // access (not just every call) would pay that allocation cost again.
  // Keyed by the raw value too, so a property reassigned at runtime (e.g. a
  // swapped-out dependency) still gets re-wrapped instead of serving a proxy
  // over the old value.
  const wrappedMembers = new Map(); // prop -> { rawValue, wrapped }

  return new Proxy(resource, {
    get: (target, prop) => {
      if (prop === otelProxySymbol) {
        return true;
      }

      const value = target[prop];
      const cached = wrappedMembers.get(prop);
      if (cached && cached.rawValue === value) {
        return cached.wrapped;
      }

      // Only cache the wrapping itself (closure/Proxy allocation), not
      // plain values - those are returned straight from `target` so
      // mutations to the underlying resource stay visible through the proxy.
      if (typeof value === 'function') {
        const wrapped = wrapFunction(value, target, `${name}->${prop.toString()}`, defaultAttributes);
        wrappedMembers.set(prop, { rawValue: value, wrapped });
        return wrapped;
      }
      if (typeof value === 'object' && value !== null) {
        const wrapped = wrapObject(value, name, defaultAttributes);
        wrappedMembers.set(prop, { rawValue: value, wrapped });
        return wrapped;
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
  if (!config.logging.otelEnabled) {
    return resource;
  }
  if (typeof resource === 'function') {
    return wrapFunction(resource, null, name, defaultAttributes);
  }
  if (typeof resource === 'object') {
    return wrapObject(resource, name, defaultAttributes);
  }
  return resource;
}
