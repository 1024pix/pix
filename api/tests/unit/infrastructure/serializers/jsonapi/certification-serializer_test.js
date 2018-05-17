const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const { WrongDateFormatError } = require('../../../../../lib/domain/errors');
const factory = require('../../../../factory');

describe('Unit | Serializer | JSONAPI | certification-serializer', () => {

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
          'external-id': 'xenoverse2',
        },
      },
    };

    const certificationCourseObject = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
      externalId: 'xenoverse2',
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

  describe('#serialize', () => {

    context('the entry data is an array of certifications', () => {

      const receivedCertifications = [
        factory.buildCertification({
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
        }),
      ];

      const JsonCertificationList = {
        data: [
          {
            attributes: {
              'certification-center': 'L’univeristé du Pix',
              'date': new Date('2018-12-01'),
              'is-published': true,
              'status': 'rejected',
              'pix-score': 23,
              'comment-for-candidate': 'Vous auriez dû travailler plus.',
            },
            'type': 'certifications',
            'id': 1,
          },
        ],
      };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertifications);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertificationList);
      });
    });

    context('the entry data is one certification', () => {

      const receivedCertification = factory.buildCertification({
        pixScore: 23,
        status: 'rejected',
        commentForCandidate: 'Vous auriez dû travailler plus.',
      });

      const JsonCertification =
        {
          data: {
            attributes: {
              'certification-center': 'L’univeristé du Pix',
              'date': new Date('2018-12-01'),
              'is-published': true,
              'status': 'rejected',
              'pix-score': 23,
              'comment-for-candidate': 'Vous auriez dû travailler plus.',
            },
            'type': 'certifications',
            'id': 1,
          },
        };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertification);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertification);
      });
    });
  });

  describe('#serializeFromCertificationCourse', () => {

    const jsonCertification = {
      data: {
        type: 'certifications',
        id: 1,
        attributes: {
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '24/10/1989',
          'external-id': 'xenoverse2',
        },
      },
    };

    const certificationCourse = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '24/10/1989',
      externalId: 'xenoverse2',
    };

    it('should serialize', () => {
      // when
      const serializedCertification = serializer.serializeFromCertificationCourse(certificationCourse);
      // then
      expect(serializedCertification).to.deep.equal(jsonCertification);
    });
  });
});
