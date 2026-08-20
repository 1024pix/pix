import { Progression } from '../../../../src/evaluation/domain/models/Progression.js';
import { buildKnowledgeState } from './build-knowledge-state.js';
import { BuildSkillCollection as buildSkillCollection } from './build-skill-collection.js';

const buildProgression = function ({
  id = Progression.generateIdFromAssessmentId(1234),
  skillIds = buildSkillCollection().map((skill) => skill.id),
  knowledgeState = buildKnowledgeState(),
  isProfileCompleted = true,
} = {}) {
  return new Progression({ id, skillIds, knowledgeState, isProfileCompleted });
};

export { buildProgression };
