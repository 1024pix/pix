const buildAssessment = require('./build-assessment');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');
const faker = require('faker');

module.exports = function buildAnswer({
  id,
  value = faker.lorem.sentences(),
  result = faker.lorem.words(),
  assessmentId,
  challengeId = `rec${faker.random.uuid()}`,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
  timeout = faker.random.number(),
  elapsedTime = faker.random.number(),
  resultDetails = faker.lorem.sentences(),
} = {}) {

  assessmentId = _.isUndefined(assessmentId) ? buildAssessment().id : assessmentId;

  const values = {
    id,
    value,
    result,
    assessmentId,
    challengeId,
    createdAt,
    updatedAt,
    timeout,
    elapsedTime,
    resultDetails,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'answers',
    values,
  });
};
