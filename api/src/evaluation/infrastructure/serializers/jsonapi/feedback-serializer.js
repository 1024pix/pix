import jsonapiSerializer from 'jsonapi-serializer';
import { Feedback } from '../../../domain/models/Feedback.js';

const { Serializer, Deserializer } = jsonapiSerializer;

const serialize = function (feedbacks) {
  return new Serializer('feedbacks', {
    attributes: ['createdAt', 'content', 'category', 'answer', 'assessment', 'challenge'],
    assessment: { ref: 'id' },
    challenge: { ref: 'id' },
    transform(json) {
      const feedback = Object.assign({}, json);
      feedback.assessment = { id: json.assessmentId };
      feedback.challenge = { id: json.challengeId };
      return feedback;
    },
  }).serialize(feedbacks);
};

const deserialize = function (json, userAgent) {
  return new Deserializer()
    .deserialize(json, function (err, feedback) {
      feedback.assessmentId = json.data.relationships.assessment.data.id;
      feedback.challengeId = json.data.relationships.challenge.data.id;
      feedback.userAgent = userAgent;
    })
    .then((deserializedFeedback) => {
      return new Feedback(deserializedFeedback);
    });
};

export { serialize, deserialize };
