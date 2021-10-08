const buildSkillCollection = require('./build-skill-collection');
const buildKnowledgeElement = require('./build-knowledge-element');
const Progression = require('../../../../lib/domain/models/Progression');

module.exports = function buildProgression({
  id = Progression.generateIdFromAssessmentId(1234),
  targetedSkills = buildSkillCollection(),
  knowledgeElements = [buildKnowledgeElement()],
  isProfileCompleted = true,
} = {}) {
  return new Progression({ id, targetedSkills, knowledgeElements, isProfileCompleted });
};
