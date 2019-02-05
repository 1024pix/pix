const faker = require('faker');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

module.exports = function buildSmartPlacementKnowledgeElement({
  id = faker.random.number(),
  source = SmartPlacementKnowledgeElement.SourceType.DIRECT,
  status = SmartPlacementKnowledgeElement.StatusType.VALIDATED,
  pixValue = 4,
  createdAt,
  // relationship Ids
  answerId = faker.random.number(),
  assessmentId = faker.random.number(),
  skillId = `rec${faker.random.uuid()}`,
} = {}) {
  return new SmartPlacementKnowledgeElement({
    id,
    source,
    status,
    pixValue,
    createdAt,
    answerId,
    assessmentId,
    skillId,
  });
};
