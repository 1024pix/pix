import { evaluationUsecases } from '../../domain/usecases/index.js';
import { KnowledgeStateDTO } from './models/KnowledgeStateDTO.js';

/**
 * L'état de connaissance de l'utilisateur, projeté pour les autres contextes :
 * les acquis validés au référentiel courant, et le plancher de chaque tube.
 *
 * @param {{userId: number}} payload
 * @returns {Promise<KnowledgeStateDTO>}
 */
export async function getKnowledgeStateForUser({ userId }) {
  const knowledgeState = await evaluationUsecases.getKnowledgeStateForUser({ userId });

  return new KnowledgeStateDTO({
    validatedSkillIds: knowledgeState.validatedSkills().map(({ id }) => id),
    floorByTubeId: Object.fromEntries(
      knowledgeState.tubeIds.map((tubeId) => [tubeId, knowledgeState.boundsOf(tubeId).floor]),
    ),
  });
}
