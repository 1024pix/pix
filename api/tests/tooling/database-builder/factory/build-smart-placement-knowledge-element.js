const faker = require('faker');
const buildAnswer = require('./build-answer');
const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const KnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

module.exports = function buildSmartPlacementKnowledgeElement({
  id = faker.random.number(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  createdAt = faker.date.recent(),
  pixValue = 2,
  skillId = `rec${faker.random.uuid()}`,
  assessmentId = buildAssessment().id,
  answerId = buildAnswer({ assessmentId }).id,
} = {}) {

  const values = {
    id,
    source,
    status,
    createdAt,
    pixValue,
    skillId,
    assessmentId,
    answerId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'knowledge-elements',
    values,
  });

  return values;
};

