import { setTimeout as wait } from 'node:timers/promises';
import { promisify } from 'node:util';
import { getHeapStatistics } from 'node:v8';
import { gzip } from 'node:zlib';

import { config } from '../../../../config/config.js';
import { child } from '../utils/logger.js';
import { summarizeAllocationSites } from './heap-profile-summary.js';
import { startSampling } from './sampling-heap-profiler.js';

export const PROFILE_STATUS = {
  STARTED: 'started',
  DONE: 'done',
  SKIPPED: 'skipped',
  FAILED: 'failed',
};

export const SKIP_REASON = {
  IN_PROGRESS: 'in-progress',
};

/**
 * Le profil repart dans un message pub/sub, gzippé puis encodé en base64. Ça
 * tient parce qu'un profil pèse quelques dizaines de kilo-octets ; au-delà de
 * cette borne, la fenêtre ou l'intervalle demandés ont produit autre chose que
 * ce que le dispositif prévoit, et le message n'a rien à faire sur Redis.
 */
const MAX_COMPRESSED_PROFILE_BYTES = 4 * 1024 * 1024;

const gzipAsync = promisify(gzip);

const defaultDependencies = {
  startSampling,
  getHeapStatistics,
  getRss: process.memoryUsage.rss,
  compress: gzipAsync,
  wait,
  now: Date.now,
  defaultDuration: config.heapProfile.defaultDuration,
  maxDuration: config.heapProfile.maxDuration,
  defaultSamplingInterval: config.heapProfile.samplingInterval,
  logger: child('heap-profile', { event: 'heap-profile' }),
};

/**
 * Construit la fonction qui profile les allocations du process pendant une
 * fenêtre donnée et rend le profil, prêt à être publié.
 *
 * Contrairement à un snapshot du tas, l'opération ne coûte presque rien : le
 * profileur intercepte une allocation par tranche de `samplingInterval` octets
 * et n'en retient que la pile d'appels. Le coût est un pourcentage de débit
 * pendant la fenêtre, et une centaine de millisecondes à l'arrêt — au lieu des
 * treize secondes de gel et des 2,4 Go de RSS d'un snapshot
 * (cf. docs/fr/profiling-memoire-node.md).
 *
 * Reste un verrou « un seul à la fois » : le profileur de V8 est unique dans le
 * process, deux fenêtres concurrentes se voleraient leur profil.
 *
 * Le profil ne dit pas qui *retient* la mémoire mais qui l'*alloue*, et
 * seulement pendant la fenêtre. En contrepartie, V8 écarte les échantillons dont
 * l'objet a été collecté : ce qui reste, ce sont les allocations qui ont
 * survécu, donc la fuite si elle progresse pendant la fenêtre.
 */
export function createHeapProfileRecorder(dependencies = {}) {
  const {
    startSampling,
    getHeapStatistics,
    getRss,
    compress,
    wait,
    now,
    defaultDuration,
    maxDuration,
    defaultSamplingInterval,
    logger,
  } = { ...defaultDependencies, ...dependencies };

  let isInProgress = false;

  return async function recordHeapProfile({
    durationMs,
    samplingInterval = defaultSamplingInterval,
    includeCollected = false,
    reason,
    onStarted,
  } = {}) {
    if (isInProgress) {
      logger.warn({ reason }, 'un profilage est déjà en cours, demande ignorée');
      return {
        status: PROFILE_STATUS.SKIPPED,
        skipReason: SKIP_REASON.IN_PROGRESS,
      };
    }

    // une fenêtre bornée : le profileur ne doit pas rester armé indéfiniment
    // parce qu'une demande portait une durée fantaisiste
    const effectiveDuration = Math.min(durationMs ?? defaultDuration, maxDuration);

    isInProgress = true;
    const startedAt = now();
    const heapUsedBefore = getHeapStatistics().used_heap_size;
    const rssBefore = getRss();

    // gardé hors du `try` pour que le `finally` puisse désarmer le profileur si
    // la fenêtre s'interrompt avant son terme
    let sampling;

    try {
      sampling = await startSampling({ samplingInterval, includeCollected });

      logger.info(
        {
          reason,
          durationMs: effectiveDuration,
          samplingInterval,
          includeCollected,
          heapUsedBefore,
          rssBefore,
        },
        'profilage des allocations : démarré',
      );
      await onStarted?.({
        status: PROFILE_STATUS.STARTED,
        durationMs: effectiveDuration,
        samplingInterval,
        includeCollected,
      });

      // `ref: false` : la fenêtre ne doit pas retarder l'arrêt du conteneur. Le
      // process reste vivant de lui-même — serveur HTTP, abonnements Redis — et
      // s'il ne l'est plus, le profil n'intéresse plus personne.
      await wait(effectiveDuration, undefined, { ref: false });

      const profile = await sampling.stop();
      sampling = undefined;

      const heapUsedAfter = getHeapStatistics().used_heap_size;
      const rssAfter = getRss();
      const serializedProfile = JSON.stringify(profile);
      const compressedProfile = await compress(serializedProfile);
      const topAllocationSites = summarizeAllocationSites(profile, {
        limit: 5,
      });

      if (compressedProfile.length > MAX_COMPRESSED_PROFILE_BYTES) {
        logger.error(
          { reason, compressedBytes: compressedProfile.length },
          'profil trop volumineux pour être publié, demande abandonnée',
        );
        return {
          status: PROFILE_STATUS.FAILED,
          error: `profil de ${compressedProfile.length} octets compressés, au-delà de la limite de ${MAX_COMPRESSED_PROFILE_BYTES}`,
        };
      }

      const result = {
        status: PROFILE_STATUS.DONE,
        profile: compressedProfile.toString('base64'),
        samples: profile.samples?.length ?? 0,
        profileBytes: serializedProfile.length,
        compressedBytes: compressedProfile.length,
        durationMs: effectiveDuration,
        samplingInterval,
        includeCollected,
        heapUsedBefore,
        heapUsedAfter,
        rssBefore,
        rssAfter,
      };

      // les sites d'allocation sont aussi journalisés : c'est le seul endroit où
      // ils restent si la sortie du script déclencheur a été perdue
      logger.info(
        {
          ...result,
          profile: undefined,
          topAllocationSites,
          elapsedMs: now() - startedAt,
        },
        'profilage des allocations : terminé',
      );

      return result;
    } catch (error) {
      logger.error({ err: error, reason }, 'profilage des allocations : échec');
      return { status: PROFILE_STATUS.FAILED, error: error.message };
    } finally {
      // une fenêtre interrompue — un `publish` qui échoue, par exemple — laisse
      // le profileur de V8 armé, et il volerait son profil à la demande
      // suivante : le désarmer est la seule façon de revenir à un état sain
      await sampling?.stop().catch((error) => logger.debug({ err: error }, 'profileur déjà arrêté, rien à désarmer'));
      isInProgress = false;
    }
  };
}

export const recordHeapProfile = createHeapProfileRecorder();
