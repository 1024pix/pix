import { Session } from 'node:inspector';
import { promisify } from 'node:util';

/**
 * Démarre le profileur d'allocation échantillonné de V8 et rend une prise pour
 * l'arrêter.
 *
 * Le profileur n'existe qu'à un exemplaire par isolate, partagé par toutes les
 * sessions inspector du process : un second `startSampling` répond `{}` sans
 * rien changer — ni l'intervalle, ni la fenêtre — et le premier `stopSampling`
 * emporte le profil, les suivants échouant sur « V8 sampling heap profiler was
 * not started ». Le verrou du recorder n'est donc pas qu'une précaution de
 * coût : c'est ce qui garantit qu'une demande ne vole pas le profil d'une autre.
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
      // par défaut il ne reste que les allocations qui ont survécu à la fenêtre,
      // c'est-à-dire précisément ce qu'on cherche quand on traque une fuite.
      // Les inclure répond à l'autre question, celle de la pression sur le GC.
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
