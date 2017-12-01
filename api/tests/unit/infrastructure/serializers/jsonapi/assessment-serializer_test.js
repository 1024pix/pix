const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const Assessment = require('../../../../../lib/domain/models/data/assessment');

describe('Unit | Serializer | JSONAPI | assessment-serializer', function() {

  const modelObject = new Assessment({
    id: 'assessment_id',
    courseId: 'course_id',
    successRate: 24,
    type : 'charade'
  });

  const jsonAssessment = {
    data: {
      type: 'assessment',
      id: 'assessment_id',
      attributes: {
        'estimated-level': undefined,
        'pix-score': undefined,
        'success-rate': 24,
        'type' : 'charade'
      },
      relationships: {
        course: {
          data: {
            type: 'courses',
            id: 'course_id'
          }
        },
      }
    }
  };

  describe('#serialize()', function() {

    it('should convert an Assessment model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonAssessment);
    });

  });

  describe('#deserialize()', function() {

    it('should convert JSON API data into an Assessment js object', function() {
      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.id).to.equal(jsonAssessment.data.id);
      expect(assessment.courseId).to.equal(jsonAssessment.data.relationships.course.data.id);
    });

  });

});
