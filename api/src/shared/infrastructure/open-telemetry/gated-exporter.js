import { isDataExportEnabled } from './state.js';

/**
 * Builds an exporter class that only sends data when the `isOpenTelemetryEnabled` feature toggle
 * is on, and reports an immediate success otherwise.
 *
 * The gate is evaluated on every export rather than at startup, so switching the feature toggle
 * takes effect on the next export batch, without restarting the process. Spans, metrics and log
 * records keep being collected while the toggle is off; they are simply dropped instead of being
 * sent, which keeps the processors' queues draining normally.
 *
 * Subclassing the exporter (rather than wrapping it) keeps everything else untouched: the
 * OTLP exporters carry state and optional methods (`selectAggregationTemporality`,
 * `selectAggregation`) whose presence the SDK checks for.
 *
 * @template {new (...args: any[]) => { export: Function }} ExporterClass
 * @param {ExporterClass} Exporter - The OTLP exporter class to gate.
 * @returns {ExporterClass} The same exporter, exporting only when the feature toggle is on.
 */
export function withDataExportGate(Exporter) {
  return class GatedExporter extends Exporter {
    export(items, resultCallback) {
      if (!isDataExportEnabled()) {
        resultCallback({ code: 0 /* ExportResultCode.SUCCESS */ });
        return;
      }
      super.export(items, resultCallback);
    }
  };
}
