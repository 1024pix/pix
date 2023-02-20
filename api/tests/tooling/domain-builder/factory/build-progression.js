import buildSkillCollection from './build-skill-collection';
import buildKnowledgeElement from './build-knowledge-element';
import Progression from '../../../../lib/domain/models/Progression';

export default function buildProgression({
  id = Progression.generateIdFromAssessmentId(1234),
  skillIds = buildSkillCollection().map((skill) => skill.id),
  knowledgeElements = [buildKnowledgeElement()],
  isProfileCompleted = true,
} = {}) {
  return new Progression({ id, skillIds, knowledgeElements, isProfileCompleted });
}
