const faker = require('faker');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const buildKnowledgeElement = function buildKnowledgeElement({
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

buildKnowledgeElement.directlyValidated = function directlyValidated({
  id = faker.random.number(),
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
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.VALIDATED,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};

buildKnowledgeElement.directlyInvalidated = function directlyInvalidated({
  id = faker.random.number(),
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
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.INVALIDATED,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};

module.exports = buildKnowledgeElement;
