/**
 * OpenTelemetry state for the current process.
 *
 * Two distinct things are tracked here:
 *
 * - `initialized`: whether `initializeOpenTelemetry` ran in this process, i.e. whether the
 *   process was started with the `tracing*.js` preload. It decides whether the instrumentations
 *   that can only be installed at boot time (the Hapi instrumentation, the `tracing.spanify`
 *   proxies) are installed at all.
 * - `dataExportEnabled`: whether the collected data is actually sent to the OpenTelemetry
 *   backend. It mirrors the `isOpenTelemetryEnabled` feature toggle and can change at any time,
 *   without restarting the process: the exporters read it on every export (see
 *   `gated-exporter.js`).
 *
 * The values are kept in this module rather than read from the feature toggles client directly
 * because the readers are synchronous, and because `otel_proxy.js` cannot import that client
 * without a circular dependency (`feature-toggles-client.js` → `utils/logger.js` →
 * `open-telemetry/helpers.js` → `open-telemetry/otel_proxy.js`).
 */
let initialized = false;
let dataExportEnabled = false;

/**
 * @returns {boolean} `true` when the OpenTelemetry SDK has been started in this process.
 */
export function isOpenTelemetryInitialized() {
  return initialized;
}

/**
 * @param {boolean} value
 */
export function setOpenTelemetryInitialized(value) {
  initialized = value;
}

/**
 * @returns {boolean} `true` when the collected data must be sent to the OpenTelemetry backend.
 */
export function isDataExportEnabled() {
  return dataExportEnabled;
}

/**
 * @param {boolean} value
 */
export function setDataExportEnabled(value) {
  dataExportEnabled = value;
}
