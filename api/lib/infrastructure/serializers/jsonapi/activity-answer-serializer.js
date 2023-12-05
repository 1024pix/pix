import jsonapiSerializer from 'jsonapi-serializer';
import { ActivityAnswer } from '../../../../src/school/domain/models/ActivityAnswer.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (answer) {
  return new Serializer('activity-answer', {
    transform: (answer) => {
      return {
        ...answer,
        challenge: { id: answer.challengeId },
        result: answer.result.status,
      };
    },
    attributes: ['value', 'result', 'resultDetails', 'challenge'],
    challenge: {
      ref: 'id',
      includes: false,
    },
  }).serialize(answer);
};

const deserialize = function (payload) {
  return {
    activityAnswer: new ActivityAnswer({
      value: _cleanValue(payload.data.attributes.value),
      result: null,
      resultDetails: null,
      challengeId: payload.data.relationships.challenge.data.id,
    }),
    assessmentId: payload.meta?.assessmentId || null,
  };
};

export { serialize, deserialize };

function _cleanValue(value) {
  return value?.replaceAll('\u0000', '');
}
