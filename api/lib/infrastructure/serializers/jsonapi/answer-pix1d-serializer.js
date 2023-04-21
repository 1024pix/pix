import { Answer } from '../../../domain/models/Answer.js';
import { Serializer } from 'jsonapi-serializer';
import { AnswerStatusJsonApiAdapter as answerStatusJSONAPIAdapter } from '../../adapters/answer-status-json-api-adapter.js';

const serialize = function (answer) {
  return new Serializer('answer', {
    transform: (untouchedAnswer) => {
      const answer = Object.assign({}, untouchedAnswer);
      answer.challenge = { id: answer.challengeId };
      answer.result = answerStatusJSONAPIAdapter.adapt(untouchedAnswer.result);
      return answer;
    },
    attributes: ['value', 'result', 'resultDetails', 'assessmentId', 'challenge'],
    challenge: {
      ref: 'id',
      includes: false,
    },
  }).serialize(answer);
};

const deserialize = function (payload) {
  return new Answer({
    value: _cleanValue(payload.data.attributes.value),
    result: null,
    resultDetails: null,
    challengeId: payload.data.relationships.challenge.data.id,
    assessmentId: payload.data.attributes['assessment-id'],
  });
};


export { serialize, deserialize };
function _cleanValue(value) {
  return value.replaceAll('\u0000', '');
}
