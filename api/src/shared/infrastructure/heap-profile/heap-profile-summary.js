/**
 * Agrège les tailles échantillonnées par site d'allocation.
 *
 * Un profil est un arbre de piles d'appels, où la taille portée par un nœud
 * (`selfSize`) est celle des objets alloués à ce point précis *de cette pile*.
 * Un même site réapparaît donc autant de fois qu'il est atteint par des chemins
 * différents : les additionner est ce qui répond à « qui alloue », là où
 * l'arbre répond à « par quel chemin ».
 *
 * @param {object} profile profil rendu par `HeapProfiler.stopSampling`
 * @param {object} [options]
 * @param {number} [options.limit] nombre de sites rendus
 * @returns {Array<{ site: string, bytes: number }>} du plus gros au plus petit
 */
export function summarizeAllocationSites(profile, { limit = 10 } = {}) {
  const bytesBySite = new Map();

  (function walk(node) {
    if (node.selfSize > 0) {
      const { functionName, url, lineNumber } = node.callFrame;
      // `lineNumber` est compté à partir de 0 par le protocole inspector, à
      // l'inverse de ce qu'affiche un éditeur
      const site = `${functionName || '(anonyme)'} (${url || 'natif'}:${lineNumber + 1})`;
      bytesBySite.set(site, (bytesBySite.get(site) ?? 0) + node.selfSize);
    }
    for (const child of node.children ?? []) walk(child);
  })(profile.head);

  return [...bytesBySite.entries()]
    .map(([site, bytes]) => ({ site, bytes }))
    .toSorted((siteA, siteB) => siteB.bytes - siteA.bytes)
    .slice(0, limit);
}
