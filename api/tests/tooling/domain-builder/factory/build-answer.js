const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

function buildAnswer({
  id = 123,
  elapsedTime = null,
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
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
  elapsedTime = 120,
  timeout = 130,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
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
