const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const CertificationCourse = require('../../../../../lib/domain/models/data/certification-course');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize()', function() {
    const certificationCourse = new CertificationCourse({
      id: 'certification_id'
    });

    const jsonCertificationCourse = {
      data: {
        type: 'certification-courses',
        id: 'certification_id'
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
