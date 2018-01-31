const { describe, it, expect, beforeEach } = require('../../../../test-helper');
const AssessmentRating = require('../../../../../lib/domain/models/AssessmentRating');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-rating-serializer');

describe('Unit | Serializer | JSONAPI | assessment-rating-serializer', () => {
  let jsonAssessmentRating;

  beforeEach(() => {
    jsonAssessmentRating = {
      data: {
        attributes: {
          'estimated-level': 4,
          'pix-score': 24
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: '22'
            }
          }
        },
        type: 'assessment-ratings'
      }
    };
  });

  describe('#serialize', () => {
    it('should serialize the assessment rating object to jsonapi object excluding email and password', () => {
      // Given
      const modelObject = new AssessmentRating({
        id: '234567',
        estimatedLevel: 7,
        pixScore: 526
      });

      // When
      const json = serializer.serialize(modelObject);

      // Then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'estimated-level': 7,
            'pix-score': 526,
          },
          id: '234567',
          type: 'assessment-ratings'
        }
      });
    });
  });

  describe('#deserialize', () => {

    it('should convert JSON API data into an Assessment Rating model object', () => {
      // When
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // Then
      expect(assessmentRating).to.be.an.instanceOf(AssessmentRating);
    });

    it('should contain an ID attribute', () => {
      jsonAssessmentRating.data.id = '42';

      // When
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // Then
      expect(assessmentRating.id).to.equal('42');
    });

    it('should not contain an ID attribute when not given', () => {
      // When
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // Then
      expect(assessmentRating.id).to.be.undefined;
    });

    it('should attach the assessment id', () => {
      // When
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // Then
      expect(assessmentRating.assessmentId).to.equal('22');
    });

  });
});
