import { Session } from 'node:inspector';
import { promisify } from 'node:util';

/**
 * Démarre le profileur d'allocation échantillonné de V8 et rend une prise pour
 * l'arrêter.
 *
 * Le profileur n'existe qu'à un exemplaire par isolate, partagé par toutes les
 * sessions inspector du process : un second `startSampling` répond `{}` sans
 * rien changer — ni l'intervalle, ni la fenêtre — et le premier `stopSampling`
 * emporte le profil. Seul l'export continu s'en sert, une fenêtre après l'autre.
 *
 * `node:inspector` plutôt que `node:inspector/promises`, encore expérimental.
 *
 * @param {object} params
 * @param {number} params.samplingInterval un échantillon par tranche de N octets alloués
 * @param {boolean} [params.includeCollected] inclure les objets déjà collectés
 * @returns {Promise<{ stop: () => Promise<object> }>}
 */
export async function startSampling({ samplingInterval, includeCollected = false }) {
  const session = new Session();
  session.connect();
  const post = promisify(session.post.bind(session));

  try {
    await post('HeapProfiler.startSampling', {
      samplingInterval,
      // V8 retire du profil les échantillons dont l'objet a depuis été collecté :
      // par défaut il ne reste que les allocations qui ont survécu à la fenêtre.
      // Les inclure rend visibles les allocations transitoires.
      includeObjectsCollectedByMajorGC: includeCollected,
      includeObjectsCollectedByMinorGC: includeCollected,
    });
  } catch (error) {
    session.disconnect();
    throw error;
  }

  return {
    async stop() {
      try {
        const { profile } = await post('HeapProfiler.stopSampling');
        return profile;
      } finally {
        session.disconnect();
      }
    },
  };
}
