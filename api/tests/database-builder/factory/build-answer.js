const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

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

