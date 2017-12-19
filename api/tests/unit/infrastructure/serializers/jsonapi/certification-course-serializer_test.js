const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/data/assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize()', function() {
    const assessment = new Assessment({
      'id': '2'
    });

    const certificationCourse = new CertificationCourse({
      id: 'certification_id',
      userId : 2,
      status : 'completed',
      assessment: assessment
    });

    const jsonCertificationCourseWithAssessment = {
      data: {
        type: 'certification-courses',
        id: 'certification_id',
        attributes : {
          'user-id': '2',
          'status' : 'completed'
        },
        relationships: {
          assessment: {
            data: {
              id: '2',
              type: 'assessments'
            }
          }
        }
      }
    };
    it('should convert a Certification Course model object into JSON API data', function() {

      // when
      const json = serializer.serialize(certificationCourse);

      // then
      expect(json).to.deep.equal(jsonCertificationCourseWithAssessment);

    });
  });
});
