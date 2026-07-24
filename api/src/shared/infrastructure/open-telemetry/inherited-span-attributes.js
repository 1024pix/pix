/**
 * Lets attributes computed once (e.g. mid-request, once routing/auth info is known) be attached
 * automatically to every span started afterwards within the same request, instead of having to
 * call `span.setAttribute` on each span individually.
 *
 * Producers store attributes on the context with `setInheritedAttributes` and pass the resulting
 * context down to `tracer.startSpan`/`context.with`. `InheritedAttributesSpanProcessor` then reads
 * them back from each span's parent context in `onStart` and copies them onto the span.
 */
import { createContextKey } from '@opentelemetry/api';

/**
 * Context key under which inherited attributes are stored, as a plain object mapping attribute
 * name to value. Not exported for direct use - go through {@link setInheritedAttributes} to write
 * and {@link InheritedAttributesSpanProcessor} to read.
 */
const INHERITED_ATTRIBUTES_KEY = createContextKey('pix.inheritedAttributes');

/**
 * Returns a copy of `ctx` with `attributes` merged into whatever inherited attributes it already
 * carries (later calls win on key conflicts). Does not mutate `ctx`.
 *
 * @param {import('@opentelemetry/api').Context} ctx
 * @param {Record<string, unknown>} attributes
 * @returns {import('@opentelemetry/api').Context}
 */
export function setInheritedAttributes(ctx, attributes) {
  return ctx.setValue(INHERITED_ATTRIBUTES_KEY, { ...ctx.getValue(INHERITED_ATTRIBUTES_KEY), ...attributes });
}

/**
 * A `SpanProcessor` that, on every span start, copies the inherited attributes (if any) carried by
 * the span's parent context onto the span itself. Register it on the tracer provider (e.g. via
 * `NodeSDK`'s `spanProcessors` option) alongside the processor(s) actually responsible for
 * exporting spans - this one only annotates spans, it does not export them.
 *
 * @implements {import('@opentelemetry/sdk-trace').SpanProcessor}
 */
export class InheritedAttributesSpanProcessor {
  /**
   * @param {import('@opentelemetry/sdk-trace').Span} span
   * @param {import('@opentelemetry/api').Context} parentContext
   */
  onStart(span, parentContext) {
    const attributes = parentContext.getValue(INHERITED_ATTRIBUTES_KEY);
    if (attributes) {
      span.setAttributes(attributes);
    }
  }

  /**
   * No-op: this processor only annotates spans on start, it has nothing to do when they end.
   */
  onEnd() {
    // no-op
  }

  /**
   * No-op: this processor holds no buffered data to flush.
   * @returns {Promise<void>}
   */
  async forceFlush() {
    // no-op
  }

  /**
   * No-op: this processor holds no resources to release.
   * @returns {Promise<void>}
   */
  async shutdown() {
    // no-op
  }
}
