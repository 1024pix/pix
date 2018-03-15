const { describe, it, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');

const { WrongDateFormatError } = require('../../../../../lib/domain/errors');

describe('Unit | Serializer | JSONAPI | certification-serializer', function() {

  describe('#deserialize', function() {

    const jsonCertificationCourse = {
      data: {
        type: 'certifications',
        id: 1,
        attributes: {
          'status': 'rejected',
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '24/10/1989',
          'rejection-reason': 'Killed all citizens'
        }
      }
    };

    const certificationCourseObject = {
      id: 1,
      status: 'rejected',
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
      rejectionReason: 'Killed all citizens'
    };

    it('should convert a JSON API data into a Certification Course object', function() {
      // when
      const certificationCourse = serializer.deserialize(jsonCertificationCourse);

      // then

      return certificationCourse.then((result) => {
        expect(result).to.deep.equal(certificationCourseObject);
      });
    });

    it('should return an error if date is in wrong format', function() {
      // when
      jsonCertificationCourse.data.attributes.birthdate = '2015-32-12';

      // given
      const promise = serializer.deserialize(jsonCertificationCourse);

      // then
      return promise.catch(() => {
        expect(promise).to.be.rejectedWith(WrongDateFormatError);
      });
    });
  });

  describe('#serialize', function() {

    const jsonCertificationCourse = {
      data: {
        type: 'certifications',
        id: 1,
        attributes: {
          'status': 'rejected',
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '24/10/1989',
          'rejection-reason': 'Killed all citizens'
        }
      }
    };

    const certificationCourse = {
      id: 1,
      status: 'rejected',
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '24/10/1989',
      rejectionReason: 'Killed all citizens'
    };

    it('should serialize', function() {
      // when
      const serializedCertificationCourse = serializer.serialize(certificationCourse);
      // then
      expect(serializedCertificationCourse).to.deep.equal(jsonCertificationCourse);

    });

  });
});
