const { Serializer } = require('jsonapi-serializer');
const Answer = require('../../data/answer');
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
   * @deprecated use serialize with domain model objects instead
   */
  serializeFromBookshelfAnswer(answers) {
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
      transform: (model) => {
        const answer = Object.assign({}, model.toJSON());
        answer.assessment = { id: model.get('assessmentId') };
        answer.challenge = { id: model.get('challengeId') };
        return answer;
      },
    }).serialize(answers);
  },

  deserialize(json) {
    const answer = new Answer({
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
