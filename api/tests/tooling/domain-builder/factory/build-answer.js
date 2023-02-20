import Answer from '../../../../lib/domain/models/Answer';
import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';

function buildAnswer({
  id = 123,
  result = AnswerStatus.OK,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
  timeSpent = 20,
  isFocusedOut = false,
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
    isFocusedOut,
  });
}

buildAnswer.uncorrected = function ({
  timeout = 130,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
  timeSpent = 10,
  isFocusedOut = false,
} = {}) {
  return new Answer({
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
    isFocusedOut,
  });
};

buildAnswer.ok = function ({
  id = 123,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
  timeSpent = 20,
  isFocusedOut = false,
} = {}) {
  return buildAnswer({
    id,
    result: AnswerStatus.OK,
    resultDetails,
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
    isFocusedOut,
  });
};

buildAnswer.ko = function ({
  id = 123,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
  timeSpent = 20,
  isFocusedOut = false,
} = {}) {
  return buildAnswer({
    id,
    result: AnswerStatus.KO,
    resultDetails,
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
    isFocusedOut,
  });
};

buildAnswer.skipped = function ({
  id = 123,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
  timeSpent = 20,
  isFocusedOut = false,
} = {}) {
  return buildAnswer({
    id,
    result: AnswerStatus.SKIPPED,
    resultDetails,
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
    isFocusedOut,
  });
};

buildAnswer.focusedOut = function ({
  id = 123,
  resultDetails = null,
  timeout = null,
  value = '1',
  assessmentId = 456,
  challengeId = 'recChallenge123',
  timeSpent = 20,
  isFocusedOut = false,
} = {}) {
  return buildAnswer({
    id,
    result: AnswerStatus.FOCUSEDOUT,
    resultDetails,
    timeout,
    value,
    assessmentId,
    challengeId,
    timeSpent,
    isFocusedOut,
  });
};

export default buildAnswer;
