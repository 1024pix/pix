const { expect, EMPTY_BLANK_AND_NULL } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const { WrongDateFormatError } = require('../../../../../lib/domain/errors');
const { NO_EXAMINER_COMMENT } = require('../../../../../lib/domain/models/CertificationReport');

describe('Unit | Serializer | JSONAPI | certification-serializer', () => {

  describe('#deserialize', function() {
    let jsonCertificationCourse;
    let certificationCourseObject;

    beforeEach(function() {
      jsonCertificationCourse = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Freezer',
            'last-name': 'The all mighty',
            'birthplace': 'Namek',
            'birthdate': '1989-10-24',
            'delivered-at': '2020-10-24',
            'external-id': 'xenoverse2',
            'examiner-comment': 'Un signalement surveillant',
          },
        },
      };

      certificationCourseObject = {
        id: 1,
        firstName: 'Freezer',
        lastName: 'The all mighty',
        birthplace: 'Namek',
        birthdate: '1989-10-24',
        deliveredAt: '2020-10-24',
        externalId: 'xenoverse2',
        examinerComment: 'Un signalement surveillant',
      };
    });

    it('should convert a JSON API data into a Certification Course object', async function() {
      // when
      const result = await serializer.deserialize(jsonCertificationCourse);

      // then
      expect(result).to.deep.equal(certificationCourseObject);
    });

    it('should return an error if date is in wrong format', function() {
      // given
      jsonCertificationCourse.data.attributes.birthdate = '2015-32-12';

      // when
      const promise = serializer.deserialize(jsonCertificationCourse);

      // then
      return promise.catch(() => {
        expect(promise).to.be.rejectedWith(WrongDateFormatError);
      });
    });

    EMPTY_BLANK_AND_NULL.forEach(function(examinerComment) {
      it(`should return no examiner comment if comment is "${examinerComment}"`, async function() {
        // given
        jsonCertificationCourse.data.attributes['examiner-comment'] = examinerComment;

        // when
        const result = await serializer.deserialize(jsonCertificationCourse);

        // then
        expect(result.examinerComment).to.equal(NO_EXAMINER_COMMENT);
      });
    });

    it('should return undefined if no examiner comment', async function() {
      // given
      jsonCertificationCourse.data.attributes['examiner-comment'] = undefined;

      // when
      const result = await serializer.deserialize(jsonCertificationCourse);

      // then
      expect(result.examinerComment).to.equal(undefined);
    });
  });

  describe('#serializeFromCertificationCourse', () => {

    const jsonCertification = {
      data: {
        type: 'certifications',
        id: '1',
        attributes: {
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '1989-10-24',
          'external-id': 'xenoverse2',
        },
      },
    };

    const certificationCourse = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
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
