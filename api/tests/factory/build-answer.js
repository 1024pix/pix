const faker = require('faker');
const Answer = require('../../lib/domain/models/Answer');
const AnswerStatus = require('../../lib/domain/models/AnswerStatus');

module.exports = function buildAnswer({
  id = faker.random.uuid(),
  elapsedTime = faker.random.number(),
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = faker.random.number(),
  value = '1',
  assessmentId = faker.random.number(),
  challengeId = faker.random.uuid(),
} = {}) {
  return new Answer({
    id,
    elapsedTime,
    result,
    resultDetails,
    timeout,
    value,
    assessmentId,
    challengeId,
  });
};
