const { expect } = require('../../../../test-helper');
const AssessmentResult = require('../../../../../lib/domain/models/AssessmentResult');
const CompetenceMark = require('../../../../../lib/domain/models/CompetenceMark');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-result-serializer');

describe('Unit | Serializer | JSONAPI | assessment-result-serializer', () => {
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
        type: 'assessment-results'
      }
    };
  });

  describe('#serialize', () => {
    it('should serialize the assessment rating object to jsonapi object excluding email and password', () => {
      // given
      const modelObject = new AssessmentRating({
        id: '234567',
        estimatedLevel: 7,
        pixScore: 526
      });

      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.be.deep.equal({
        data: {
          attributes: {
            'estimated-level': 7,
            'pix-score': 526,
          },
          id: '234567',
          type: 'assessment-results'
        }
      });
    });
  });

  describe('#deserialize', () => {

    it('should convert JSON API data into an Assessment Rating model object', () => {
      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating).to.be.an.instanceOf(AssessmentResult);
    });

    it('should contain an ID attribute', () => {
      jsonAssessmentRating.data.id = '42';

      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating.id).to.equal('42');
    });

    it('should not contain an ID attribute when not given', () => {
      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating.id).to.be.undefined;
    });

    it('should attach the assessment id', () => {
      // when
      const assessmentRating = serializer.deserialize(jsonAssessmentRating);

      // then
      expect(assessmentRating.assessmentId).to.equal('22');
    });

  });

});
