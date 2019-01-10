const buildSkillCollection = require('./build-skill-collection');
const buildSmartPlacementKnowledgeElement = require('./build-smart-placement-knowledge-element');
const SkillReview = require('../../../../lib/domain/models/SkillReview');

module.exports = function buildSkillReview({
  id = SkillReview.generateIdFromAssessmentId(1234),
  targetedSkills = buildSkillCollection(),
  knowledgeElements = [buildSmartPlacementKnowledgeElement()],
  isProfileCompleted = true,

} = {}) {
  return new SkillReview({ id, targetedSkills, knowledgeElements, isProfileCompleted });
};
