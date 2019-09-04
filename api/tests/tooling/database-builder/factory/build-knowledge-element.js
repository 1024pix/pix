const faker = require('faker');
const buildAnswer = require('./build-answer');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const _ = require('lodash');

module.exports = function buildKnowledgeElement({
  id,
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

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ userId }).id : assessmentId;
  answerId = _.isUndefined(answerId) ? buildAnswer({ assessmentId }).id : answerId;

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
  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-elements',
    values,
  });
};

