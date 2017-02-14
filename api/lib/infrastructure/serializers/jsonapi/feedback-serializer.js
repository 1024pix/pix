const JSONAPISerializer = require('./jsonapi-serializer');
const Feedback = require('../../../domain/models/data/feedback');

class FeedbackSerializer extends JSONAPISerializer {

  constructor() {
    super('feedbacks');
  }

  serializeAttributes(model, data) {
    data.attributes.email = model.email;
    data.attributes.content = model.content;
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
    const feedback = new Feedback({
      content: json.data.attributes.content,
      assessmentId: json.data.relationships.assessment.data.id,
      challengeId: json.data.relationships.challenge.data.id
    });

    if (json.data.id) {
      feedback.set('id', json.data.id);
    }
    if (json.data.attributes.email) {
      feedback.set('email', json.data.attributes.email);
    }

    return feedback;
  }

}

module.exports = new FeedbackSerializer();
