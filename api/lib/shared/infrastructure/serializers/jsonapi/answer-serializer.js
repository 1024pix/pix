import { Answer } from '../../../domain/models/Answer.js';
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { AnswerStatusJsonApiAdapter } from '../../adapters/answer-status-json-api-adapter.js';

const serialize = function (answer) {
  return new Serializer('answer', {
    transform: (untouchedAnswer) => {
      const answer = Object.assign({}, untouchedAnswer);
      answer.assessment = { id: answer.assessmentId };
      answer.challenge = { id: answer.challengeId };
      answer.result = AnswerStatusJsonApiAdapter.adapt(untouchedAnswer.result);
      return answer;
    },
    attributes: ['value', 'timeout', 'result', 'resultDetails', 'assessment', 'challenge', 'correction', 'levelup'],
    assessment: {
      ref: 'id',
      includes: false,
    },
    challenge: {
      ref: 'id',
      includes: false,
    },
    correction: {
      ref: 'id',
      nullIfMissing: true,
      ignoreRelationshipData: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/answers/${parent.id}/correction`;
        },
      },
    },
    levelup: {
      ref: 'id',
      attributes: ['competenceName', 'level'],
    },
  }).serialize(answer);
};

const deserialize = function (payload) {
  return new Answer({
    value: _cleanValue(payload.data.attributes.value),
    result: null,
    resultDetails: null,
    timeout: payload.data.attributes.timeout,
    isFocusedOut: payload.data.attributes['focused-out'],
    assessmentId: payload.data.relationships.assessment.data.id,
    challengeId: payload.data.relationships.challenge.data.id,
  });
};

export { serialize, deserialize };

function _cleanValue(value) {
  return value.replaceAll('\u0000', '');
}
