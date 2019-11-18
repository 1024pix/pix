const faker = require('faker');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

function buildAnswer({
  id = faker.random.number(),
  elapsedTime = faker.random.number(),
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = null,
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
}

buildAnswer.uncorrected = function({
  elapsedTime = faker.random.number(),
  timeout = faker.random.number(),
  value = '1',
  assessmentId = faker.random.number(),
  challengeId = faker.random.uuid(),
} = {}) {
  return new Answer({
    elapsedTime,
    timeout,
    value,
    assessmentId,
    challengeId,
  });
};

module.exports = buildAnswer;
