const faker = require('faker');
const SmartPlacementKnowledgeElement = require('../../../lib/domain/models/SmartPlacementKnowledgeElement');

module.exports = function buildSmartPlacementKnowledgeElement({
  id = faker.random.number(),
  source = SmartPlacementKnowledgeElement.SourceType.DIRECT,
  status = SmartPlacementKnowledgeElement.StatusType.VALIDATED,
  pixScore = 4,

  // relationship Ids
  answerId = faker.random.number(),
  assessmentId = faker.random.number(),
  skillId = faker.random.number(),
} = {}) {
  return new SmartPlacementKnowledgeElement({
    id,
    source,
    status,
    pixScore,
    answerId,
    assessmentId,
    skillId,
  });
};
