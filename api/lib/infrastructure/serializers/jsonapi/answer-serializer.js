const { Serializer } = require('jsonapi-serializer');
const answerStatusJSONAPIAdapter = require('../../adapters/answer-status-json-api-adapter');

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
      attributes: [
        'value', 'timeout', 'elapsedTime', 'result', 'resultDetails', 'assessment',
        'challenge', 'correction', 'levelup',
      ],
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
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/answers/${parent.id}/correction`;
          }
        }
      },
      levelup: {
        ref: 'id',
        attributes: ['competenceName', 'level'],
      }
    }).serialize(answer);
  },

};
