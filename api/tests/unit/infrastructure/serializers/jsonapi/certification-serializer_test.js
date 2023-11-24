import { expect, EMPTY_BLANK_AND_NULL, domainBuilder } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer.js';
import { WrongDateFormatError } from '../../../../../lib/domain/errors.js';
import { NO_EXAMINER_COMMENT } from '../../../../../src/certification/shared/domain/models/CertificationReport.js';
import { CertificationCourse } from '../../../../../lib/domain/models/CertificationCourse.js';

describe('Unit | Serializer | JSONAPI | certification-serializer', function () {
  describe('#deserialize', function () {
    let jsonCertificationCourse;
    let certificationCourseObject;

    beforeEach(function () {
      jsonCertificationCourse = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Freezer',
            'last-name': 'The all mighty',
            birthplace: 'Namek',
            birthdate: '1989-10-24',
            'delivered-at': '2020-10-24',
            'external-id': 'xenoverse2',
            'examiner-comment': 'Un signalement surveillant',
          },
        },
      };

      certificationCourseObject = new CertificationCourse({
        id: 1,
        firstName: 'Freezer',
        lastName: 'The all mighty',
        birthplace: 'Namek',
        birthdate: '1989-10-24',
        deliveredAt: '2020-10-24',
        externalId: 'xenoverse2',
        examinerComment: 'Un signalement surveillant',
      });
    });

    it('should convert a JSON API data into a Certification Course object', async function () {
      // when
      const result = await serializer.deserialize(jsonCertificationCourse);

      // then
      expect(result).to.deep.equal(certificationCourseObject);
    });

    it('should return an error if date is in wrong format', function () {
      // given
      jsonCertificationCourse.data.attributes.birthdate = '2015-32-12';

      // when
      const promise = serializer.deserialize(jsonCertificationCourse);

      // then
      return promise.catch(() => {
        expect(promise).to.be.rejectedWith(WrongDateFormatError);
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    EMPTY_BLANK_AND_NULL.forEach(function (examinerComment) {
      it(`should return no examiner comment if comment is "${examinerComment}"`, async function () {
        // given
        jsonCertificationCourse.data.attributes['examiner-comment'] = examinerComment;

        // when
        const result = await serializer.deserialize(jsonCertificationCourse);

        // then
        expect(result.examinerComment).to.equal(NO_EXAMINER_COMMENT);
      });
    });

    it('should return undefined if no examiner comment', async function () {
      // given
      jsonCertificationCourse.data.attributes['examiner-comment'] = undefined;

      // when
      const result = await serializer.deserialize(jsonCertificationCourse);

      // then
      expect(result.examinerComment).to.equal(undefined);
    });
  });

  describe('#deserializeCertificationCandidateModificationCommand', function () {
    it('should return an error if date is in wrong format', function () {
      // given
      const payload = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Freezer',
            'last-name': 'The all mighty',
            birthplace: 'Namek',
            birthdate: '2015-32-12',
          },
        },
      };

      // when
      const promise = serializer.deserializeCertificationCandidateModificationCommand(payload);

      // then
      return promise.catch(() => {
        expect(promise).to.be.rejectedWith(WrongDateFormatError);
      });
    });

    it('should deserialize only modifiable fields', async function () {
      // given
      const payload = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Freezer',
            'last-name': 'The all mighty',
            birthplace: 'Namek',
            birthdate: '1989-10-24',
            unmodifiablefield: 'unmodifiable field',
            sex: 'm',
            'birth-country': 'FRANCE',
            'birth-insee-code': '99100',
            'birth-postal-code': '75001',
          },
        },
      };
      const certificationCourseId = 14;
      const userId = 16;

      // when

      const command = await serializer.deserializeCertificationCandidateModificationCommand(
        payload,
        certificationCourseId,
        userId,
      );

      // then
      expect(command).to.deep.equal({
        firstName: 'Freezer',
        lastName: 'The all mighty',
        birthplace: 'Namek',
        birthdate: '1989-10-24',
        certificationCourseId: 14,
        userId: 16,
        sex: 'm',
        birthCountry: 'FRANCE',
        birthINSEECode: '99100',
        birthPostalCode: '75001',
      });
    });
  });

  describe('#serializeFromCertificationCourse', function () {
    const jsonCertification = {
      data: {
        type: 'certifications',
        id: '1',
        attributes: {
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          birthplace: 'Namek',
          birthdate: '1989-10-24',
          sex: 'M',
          'external-id': 'xenoverse2',
          'birth-insee-code': '99100',
          'birth-postal-code': '75001',
          'birth-country': 'FRANCE',
        },
      },
    };

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const certificationCourse = domainBuilder.buildCertificationCourse({
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
      sex: 'M',
      externalId: 'xenoverse2',
      birthINSEECode: '99100',
      birthPostalCode: '75001',
      birthCountry: 'FRANCE',
    });

    it('should serialize', function () {
      // when
      const serializedCertification = serializer.serializeFromCertificationCourse(certificationCourse);
      // then
      expect(serializedCertification).to.deep.equal(jsonCertification);
    });
  });
});
