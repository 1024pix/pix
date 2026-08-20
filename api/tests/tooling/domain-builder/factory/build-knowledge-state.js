import { KnowledgeState } from '../../../../src/shared/domain/models/KnowledgeState.js';
import { Skill } from '../../../../src/shared/domain/models/Skill.js';

/**
 * État de connaissance en mémoire, pour les tests unitaires.
 *
 * @param {Array<{tubeId: string, floor?: number, ceiling?: number, directLevels?: number[], updatedAt?: Date}>} tubes
 * @param {Skill[]} skills le référentiel dans lequel l'état se déplie
 */
const buildKnowledgeState = ({ tubes = [], skills = [] } = {}) => KnowledgeState.fromRows(tubes, { skills });

/**
 * État décrit acquis par acquis, chacun seul dans son tube : aucun lien
 * d'inférence entre eux, la granularité d'un enregistrement par acquis.
 */
buildKnowledgeState.forSkills = ({
  validatedSkillIds = [],
  invalidatedSkillIds = [],
  competenceId = 'recCOMP1',
  pixValue = 2,
  updatedAt,
} = {}) => {
  const skillOf = (id) => new Skill({ id, name: `@${id}`, difficulty: 1, tubeId: id, competenceId, pixValue });
  const tubes = [
    ...validatedSkillIds.map((id) => ({ tubeId: id, floor: 1, ceiling: null, directLevels: [1], updatedAt })),
    ...invalidatedSkillIds.map((id) => ({ tubeId: id, floor: 0, ceiling: 1, directLevels: [1], updatedAt })),
  ];
  const skills = [...validatedSkillIds, ...invalidatedSkillIds].map(skillOf);

  return KnowledgeState.fromRows(tubes, { skills });
};

/**
 * État constitué en répondant : chaque verdict resserre le tube du vrai
 * acquis, exactement comme en production.
 *
 * @param {Array<{skill: Skill, isOk?: boolean}>} answers
 */
buildKnowledgeState.fromAnswers = (answers) =>
  answers.reduce((state, { skill, isOk = true, at }) => state.withAnswer({ skill, isOk, at }), new KnowledgeState());

export { buildKnowledgeState };
