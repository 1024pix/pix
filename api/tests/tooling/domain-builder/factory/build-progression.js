const buildSkillCollection = require('./build-skill-collection');
const buildKnowledgeElement = require('./build-knowledge-element');
const Progression = require('../../../../lib/domain/models/Progression');

module.exports = function buildProgression({
  id = Progression.generateIdFromAssessmentId(1234),
  skillIds = buildSkillCollection().map((skill) => skill.id),
  knowledgeElements = [buildKnowledgeElement()],
  isProfileCompleted = true,
} = {}) {
  return new Progression({ id, skillIds, knowledgeElements, isProfileCompleted });
};
