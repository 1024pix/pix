const faker = require('faker');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

function buildAnswer({
  id = faker.random.number(),
  elapsedTime = faker.random.number(),
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = faker.random.number(),
  value = '1',
  assessmentId = faker.random.number(),
  challengeId = faker.random.uuid(),
  createdAt = faker.date.recent(),
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
    createdAt
  });
}

buildAnswer.uncorrected = function({
  elapsedTime = faker.random.number(),
  timeout = faker.random.number(),
  value = '1',
  assessmentId = faker.random.number(),
  challengeId = faker.random.uuid(),
  createdAt = faker.date.recent(),
} = {}) {
  return new Answer({
    elapsedTime,
    timeout,
    value,
    assessmentId,
    challengeId,
    createdAt,
  });
};

module.exports = buildAnswer;
