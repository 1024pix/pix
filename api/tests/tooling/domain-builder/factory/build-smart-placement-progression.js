const buildSkillCollection = require('./build-skill-collection');
const buildSmartPlacementKnowledgeElement = require('./build-smart-placement-knowledge-element');
const SmartPlacementProgression = require('../../../../lib/domain/models/SmartPlacementProgression');

module.exports = function buildSmartPlacementProgression({
  id = SmartPlacementProgression.generateIdFromAssessmentId(1234),
  targetedSkills = buildSkillCollection(),
  knowledgeElements = [buildSmartPlacementKnowledgeElement()],
  isProfileCompleted = true,

} = {}) {
  return new SmartPlacementProgression({ id, targetedSkills, knowledgeElements, isProfileCompleted });
};
