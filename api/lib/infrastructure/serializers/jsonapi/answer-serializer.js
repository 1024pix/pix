const JSONAPISerializer = require('./jsonapi-serializer');
const Answer = require('../../../domain/models/data/answer');

class AnswerSerializer extends JSONAPISerializer {

  constructor() {
    super('answer');
  }

  serializeAttributes(model, data) {
    data.attributes.value = model.value;
    data.attributes.timeout = model.timeout;
    data.attributes['elapsed-time'] = model.elapsedTime;
    data.attributes.result = model.result;
  }

  serializeRelationships(model, data) {
    data.relationships = {};

    data.relationships.assessment = {
      data: {
        type: 'assessments',
        id: model.assessmentId
      }
    };

    data.relationships.challenge = {
      data: {
        type: 'challenges',
        id: model.challengeId
      }
    };
  }

  deserialize(json) {
    const answer = new Answer({
      value: json.data.attributes.value,
      result: json.data.attributes.result,
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

}

module.exports = new AnswerSerializer();
