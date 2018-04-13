const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');

const { WrongDateFormatError } = require('../../../../../lib/domain/errors');

describe('Unit | Serializer | JSONAPI | certification-serializer', function() {

  describe('#deserialize', function() {

    const jsonCertificationCourse = {
      data: {
        type: 'certifications',
        id: 1,
        attributes: {
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '24/10/1989',
          'external-id': 'xenoverse2'
        }
      }
    };

    const certificationCourseObject = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
      externalId: 'xenoverse2'
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
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '24/10/1989',
          'external-id': 'xenoverse2',
        }
      }
    };

    const certificationCourse = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '24/10/1989',
      externalId: 'xenoverse2',
    };

    it('should serialize', function() {
      // when
      const serializedCertificationCourse = serializer.serialize(certificationCourse);
      // then
      expect(serializedCertificationCourse).to.deep.equal(jsonCertificationCourse);

    });

  });
});
