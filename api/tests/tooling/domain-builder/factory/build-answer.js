const faker = require('faker');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

function buildAnswer({
  id = faker.random.number(),
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = faker.random.number(),
  challengeId = faker.random.uuid(),
  timeSpent = 20,
} = {}) {
  return new Answer({
    id,
    result,
    resultDetails,
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
  });
}

buildAnswer.uncorrected = function({
  timeout = faker.random.number(),
  value = '1',
  assessmentId = faker.random.number(),
  challengeId = faker.random.uuid(),
  timeSpent = 10,
} = {}) {
  return new Answer({
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
  });
};

module.exports = buildAnswer;
