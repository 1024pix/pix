import { trace } from '@opentelemetry/api';

import { otelProxy, preventTracingSymbol } from './otel_proxy.js';

/**
 * Helpers to interact with the currently active OpenTelemetry span, if any.
 * All methods are no-ops when there is no active span.
 */
export const tracing = {
  /**
   * Add attributes to the currently active span, namespacing each key with a prefix.
   *
   * @param {Record<string, string|number|boolean>} attributes - Key/value attributes to set on the span.
   * @param {string} [prefix="pix"] - Prefix prepended to each attribute key (as `${prefix}.${key}`). Falsy disables prefixing.
   */
  addAttributes: function (attributes, prefix = 'pix') {
    if (!prefix) {
      trace.getActiveSpan()?.setAttributes(attributes);
    }
    const prefixedAttributes = Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [`${prefix}.${key}`, value]),
    );
    trace.getActiveSpan()?.setAttributes(prefixedAttributes);
  },
  /**
   * Record an exception on the currently active span.
   *
   * @param {Error} exception - The exception to record.
   */
  recordException: function (exception) {
    trace.getActiveSpan()?.recordException(exception);
  },
  /**
   * Mark the currently active span as being in error.
   *
   * @param {string} [reason] - The reason to set on the span status.
   */
  markAsFailed: function (reason) {
    trace.getActiveSpan()?.setStatus({
      code: 2 /* SpanStatusCode.ERROR */,
      message: reason,
    });
  },
  /**
   * Wraps an object or function with an OpenTelemetry proxy that automatically
   * creates a span around each method call (or the call itself, if `resource`
   * is a function).
   *
   * @param {string} name - Base name used to build span names (e.g. `${name}->${methodName}`).
   * @param {object|Function} resource - The object whose methods should be traced, or a function to trace directly.
   * @param {() => import('@opentelemetry/api').SpanOptions} [getSpanOptionsFn] - A function that returns SpanOptions to set on every span created by this proxy.
   * @returns {object|Function} A proxy (or wrapped function) that behaves like `resource` but emits spans.
   */
  spanify: function (name, resource, getSpanOptionsFn) {
    return otelProxy(resource, name, getSpanOptionsFn);
  },

  /**
   * Add an event to the currently active span.
   *
   * @param {string} name - Name of the event.
   * @param {Record<string, string|number|boolean>} [attributes] - Key/value attributes attached to the event.
   */
  recordEvent: function (name, attributes) {
    trace.getActiveSpan()?.addEvent(name, attributes);
  },

  /**
   * Mark an object as excluded from tracing, so that {@link tracing.spanify}
   * returns it as-is instead of wrapping it in an OpenTelemetry proxy.
   *
   * @param {object} resource - The object to exclude from tracing.
   * @returns {object} The same `resource`, for chaining.
   */
  prevent: function (resource) {
    resource[preventTracingSymbol] = true;
    return resource;
  },
};
