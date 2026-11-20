import { Function as PprofFunction, Line, Location, Profile, Sample, StringTable, ValueType } from 'pprof-format';

const ROOT_FUNCTION_NAME = '(root)';

/**
 * Convertit un profil d'allocations rendu par `HeapProfiler.stopSampling` au
 * format pprof, celui qu'accepte le receiver `pprof` du collector OpenTelemetry.
 *
 * Chaque nœud de l'arbre V8 porte la taille allouée à ce point précis de sa
 * pile (`selfSize`) : il devient un échantillon pprof dont la pile va du nœud
 * jusqu'à la racine, feuille en tête comme le veut le format.
 *
 * Le fichier et la ligne sont recopiés dans le nom de la fonction : OpenObserve
 * ne garde que les noms dans la colonne `stack`, et un `(anonymous)` ou un
 * `from` sans emplacement ne dit pas quelle partie du code alloue.
 *
 * @param {object} profile profil rendu par `HeapProfiler.stopSampling`
 * @param {object} params
 * @param {number} params.startedAt début de la fenêtre, en millisecondes epoch
 * @param {number} params.durationMs durée de la fenêtre
 * @param {number} params.samplingInterval intervalle d'échantillonnage, en octets
 * @param {string} [params.rootPath] préfixe retiré des chemins de fichiers
 * @returns {Uint8Array} le profil pprof encodé, non compressé
 */
export function encodeAllocationProfileAsPprof(
  profile,
  { startedAt, durationMs, samplingInterval, rootPath = process.cwd() },
) {
  const stringTable = new StringTable();
  const functions = new Map();
  const locations = new Map();
  const samples = [];

  function getFunctionId(callFrame) {
    const name = formatFrameName(callFrame, rootPath);
    let fn = functions.get(name);
    if (!fn) {
      fn = new PprofFunction({
        id: functions.size + 1,
        name: stringTable.dedup(name),
        filename: stringTable.dedup(toRelativePath(callFrame.url, rootPath)),
      });
      functions.set(name, fn);
    }
    return fn.id;
  }

  function getLocationId(callFrame) {
    const key = `${callFrame.functionName}|${callFrame.url}|${callFrame.lineNumber}|${callFrame.columnNumber}`;
    let location = locations.get(key);
    if (!location) {
      location = new Location({
        id: locations.size + 1,
        // `lineNumber` est compté à partir de 0 par le protocole inspector
        line: [new Line({ functionId: getFunctionId(callFrame), line: callFrame.lineNumber + 1 })],
      });
      locations.set(key, location);
    }
    return location.id;
  }

  // parcours itératif : une pile profonde ne doit pas faire déborder celle du process
  const pending = [{ node: profile.head, stack: [] }];
  while (pending.length > 0) {
    const { node, stack } = pending.pop();
    const nodeStack =
      node.callFrame.functionName === ROOT_FUNCTION_NAME && !node.callFrame.url
        ? stack
        : [getLocationId(node.callFrame), ...stack];

    if (node.selfSize > 0 && nodeStack.length > 0) {
      samples.push(new Sample({ locationId: nodeStack, value: [node.selfSize] }));
    }
    for (const child of node.children ?? []) {
      pending.push({ node: child, stack: nodeStack });
    }
  }

  const bytesValueType = () =>
    new ValueType({ type: stringTable.dedup('alloc_space'), unit: stringTable.dedup('bytes') });

  return new Profile({
    sampleType: [bytesValueType()],
    sample: samples,
    location: [...locations.values()],
    function: [...functions.values()],
    stringTable,
    timeNanos: BigInt(startedAt) * 1_000_000n,
    durationNanos: BigInt(durationMs) * 1_000_000n,
    periodType: bytesValueType(),
    period: samplingInterval,
  }).encode();
}

function formatFrameName({ functionName, url, lineNumber }, rootPath) {
  const name = functionName || '(anonymous)';
  if (!url) return name;
  return `${name} (${toRelativePath(url, rootPath)}:${lineNumber + 1})`;
}

function toRelativePath(url, rootPath) {
  if (!url) return '';
  const path = url.startsWith('file://') ? url.slice('file://'.length) : url;
  return path.startsWith(`${rootPath}/`) ? path.slice(rootPath.length + 1) : path;
}
