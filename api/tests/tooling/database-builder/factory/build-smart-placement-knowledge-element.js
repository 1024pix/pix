const faker = require('faker');
const buildAnswer = require('./build-answer');
const buildUser = require('./build-user');
const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const KnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

module.exports = function buildSmartPlacementKnowledgeElement({
  id = faker.random.number(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  createdAt = faker.date.recent(),
  earnedPix = 2,
  skillId = `rec${faker.random.uuid()}`,
  assessmentId = buildAssessment().id,
  answerId = buildAnswer({ assessmentId }).id,
  userId = buildUser().id,
  competenceId = `rec${faker.random.uuid()}`,
} = {}) {

  const values = {
    id,
    source,
    status,
    createdAt,
    earnedPix,
    skillId,
    assessmentId,
    answerId,
    userId,
    competenceId
  };

  databaseBuffer.pushInsertable({
    tableName: 'knowledge-elements',
    values,
  });

  return values;
};

