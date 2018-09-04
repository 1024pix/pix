const faker = require('faker');
const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');

module.exports = function buildAnswer({
  id = faker.random.number(),
  value = 'default value',
  result = 'ok',
  assessmentId = buildAssessment().id,
  challengeId = 'rec123456',
} = {}) {

  const values = {
    id, value, result, assessmentId, challengeId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'answers',
    values,
  });

  return values;
};
