const faker = require('faker');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

module.exports = function buildKnowledgeElement({
  id = faker.random.number(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  earnedPix = 4,
  createdAt,
  // relationship Ids
  answerId = faker.random.number(),
  assessmentId = faker.random.number(),
  skillId = `rec${faker.random.uuid()}`,
  userId = faker.random.number(),
  competenceId = `rec${faker.random.uuid()}`,
} = {}) {
  return new KnowledgeElement({
    id,
    source,
    status,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};
