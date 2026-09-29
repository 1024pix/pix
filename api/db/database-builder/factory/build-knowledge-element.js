import { databaseBuffer } from '../database-buffer.js';
import { buildAssessment } from './build-assessment.js';
import { buildUser } from './build-user.js';
import { recordSkillOutcome } from './knowledge-state-writer.js';

/**
 * Place un utilisateur dans l'état de connaissance qu'un knowledge element
 * décrivait.
 *
 * Les knowledge elements ne sont plus une table : ils se déduisent de
 * `knowledge-states`, qui retient deux bornes par tube. Ce constructeur garde
 * sa signature pour les tests écrits avant la bascule, et traduit ce qu'on lui
 * confie — le plancher monte sur un acquis réussi, le plafond descend sur un
 * acquis raté.
 *
 * Pour un test qui décrit un état plutôt qu'un historique, `buildKnowledgeState`
 * est plus direct ; pour un test qui décrit un parcours, `buildAnsweredSkill`.
 */
const buildKnowledgeElement = function ({
  id = databaseBuffer.getNextId(),
  source = 'direct',
  status = 'validated',
  createdAt = new Date('2020-01-01'),
  earnedPix = 2,
  skillId = 'recABC123',
  assessmentId,
  answerId,
  userId,
  competenceId = 'recCHA789',
} = {}) {
  userId = userId ?? buildUser().id;
  assessmentId = assessmentId ?? buildAssessment({ userId }).id;

  recordSkillOutcome({
    userId,
    skillId,
    isOk: status === 'validated',
    createdAt,
  });

  // La valeur retournée décrit ce que le test a demandé, telle qu'elle se
  // relira une fois l'état déplié.
  return {
    id,
    source,
    status,
    createdAt,
    earnedPix: status === 'validated' ? earnedPix : 0,
    skillId,
    assessmentId,
    answerId,
    userId,
    competenceId,
  };
};

export { buildKnowledgeElement };
