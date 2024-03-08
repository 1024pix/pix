import { Progression } from '../../../../src/evaluation/domain/models/Progression.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';
import { BuildSkillCollection as buildSkillCollection } from './build-skill-collection.js';

const buildProgression = function ({
  id = Progression.generateIdFromAssessmentId(1234),
  skillIds = buildSkillCollection().map((skill) => skill.id),
  knowledgeElements = [buildKnowledgeElement()],
  isProfileCompleted = true,
} = {}) {
  return new Progression({ id, skillIds, knowledgeElements, isProfileCompleted });
};

export { buildProgression };
