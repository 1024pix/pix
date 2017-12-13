const { Serializer } = require('jsonapi-serializer');
const Answer = require('../../../domain/models/data/answer');

module.exports = {

  serialize(answers) {
    return new Serializer('answer', {
      attributes: ['value', 'timeout', 'elapsedTime', 'result', 'resultDetails', 'assessment', 'challenge'],
      assessment: {
        ref: 'id',
        includes: false
      },
      challenge: {
        ref: 'id',
        includes: false
      },
      transform: (model) => {
        const answer = Object.assign({}, model.toJSON());
        answer.assessment = { id: model.get('assessmentId') };
        answer.challenge = { id: model.get('challengeId') };
        return answer;
      }
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
      challengeId: json.data.relationships.challenge.data.id
    });

    if (json.data.id) {
      answer.set('id', json.data.id);
    }

    return answer;
  }

};
