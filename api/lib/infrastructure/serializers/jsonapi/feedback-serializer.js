const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const Feedback = require('../../../domain/models/data/feedback');

module.exports = {

  serialize(feedback) {
    return new JSONAPISerializer('feedbacks', {
      attributes: ['createdAt', 'email', 'content', 'assessment', 'challenge'],
      assessment: { ref: 'id' },
      challenge: { ref: 'id' },
      transform(feedback) {
        feedback.id = feedback.id.toString();
        feedback.assessment = { id: feedback.assessmentId };
        feedback.challenge = { id: feedback.challengeId };
        return feedback;
      }
    }).serialize(feedback);
  },

  deserialize(json) {
    return new JSONAPIDeserializer()
      .deserialize(json, function(err, feedback) {
        feedback.assessmentId = json.data.relationships.assessment.data.id;
        feedback.challengeId = json.data.relationships.challenge.data.id;
      })
      .then((deserializedFeedback) => {
        return new Feedback(deserializedFeedback);
      });
  }

};
