const { Serializer } = require('jsonapi-serializer');
const BookshelfAnswer = require('../../data/answer');
const answerStatusJSONAPIAdapter = require('../../adapters/answer-status-json-api-adapter');

module.exports = {

  serialize(answer) {
    return new Serializer('answer', {
      attributes: ['value', 'timeout', 'elapsedTime', 'result', 'resultDetails', 'assessment', 'challenge'],
      assessment: {
        ref: 'id',
        includes: false,
      },
      challenge: {
        ref: 'id',
        includes: false,
      },
      transform: (untouchedAnswer) => {
        const answer = Object.assign({}, untouchedAnswer);
        answer.assessment = { id: answer.assessmentId };
        answer.challenge = { id: answer.challengeId };
        answer.result = answerStatusJSONAPIAdapter.adapt(untouchedAnswer.result);
        return answer;
      },
    }).serialize(answer);
  },

  /**
   * @deprecated use deserialize with domain model objects instead
   */
  deserializeToBookshelfAnswer(json) {
    const answer = new BookshelfAnswer({
      value: json.data.attributes.value,
      result: json.data.attributes.result,
      resultDetails: json.data.attributes['result-details'],
      timeout: json.data.attributes.timeout,
      elapsedTime: json.data.attributes['elapsed-time'],
      assessmentId: json.data.relationships.assessment.data.id,
      challengeId: json.data.relationships.challenge.data.id,
    });

    if (json.data.id) {
      answer.set('id', json.data.id);
    }

    return answer;
  },

};
