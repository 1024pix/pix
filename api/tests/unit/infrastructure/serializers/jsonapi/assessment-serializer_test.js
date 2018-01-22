const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const Assessment = require('../../../../../lib/domain/models/data/assessment');

describe('Unit | Serializer | JSONAPI | assessment-serializer', function() {

  let modelObject;
  let jsonAssessment;

  beforeEach(() => {
    const associatedCourse = {
      id : 'course_id',
      nbChallenges : 8,
      description : 'coucou',
      name: 'PIX EST FORMIDABLE'
    };

    modelObject = new Assessment({
      id: 'assessment_id',
      courseId: 'course_id',
      successRate: 24,
      type: 'charade',
      course : associatedCourse
    });

    jsonAssessment = {
      data: {
        type: 'assessment',
        id: 'assessment_id',
        attributes: {
          'estimated-level': undefined,
          'pix-score': undefined,
          'success-rate': 24,
          'type': 'charade',
          'certification-number': null
        },
        relationships: {
          course: {
            data: {
              type: 'courses',
              id: 'course_id'
            }
          },
        }
      },
      included : [{
        type : 'courses',
        id : 'course_id',
        attributes : {
          'nb-challenges': '8',
          description : 'coucou',
          name: 'PIX EST FORMIDABLE'
        }
      }]
    };
  });

  describe('#serialize()', function() {

    it('should convert an Assessment model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelObject);

      // then
      expect(json).to.deep.equal(jsonAssessment);
    });

  });

  describe('#deserialize()', () => {

    it('should convert JSON API data into an Assessment js object', () => {
      // when
      const assessment = serializer.deserialize(jsonAssessment);

      // then
      expect(assessment.id).to.equal(jsonAssessment.data.id);
      expect(assessment.courseId).to.equal(jsonAssessment.data.relationships.course.data.id);
    });

    describe('field "type"', () => {

      it('should set "type" attribute value when it is present', () => {
        // given
        jsonAssessment.data.attributes.type = 'URITROTTOIR';

        // when
        const assessment = serializer.deserialize(jsonAssessment);

        // then
        expect(assessment.type).to.equal('URITROTTOIR'); //
      });
    });
  });

});
