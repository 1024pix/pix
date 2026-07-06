import { trace } from '@opentelemetry/api';

const otelProxySymbol = Symbol('otelProxy');

function isAlreadyProxied(resource) {
  return resource[otelProxySymbol] === true;
}

function wrapFunction(func, target, methodName, defaultAttributes) {
  if (isAlreadyProxied(func)) return func;

  const wrapped = function (...args) {
    const tracer = trace.getTracer("otel-proxy");
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
              span.end();
              throw error;
            });
        }
        span.end();
        return result;
      } catch (error) {
        span.recordException(error);
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

      if (typeof value === "function") {
        return wrapFunction(
          value,
          target,
          `${name}->${prop.toString()}`,
          defaultAttributes,
        );
      }
      if (typeof value === "object" && value !== null) {
        return wrapObject(value, name, defaultAttributes);
      }

      return value;
    },
  });
}

export function otelProxy(resource, name, defaultAttributes) {
  if (typeof resource === 'function') {
    return wrapFunction(resource, null, name, defaultAttributes);
  }
  return wrapObject(resource, name, defaultAttributes);
}
