const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/feedback-serializer');
const Feedback = require('../../../../../lib/domain/models/data/feedback');

describe('Unit | Serializer | JSONAPI | feedback-serializer', function () {

  const modelObject = new Feedback({
    id: 'feedback_id',
    email: 'shi@fu.me',
    content: 'Lorem ipsum dolor sit amet consectetur adipiscet.',
    assessmentId: 'assessment_id',
    challengeId: 'challenge_id'
  });

  const jsonFeedback = {
    data: {
      type: 'feedback',
      id: 'feedback_id',
      attributes: {
        email: 'shi@fu.me',
        content: 'Lorem ipsum dolor sit amet consectetur adipiscet.'
      },
      relationships: {
        assessment: {
          data: {
            type: 'assessments',
            id: 'assessment_id'
          }
        },
        challenge: {
          data: {
            type: 'challenges',
            id: 'challenge_id'
          }
        }
      }
    }
  };

  describe('#serialize()', function () {

    it('should convert a Feedback model object into JSON API data', function () {
      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonFeedback);
    });

  });

  describe('#deserialize()', function () {

    it('should convert JSON API data into a Feedback model object', function () {
      // when
      const feedback = serializer.deserialize(jsonFeedback);

      // then
      expect(feedback.id).to.equal(jsonFeedback.data.id);
      expect(feedback.get('assessmentId')).to.equal(jsonFeedback.data.relationships.assessment.data.id);
      expect(feedback.get('challengeId')).to.equal(jsonFeedback.data.relationships.challenge.data.id);
      expect(feedback.get('email')).to.equal(jsonFeedback.data.attributes.email);
      expect(feedback.get('content')).to.equal(jsonFeedback.data.attributes.content);
    });

  });

});
