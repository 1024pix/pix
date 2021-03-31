const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

function buildAnswer({
  id = 123,
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
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
  timeout = 130,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
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
