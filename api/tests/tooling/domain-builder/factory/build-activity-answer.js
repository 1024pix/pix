import { ActivityAnswer } from '../../../../src/school/domain/models/ActivityAnswer.js';
import { AnswerStatus } from '../../../../src/school/domain/models/AnswerStatus.js';

function buildActivityAnswer({
  id = 123,
  challengeId = 'recChallenge123',
  activityId = 456,
  result = AnswerStatus.OK,
  resultDetails = null,
  value = '1',
} = {}) {
  return new ActivityAnswer({
    id,
    challengeId,
    activityId,
    value,
    result,
    resultDetails,
  });
}

export { buildActivityAnswer };
