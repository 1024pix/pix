const KnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const buildAnswer = require('./build-answer');
const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildSmartPlacementKnowledgeElement({
  id = faker.random.number(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  pixScore = 2,
  skillId = `@${faker.lorem.word()}${faker.random.number(8)}`,
  assessmentId = buildAssessment().id,
  answerId = buildAnswer({ assessmentId }).id,
} = {}) {

  const values = {
    id,
    source,
    status,
    pixScore,
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

