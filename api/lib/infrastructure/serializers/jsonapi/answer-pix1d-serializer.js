const Answer = require('../../../domain/models/Answer.js');
const { Serializer } = require('jsonapi-serializer');
const answerStatusJSONAPIAdapter = require('../../adapters/answer-status-json-api-adapter.js');

module.exports = {
  serialize(answer) {
    return new Serializer('answer', {
      transform: (untouchedAnswer) => {
        const answer = Object.assign({}, untouchedAnswer);
        answer.assessment = { id: answer.assessmentId };
        answer.challenge = { id: answer.challengeId };
        answer.result = answerStatusJSONAPIAdapter.adapt(untouchedAnswer.result);
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
  },

  deserialize(payload) {
    return new Answer({
      value: _cleanValue(payload.data.attributes.value),
      result: null,
      resultDetails: null,
      timeout: payload.data.attributes.timeout,
      isFocusedOut: payload.data.attributes['focused-out'],
      challengeId: payload.data.relationships.challenge.data.id,
    });
  },
};

function _cleanValue(value) {
  return value.replaceAll('\u0000', '');
}
