const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const _ = require('lodash');

module.exports = function buildCompetenceEvaluation({
  id,
  assessmentId,
  competenceId = `recABC${faker.random.number}`,
  status = CompetenceEvaluation.statuses.STARTED,
  createdAt = faker.date.past(),
  updatedAt = new Date(),
  userId,
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  assessmentId = _.isUndefined(assessmentId) ? buildAssessment({ userId }).id : assessmentId;

  const values = {
    id,
    assessmentId,
    competenceId,
    userId,
    createdAt,
    updatedAt,
    status,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'competence-evaluations',
    values,
  });
};
