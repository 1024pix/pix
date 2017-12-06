const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize()', function() {
    const certificationCourse = new CertificationCourse({
      id: 'certification_id',
      userId : 2
    });

    const jsonCertificationCourse = {
      data: {
        type: 'certification-courses',
        id: 'certification_id',
        attributes : {
          'user-id': '2'
        }
      }
    };

    it('should convert a Certification Course model object into JSON API data', function() {

      // when
      const json = serializer.serialize(certificationCourse);

      // then
      expect(json).to.deep.equal(jsonCertificationCourse);

    });

  });
});
