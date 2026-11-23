import { readFile } from 'node:fs/promises';
import { getHeapSpaceStatistics } from 'node:v8';

const PROC_STATUS_FIELDS = ['VmRSS', 'RssAnon', 'RssFile', 'RssShmem', 'VmSwap'];

/**
 * Lit les compteurs mémoire que le noyau tient pour le process. Ils n'existent
 * que sous Linux : ailleurs — un poste de développement sous macOS — la
 * décomposition se contente de ce que Node sait mesurer lui-même.
 */
async function readProcStatus() {
  try {
    return await readFile('/proc/self/status', 'utf8');
  } catch {
    return undefined;
  }
}

function parseProcStatus(procStatus) {
  if (!procStatus) return {};

  const fields = {};
  for (const line of procStatus.split('\n')) {
    const [name, value] = line.split(':');
    if (PROC_STATUS_FIELDS.includes(name)) {
      // le noyau compte en kilo-octets (« 12345 kB ») ; tout le reste est en octets
      fields[name] = Number.parseInt(value) * 1024;
    } else if (name === 'Threads') {
      fields.threads = Number.parseInt(value);
    }
  }
  return fields;
}

const defaultDependencies = {
  memoryUsage: () => process.memoryUsage(),
  getHeapSpaceStatistics,
  readProcStatus,
};

/**
 * Décompose le RSS du process, pour savoir ce qui l'occupe quand le tas JS
 * n'en explique qu'une partie.
 *
 * Le profil d'allocations ne voit que le tas, alors qu'en production le RSS d'un
 * conteneur pèse trois fois le tas vivant, et qu'à tas égal il varie de plus de
 * 100 Mo d'un conteneur à l'autre. Ce qui manque se range dans quatre cases :
 *
 * - `RssFile` : binaire node, bibliothèques partagées, fichiers mappés. Fixe ;
 * - `heapPhysical` : les pages que V8 garde réservées, au-delà de `heapUsed`.
 *   V8 rend mal la mémoire : après un pic, le tas réservé reste au niveau du pic ;
 * - `external` : les Buffers et ArrayBuffers, hors du tas (sockets, PDF, gzip) ;
 * - `nativeUnaccounted` : le reste de la mémoire anonyme — malloc natif et sa
 *   fragmentation, piles des threads. Un gros reste oriente vers
 *   `MALLOC_ARENA_MAX` ou jemalloc plutôt que vers le code JS.
 *
 * `nativeUnaccounted` est une estimation : `external` compte aussi des octets
 * que le noyau n'a pas encore matérialisés. Sa tendance d'un conteneur à
 * l'autre est plus parlante que sa valeur absolue.
 */
export function createMemoryBreakdown(dependencies = {}) {
  const { memoryUsage, getHeapSpaceStatistics, readProcStatus } = { ...defaultDependencies, ...dependencies };

  return async function getMemoryBreakdown() {
    const { rss, heapTotal, heapUsed, external, arrayBuffers } = memoryUsage();
    const procStatus = parseProcStatus(await readProcStatus());

    const heapPhysical = Object.fromEntries(
      getHeapSpaceStatistics().map(({ space_name, physical_space_size }) => [space_name, physical_space_size]),
    );
    const heapPhysicalTotal = Object.values(heapPhysical).reduce((total, size) => total + size, 0);

    return {
      rss,
      heapTotal,
      heapUsed,
      heapPhysicalTotal,
      heapPhysical,
      external,
      arrayBuffers,
      ...procStatus,
      nativeUnaccounted:
        procStatus.RssAnon === undefined ? undefined : procStatus.RssAnon - heapPhysicalTotal - external,
    };
  };
}

export const getMemoryBreakdown = createMemoryBreakdown();
