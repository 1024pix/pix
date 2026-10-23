import { getMemoryBreakdown } from '../heap-profile/memory-breakdown.js';
import { Metrics } from './metrics.js';

/**
 * Correspondance entre les valeurs du gauge et les champs de la décomposition
 * mémoire. `swap` est la raison d'être de ce gauge : le RSS seul, que remontent
 * déjà les métriques par défaut, baisse quand le noyau envoie des pages en swap,
 * et fait croire qu'un conteneur au plafond de sa mémoire en a libéré.
 */
const MEMORY_TYPES = {
  rss: 'VmRSS',
  rss_anon: 'RssAnon',
  rss_file: 'RssFile',
  swap: 'VmSwap',
  heap_used: 'heapUsed',
  heap_physical: 'heapPhysicalTotal',
  external: 'external',
  native_unaccounted: 'nativeUnaccounted',
};

const defaultDependencies = {
  getMemoryBreakdown,
  createGauge: Metrics.createGauge,
};

/**
 * Expose en continu la décomposition mémoire du process, pour suivre sur
 * plusieurs heures ce que les profils de tas ne mesurent qu'au début et à la
 * fin de leur fenêtre.
 */
export function registerMemoryMetrics(dependencies = {}) {
  const { getMemoryBreakdown, createGauge } = { ...defaultDependencies, ...dependencies };

  return createGauge({
    name: 'process_memory_bytes',
    help: 'Process memory breakdown (RSS, swap, V8 heap, external, unaccounted native memory)',
    labelNames: ['type'],
    async collect() {
      const breakdown = await getMemoryBreakdown();
      for (const [type, field] of Object.entries(MEMORY_TYPES)) {
        // hors Linux, les champs lus dans /proc n'existent pas
        if (breakdown[field] !== undefined) this.set({ type }, breakdown[field]);
      }
    },
  });
}
