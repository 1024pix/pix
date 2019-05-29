const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCompetenceEvaluation({
  id,
  assessmentId,
  competenceId = `recABC${faker.random.number}`,
  status,
  createdAt = faker.date.past(),
  updatedAt = new Date(),
  userId = buildUser().id,
} = {}) {

  assessmentId = _.isNil(assessmentId) ? buildAssessment().id : assessmentId;

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
