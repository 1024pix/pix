import { databaseBuffer } from '../database-buffer.js';

/**
 * État de connaissance d'un utilisateur sur un tube.
 *
 * À utiliser lorsqu'un test a besoin d'un profil déjà constitué sans passer par
 * des réponses — typiquement pour représenter un utilisateur ancien dont les
 * réponses ont été purgées.
 */
const buildKnowledgeState = function ({
  userId,
  tubeId,
  floor = 0,
  ceiling = null,
  directLevels = [],
  updatedAt = new Date('2020-01-01'),
} = {}) {
  const values = { userId, tubeId, floor, ceiling, directLevels, updatedAt };

  // Un utilisateur n'a qu'un état par tube. Décrire cet état après l'avoir
  // laissé se constituer — par des réponses ou des knowledge elements — le
  // remplace, au lieu d'ajouter une ligne que la base refuserait.
  const existing = (databaseBuffer.objectsToInsert['knowledge-states'] ?? []).find(
    (state) => state.userId === userId && state.tubeId === tubeId,
  );
  if (existing) {
    return Object.assign(existing, values);
  }

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-states',
    values,
  });
};

export { buildKnowledgeState };
