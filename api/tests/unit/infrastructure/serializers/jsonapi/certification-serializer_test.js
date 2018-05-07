const { expect } = require('../../../../test-helper');
const AssessmentResult = require('../../../../../lib/domain/models/AssessmentResult');
const Certification = require('../../../../../lib/domain/models/Certification');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const { WrongDateFormatError } = require('../../../../../lib/domain/errors');

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

  describe('#serialize', () => {

    context('the entry data is an array of certifications', () => {

      const assessmentResult = new AssessmentResult({
        pixScore: 23,
        status: 'rejected'
      });
      const receivedCertifications = [
        new Certification({
          id: 123,
          certificationCenter: 'Université des chocolats',
          date: '01/02/2004',
          isPublished: true,
          assessmentState: 'completed',
          assessmentResults: [assessmentResult]
        })
      ];

      const JsonCertificationList = {
        data: [
          {
            attributes: {
              'certification-center': 'Université des chocolats',
              'date': '01/02/2004',
              'is-published': true,
              'status': 'rejected',
              'pix-score': 23
            },
            'type': 'certifications',
            'id': 123
          }
        ]
      };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertifications);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertificationList);
      });
    });

    context('the entry data is one certification', () => {

      const assessmentResult = new AssessmentResult({
        pixScore: 23,
        status: 'rejected'
      });
      const receivedCertification = new Certification({
        id: 123,
        certificationCenter: 'Université des chocolats',
        date: '01/02/2004',
        isPublished: true,
        assessmentState: 'completed',
        assessmentResults: [assessmentResult]
      });
      const JsonCertification =
        {
          data: {
            attributes: {
              'certification-center': 'Université des chocolats',
              'date': '01/02/2004',
              'is-published': true,
              'status': 'rejected',
              'pix-score': 23
            },
            'type': 'certifications',
            'id': 123
          }
        };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertification);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertification);
      });
    });
  });
});
