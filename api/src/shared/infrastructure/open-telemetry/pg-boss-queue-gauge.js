import { AggregationType } from '@opentelemetry/sdk-metrics';

const PG_BOSS_QUEUE_JOBS_METRIC = 'pgboss.queue.jobs';
const PG_BOSS_QUEUE_JOBS_CONTAINER = 'worker-1';

/**
 * pg-boss publie la jauge pgboss.queue.jobs depuis chaque processus qui le démarre, conteneurs
 * web compris. Ses valeurs sont lues dans la base des jobs et sont donc identiques partout : sur
 * Scalingo, seul le conteneur worker-1 la garde. Hors Scalingo (CONTAINER absent), elle est gardée.
 *
 * @param {string|undefined} container - le nom du conteneur Scalingo (variable CONTAINER)
 * @returns {Array<import('@opentelemetry/sdk-metrics').ViewOptions>}
 */
export function pgBossQueueGaugeViews(container) {
  if (container === undefined || container === PG_BOSS_QUEUE_JOBS_CONTAINER) return [];
  return [{ instrumentName: PG_BOSS_QUEUE_JOBS_METRIC, aggregation: { type: AggregationType.DROP } }];
}
