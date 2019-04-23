const faker = require('faker');
const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildCompetenceEvaluation({
  id = faker.random.number(),
  assessmentId = buildAssessment().id,
  competenceId = `recABC${faker.random.number}`,
  createdAt = faker.date.past(),
  updatedAt = new Date(),
  userId = buildUser().id,
} = {}) {

  const values = {
    id, assessmentId, competenceId, userId, createdAt, updatedAt
  };

  databaseBuffer.pushInsertable({
    tableName: 'competence-evaluations',
    values,
  });

  return values;
};
