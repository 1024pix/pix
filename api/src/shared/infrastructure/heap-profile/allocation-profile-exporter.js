import { setTimeout as wait } from 'node:timers/promises';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

import { config } from '../../../../config/config.js';
import { isDataExportEnabled } from '../open-telemetry/state.js';
import { child } from '../utils/logger.js';
import { encodeAllocationProfileAsPprof } from './pprof-encoder.js';
import { SamplingAlreadyInProgressError, startSampling } from './sampling-heap-profiler.js';

const EXPORT_TIMEOUT_MS = 10_000;

const defaultDependencies = {
  endpoint: config.heapProfile.export.endpoint,
  windowDuration: config.heapProfile.export.window,
  samplingInterval: config.heapProfile.samplingInterval,
  containerName: config.infra.containerName,
  isDataExportEnabled,
  startSampling,
  encode: encodeAllocationProfileAsPprof,
  compress: promisify(gzip),
  fetch: (...args) => globalThis.fetch(...args),
  wait,
  now: Date.now,
  logger: child('heap-profile', { event: 'heap-profile-export' }),
};

/**
 * Construit la fonction qui profile les allocations du process pendant une
 * fenêtre, puis pousse le profil au receiver `pprof` du collector
 * OpenTelemetry (mode `server`, `POST /v1/pprof`), qui le transmet à
 * OpenObserve comme profil OTLP.
 *
 * Contrairement au profilage à la demande, les objets déjà collectés sont
 * inclus : la question n'est pas « qui retient la mémoire » mais « quel code a
 * alloué pendant cette fenêtre ». C'est ce qui rend visibles les sauts du tas
 * causés par des allocations transitoires — un gros résultat SQL, une
 * sérialisation — qu'un profil limité aux survivants ne montre pas.
 *
 * Le pprof ne porte pas de ressource OpenTelemetry : le service et le conteneur
 * voyagent dans des en-têtes, que le collector recopie en attributs de
 * ressource (cf. docs/fr/profiling-memoire-node.md).
 *
 * @returns {() => Promise<void>} profile une fenêtre puis l'exporte ; ne lève jamais
 */
export function createAllocationProfileExporter(dependencies = {}) {
  const {
    serviceName,
    endpoint,
    windowDuration,
    samplingInterval,
    containerName,
    isDataExportEnabled,
    startSampling,
    encode,
    compress,
    fetch,
    wait,
    now,
    logger,
  } = { ...defaultDependencies, ...dependencies };

  const headers = {
    'content-type': 'application/octet-stream',
    'content-encoding': 'gzip',
    'x-service-name': serviceName,
    ...(containerName && { 'x-scalingo-container': containerName }),
  };

  return async function exportAllocationProfileWindow() {
    // le feature toggle d'OpenTelemetry coupe aussi le profileur : inutile de
    // payer l'échantillonnage pour un profil qui ne partira pas
    if (!isDataExportEnabled()) {
      await wait(windowDuration, undefined, { ref: false });
      return;
    }

    let sampling;
    try {
      sampling = await startSampling({ samplingInterval, includeCollected: true });
    } catch (error) {
      if (error instanceof SamplingAlreadyInProgressError) {
        logger.debug('profileur tenu par un profilage à la demande, fenêtre sautée');
      } else {
        logger.warn({ err: error }, "export des allocations : le profileur n'a pas démarré");
      }
      await wait(windowDuration, undefined, { ref: false });
      return;
    }

    try {
      const startedAt = now();
      // `ref: false` : la fenêtre ne doit pas retarder l'arrêt du conteneur
      await wait(windowDuration, undefined, { ref: false });

      const profile = await sampling.stop();
      sampling = undefined;
      const durationMs = now() - startedAt;

      const body = await compress(encode(profile, { startedAt, durationMs, samplingInterval }));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(EXPORT_TIMEOUT_MS),
      });

      if (!response.ok) {
        logger.warn({ status: response.status, endpoint }, 'export des allocations : refusé par le collector');
      }
    } catch (error) {
      logger.warn({ err: error, endpoint }, 'export des allocations : échec');
    } finally {
      await sampling?.stop().catch((error) => logger.debug({ err: error }, 'profileur déjà arrêté'));
    }
  };
}

/**
 * Enchaîne les fenêtres d'export tant que le process vit.
 *
 * @param {object} params
 * @param {string} params.serviceName nom du service, celui passé à `initializeOpenTelemetry`
 */
export function startAllocationProfileExport({ serviceName, ...dependencies }) {
  const { enabled = config.heapProfile.export.enabled, logger = defaultDependencies.logger } = dependencies;
  if (!enabled) return;

  const exportWindow = createAllocationProfileExporter({ serviceName, ...dependencies });
  logger.info({ serviceName }, 'export continu des allocations vers le collector : démarré');

  (async function loop() {
    for (;;) await exportWindow();
  })();
}
