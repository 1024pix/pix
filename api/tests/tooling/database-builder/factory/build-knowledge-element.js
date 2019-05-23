const faker = require('faker');
const buildAnswer = require('./build-answer');
const buildUser = require('./build-user');
const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const _ = require('lodash');

module.exports = function buildKnowledgeElement({
  id = faker.random.number(),
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  createdAt = faker.date.recent(),
  earnedPix = 2,
  skillId = `rec${faker.random.uuid()}`,
  assessmentId,
  answerId,
  userId,
  competenceId = `rec${faker.random.uuid()}`,
} = {}) {

  assessmentId = _.isNil(assessmentId) ? buildAssessment().id : assessmentId;
  answerId = _.isNil(answerId) ? buildAnswer().id : answerId;
  userId = _.isNil(userId) ? buildUser().id : userId;

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

