import { config } from '../../../../config/config.js';
import { getTopic } from '../pubsub.js';
import { matchesContainerSelector } from '../utils/container-selector.js';
import { child } from '../utils/logger.js';
import { recordHeapProfile } from './heap-profile-recorder.js';

export const HEAP_PROFILE_REQUEST_TOPIC = 'heap-profile:request';
export const HEAP_PROFILE_RESULT_TOPIC = 'heap-profile:result';

/**
 * Met le process à l'écoute des demandes de profilage publiées sur Redis.
 *
 * La demande est diffusée à tous les conteneurs abonnés ; chacun décide s'il est
 * concerné en comparant son propre `CONTAINER` au sélecteur porté par le message
 * (cf. `container-selector.js`). C'est ce qui permet de ne viser
 * qu'un conteneur : profiler n'est pas cher, mais un profil n'a d'intérêt que
 * rapporté au conteneur qui fuit.
 *
 * Deux messages repartent sur le topic de résultat : un accusé au démarrage —
 * sans quoi le script déclencheur attendrait la fenêtre entière sans savoir si
 * quelqu'un l'a prise — puis le profil lui-même à la fermeture de la fenêtre.
 */
export function startHeapProfileListener(dependencies = {}) {
  const {
    enabled = config.heapProfile.enabled,
    maxRequestAge = config.heapProfile.maxRequestAge,
    containerName = config.infra.containerName,
    recordProfile = recordHeapProfile,
    now = Date.now,
    logger = child('heap-profile', { event: 'heap-profile' }),
  } = dependencies;

  if (!enabled) return;

  // après le garde-fou : construire un topic ouvre des connexions Redis, inutile
  // tant que la fonctionnalité est désactivée
  const { requestTopic = getTopic(HEAP_PROFILE_REQUEST_TOPIC), resultTopic = getTopic(HEAP_PROFILE_RESULT_TOPIC) } =
    dependencies;

  logger.info({ containerName }, 'écoute des demandes de profilage des allocations');

  requestTopic.subscribe(async (request) => {
    const { requestId, containers, durationMs, samplingInterval, includeCollected, reason, requestedAt } =
      request ?? {};

    if (!matchesContainerSelector(containers, containerName)) return;

    // Redis ne rejoue rien, mais un message peut attendre derrière une boucle
    // d'événements bloquée : au-delà de `maxRequestAge`, la demande ne
    // correspond plus à ce que l'opérateur observait.
    const requestAge = now() - (requestedAt ?? now());
    if (requestAge > maxRequestAge) {
      logger.warn({ requestId, requestAge }, 'demande de profilage périmée, ignorée');
      return;
    }

    const publishResult = (result) => resultTopic.publish({ ...result, requestId, container: containerName });

    const result = await recordProfile({
      durationMs,
      samplingInterval,
      includeCollected,
      reason,
      onStarted: publishResult,
    });

    publishResult(result);
  });
}
