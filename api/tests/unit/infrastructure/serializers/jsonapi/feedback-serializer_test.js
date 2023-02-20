import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/feedback-serializer';

describe('Unit | Serializer | JSONAPI | feedback-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Feedback model object into JSON API data', function () {
      // given
      const feedback = {
        id: 'feedback_id',
        content: 'Lorem ipsum dolor sit amet consectetur adipiscet.',
        assessmentId: 'assessment_id',
        challengeId: 'challenge_id',
        createdAt: new Date('2017-09-01T12:14:33Z'),
      };

      const serializedFeedback = {
        data: {
          type: 'feedbacks',
          id: 'feedback_id',
          attributes: {
            content: feedback.content,
            'created-at': feedback.createdAt,
          },
          relationships: {
            assessment: {
              data: {
                id: 'assessment_id',
                type: 'assessments',
              },
            },
            challenge: {
              data: {
                id: 'challenge_id',
                type: 'challenges',
              },
            },
          },
        },
      };

      // when
      const response = serializer.serialize(feedback);

      // then
      expect(response).to.deep.equal(serializedFeedback);
    });

    it('should serialize array of feedbacks', function () {
      // given
      const simpleFeedback = {
        id: 'simple_feedback',
        content: 'Simple feedback',
        createdAt: new Date('2015-09-06T15:00:00Z'),
        assessmentId: 1,
        challengeId: 11,
      };
      const otherFeedback = {
        id: 'other_feedback',
        content: 'Other feedback',
        createdAt: new Date('2016-09-06T16:00:00Z'),
        assessmentId: 1,
        challengeId: 12,
      };
      const matchingDatesFeedback = {
        id: 'matching_dates_feedback',
        content: 'Matching dates feedback',
        createdAt: new Date('2017-09-06T17:00:00Z'),
        assessmentId: 2,
        challengeId: 21,
      };
      const persistedFeedbacks = [simpleFeedback, otherFeedback, matchingDatesFeedback];

      // when
      const result = serializer.serialize(persistedFeedbacks);

      // then
      const expectedResponse = {
        data: [
          {
            type: 'feedbacks',
            id: simpleFeedback.id,
            attributes: {
              content: simpleFeedback.content,
              'created-at': simpleFeedback.createdAt,
            },
            relationships: {
              assessment: { data: { id: '1', type: 'assessments' } },
              challenge: { data: { id: '11', type: 'challenges' } },
            },
          },
          {
            type: 'feedbacks',
            id: otherFeedback.id,
            attributes: {
              content: otherFeedback.content,
              'created-at': otherFeedback.createdAt,
            },
            relationships: {
              assessment: { data: { id: '1', type: 'assessments' } },
              challenge: { data: { id: '12', type: 'challenges' } },
            },
          },
          {
            type: 'feedbacks',
            id: matchingDatesFeedback.id,
            attributes: {
              content: matchingDatesFeedback.content,
              'created-at': matchingDatesFeedback.createdAt,
            },
            relationships: {
              assessment: { data: { id: '2', type: 'assessments' } },
              challenge: { data: { id: '21', type: 'challenges' } },
            },
          },
        ],
      };

      expect(result).to.deep.equal(expectedResponse);
    });
  });

  describe('#deserialize()', function () {
    it('should convert JSON API data into a Feedback model object', function () {
      // given
      const serializedFeedback = {
        data: {
          type: 'feedbacks',
          id: 'feedback_id',
          attributes: {
            content: 'Bienvenue chez Pix !',
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: 'assessment_id',
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: 'challenge_id',
              },
            },
          },
        },
      };

      // when
      const promise = serializer.deserialize(serializedFeedback);

      // then
      return promise.then((feedback) => {
        expect(feedback.get('id')).to.equal(serializedFeedback.data.id);
        expect(feedback.get('content')).to.equal(serializedFeedback.data.attributes.content);
        expect(feedback.get('assessmentId')).to.equal(serializedFeedback.data.relationships.assessment.data.id);
        expect(feedback.get('challengeId')).to.equal(serializedFeedback.data.relationships.challenge.data.id);
      });
    });
  });
});
