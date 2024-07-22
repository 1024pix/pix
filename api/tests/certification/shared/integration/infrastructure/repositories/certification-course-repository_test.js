import _ from 'lodash';

import { BookshelfCertificationCourse } from '../../../../../../lib/infrastructure/orm-models/CertificationCourse.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import * as certificationCourseRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification Course', function () {
  describe('#save', function () {
    let certificationCourse;
    let complementaryCertificationId;
    let complementaryCertificationBadgeId;

    describe('when the session is V2', function () {
      beforeEach(function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const sessionId = databaseBuilder.factory.buildSession().id;
        const badgeId = databaseBuilder.factory.buildBadge().id;

        complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({}).id;
        complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId,
          complementaryCertificationId,
        }).id;
        certificationCourse = domainBuilder.buildCertificationCourse.unpersisted({
          userId,
          sessionId,
          complementaryCertificationCourses: [{ complementaryCertificationId, complementaryCertificationBadgeId }],
        });

        return databaseBuilder.commit();
      });

      it('should persist the certif course in db', async function () {
        // when
        const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

        // then
        const retrievedCertificationCourse = await certificationCourseRepository.get({
          id: savedCertificationCourse.getId(),
        });
        const fieldsToOmitInCertificationCourse = [
          'id',
          'assessment',
          'challenges',
          'completedAt',
          'createdAt',
          'certificationIssueReports',
          'complementaryCertificationCourses',
          'maxReachableLevelOnCertificationDate',
          'lang',
        ];

        expect(_.omit(retrievedCertificationCourse.toDTO(), fieldsToOmitInCertificationCourse)).to.deep.equal(
          _.omit(certificationCourse.toDTO(), fieldsToOmitInCertificationCourse),
        );

        const fieldsToOmitInCertificationChallenge = ['id', 'courseId'];
        const certificationChallengeToBeSaved = _.map(certificationCourse.toDTO().challenges, (c) =>
          _.omit(c, fieldsToOmitInCertificationChallenge),
        );
        const savedCertificationChallenge = _.map(savedCertificationCourse.toDTO().challenges, (c) =>
          _.omit(c, fieldsToOmitInCertificationChallenge),
        );

        expect(savedCertificationChallenge).to.deep.equal(certificationChallengeToBeSaved);

        const [savedComplementaryCertificationCourse] =
          retrievedCertificationCourse.toDTO().complementaryCertificationCourses;
        expect(_.omit(savedComplementaryCertificationCourse, ['createdAt', 'id'])).to.deep.equal({
          complementaryCertificationId,
          complementaryCertificationBadgeId,
          certificationCourseId: savedCertificationCourse.getId(),
        });

        expect(_.every(savedCertificationCourse.challenges, (c) => c.courseId === savedCertificationCourse.getId())).to
          .be.true;
      });

      it('should return the saved certification course', async function () {
        // when
        const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

        // then
        expect(savedCertificationCourse).to.be.an.instanceOf(CertificationCourse);
        expect(savedCertificationCourse.getId()).not.to.be.null;
      });
    });

    describe('when the session is V3', function () {
      beforeEach(function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const sessionId = databaseBuilder.factory.buildSession({ version: 3 }).id;

        certificationCourse = domainBuilder.buildCertificationCourse.unpersisted({
          userId,
          sessionId,
          complementaryCertificationCourses: [],
          version: 3,
          lang: 'fr',
        });

        return databaseBuilder.commit();
      });

      it('should persist the certification course in db', async function () {
        // when
        const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

        // then
        const retrievedCertificationCourse = await certificationCourseRepository.get({
          id: savedCertificationCourse.getId(),
        });
        expect(retrievedCertificationCourse.getVersion()).to.equal(3);
        expect(retrievedCertificationCourse.getLanguage()).to.equal('fr');
      });

      it('should return the saved certification course', async function () {
        // when
        const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

        // then
        expect(savedCertificationCourse).to.be.an.instanceOf(CertificationCourse);
        expect(savedCertificationCourse.getId()).not.to.be.null;
      });
    });
  });

  describe('#getSessionId', function () {
    it('should get the related session id', async function () {
      // given
      databaseBuilder.factory.buildSession({ id: 99 });
      databaseBuilder.factory.buildCertificationCourse({ id: 77, sessionId: 99 });
      await databaseBuilder.commit();
      // when

      const sessionId = await certificationCourseRepository.getSessionId({ id: 77 });

      // then
      expect(sessionId).to.deep.equal(99);
    });

    it('should throw an error if not found', async function () {
      // when
      const error = await catchErr(certificationCourseRepository.getSessionId)({ id: 77 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.deep.equals('Certification course of id 77 does not exist');
    });
  });

  describe('#get', function () {
    const description = 'Un commentaire du surveillant';
    let sessionId, expectedCertificationCourse, userId;

    context('When the certification course exists', function () {
      context('When the certification course is v2', function () {
        beforeEach(async function () {
          ({ sessionId, expectedCertificationCourse, userId } = _buildCertificationCourse({
            description,
          }));

          await databaseBuilder.commit();
        });
        it('should retrieve certification course informations', async function () {
          // when
          const actualCertificationCourse = await certificationCourseRepository.get({
            id: expectedCertificationCourse.id,
          });

          // then
          const actualCertificationCourseDTO = actualCertificationCourse.toDTO();
          expect(actualCertificationCourseDTO.id).to.equal(expectedCertificationCourse.id);
          expect(actualCertificationCourseDTO.completedAt).to.equal(expectedCertificationCourse.completedAt);
          expect(actualCertificationCourseDTO.firstName).to.equal(expectedCertificationCourse.firstName);
          expect(actualCertificationCourseDTO.lastName).to.equal(expectedCertificationCourse.lastName);
          expect(actualCertificationCourseDTO.birthdate).to.equal(expectedCertificationCourse.birthdate);
          expect(actualCertificationCourseDTO.birthplace).to.equal(expectedCertificationCourse.birthplace);
          expect(actualCertificationCourseDTO.sessionId).to.equal(sessionId);
          expect(actualCertificationCourseDTO.isPublished).to.equal(expectedCertificationCourse.isPublished);
          expect(actualCertificationCourseDTO.isRejectedForFraud).to.equal(
            expectedCertificationCourse.isRejectedForFraud,
          );
          expect(actualCertificationCourseDTO.certificationIssueReports[0].description).to.equal(description);
        });

        it('should retrieve associated challenges with the certification course', async function () {
          // when
          const thisCertificationCourse = await certificationCourseRepository.get({
            id: expectedCertificationCourse.id,
          });

          // then
          expect(thisCertificationCourse.toDTO().challenges.length).to.equal(2);
        });
        context('When the certification course has one assessment', function () {
          let assessmentId;

          beforeEach(function () {
            assessmentId = databaseBuilder.factory.buildAssessment({
              type: 'CERTIFICATION',
              certificationCourseId: expectedCertificationCourse.id,
              userId,
            }).id;
            return databaseBuilder.commit();
          });

          it('should retrieve associated assessment', async function () {
            // when
            const thisCertificationCourse = await certificationCourseRepository.get({
              id: expectedCertificationCourse.id,
            });

            // then
            expect(thisCertificationCourse.toDTO().assessment.id).to.equal(assessmentId);
          });
        });
      });

      context('When the certification course is v3', function () {
        it('should retrieve the number of challenges from the configuration', async function () {
          const maximumAssessmentLength = 10;
          const { expectedCertificationCourse } = _buildCertificationCourse({
            description,
            version: 3,
            createdAt: new Date('2022-01-03'),
          });

          // Active configuration on the certification day
          databaseBuilder.factory.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength,
            createdAt: new Date('2022-01-02'),
          });

          // Older configuration
          databaseBuilder.factory.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: 5,
            createdAt: new Date('2022-01-01'),
          });

          // Newer configuration
          databaseBuilder.factory.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: 15,
            createdAt: new Date('2022-01-04'),
          });

          await databaseBuilder.commit();
          // when
          const actualCertificationCourse = await certificationCourseRepository.get({
            id: expectedCertificationCourse.id,
          });

          // then
          expect(actualCertificationCourse.getNumberOfChallenges()).to.equal(maximumAssessmentLength);
        });
      });
    });

    context('When the certification course does not exist', function () {
      it('should retrieve a NotFoundError Error', function () {
        // when
        const promise = certificationCourseRepository.get({ id: 3 });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });

  describe('#findOneCertificationCourseByUserIdAndSessionId', function () {
    const createdAt = new Date('2018-12-11T01:02:03Z');
    const createdAtLater = new Date('2018-12-12T01:02:03Z');
    const v3ConfigurationCreationDate = new Date('2018-12-12T01:00:03Z');
    const numberOfQuestionsForV3 = 10;
    let userId;
    let sessionId;

    describe('when certification is v2', function () {
      beforeEach(function () {
        // given
        userId = databaseBuilder.factory.buildUser({}).id;
        sessionId = databaseBuilder.factory.buildSession({}).id;
        databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt });
        databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt: createdAtLater });

        databaseBuilder.factory.buildCertificationCourse({ sessionId });
        databaseBuilder.factory.buildCertificationCourse({ userId });

        return databaseBuilder.commit();
      });

      it('should retrieve the most recently created certification course with given userId, sessionId', async function () {
        // when
        const certificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
          userId,
          sessionId,
        });

        // then
        expect(certificationCourse.toDTO().createdAt).to.deep.equal(createdAtLater);
      });

      it('should return null when no certification course found', async function () {
        // when
        const result = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
          userId: userId + 1,
          sessionId,
        });

        // then
        expect(result).to.be.null;
      });
    });

    describe('when certification is v3', function () {
      beforeEach(function () {
        // given
        userId = databaseBuilder.factory.buildUser({}).id;
        sessionId = databaseBuilder.factory.buildSession({}).id;
        databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt });
        databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt: createdAtLater, version: 3 });

        databaseBuilder.factory.buildCertificationCourse({ sessionId });
        databaseBuilder.factory.buildCertificationCourse({ userId });

        databaseBuilder.factory.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: numberOfQuestionsForV3,
          createdAt: v3ConfigurationCreationDate,
        });

        return databaseBuilder.commit();
      });

      it('should retrieve the most recently created certification course with given userId, sessionId', async function () {
        // when
        const certificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
          userId,
          sessionId,
        });

        // then
        expect(certificationCourse.toDTO().createdAt).to.deep.equal(createdAtLater);
      });

      it('should retrieve the right number of question', async function () {
        // when
        const certificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
          userId,
          sessionId,
        });

        // then
        expect(certificationCourse.toDTO().numberOfChallenges).to.equal(numberOfQuestionsForV3);
      });
    });
  });

  describe('#update', function () {
    let certificationCourse;

    beforeEach(async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const certificationCourseData = databaseBuilder.factory.buildCertificationCourse({
        userId,
        isCancelled: false,
      });
      certificationCourse = domainBuilder.buildCertificationCourse(certificationCourseData);
      await databaseBuilder.commit();
    });

    it('should not add row in table "certification-courses"', async function () {
      // given
      const countCertificationCoursesBeforeUpdate = await BookshelfCertificationCourse.count();

      // when
      await certificationCourseRepository.update({ certificationCourse });

      // then
      const countCertificationCoursesAfterUpdate = await BookshelfCertificationCourse.count();
      expect(countCertificationCoursesAfterUpdate).to.equal(countCertificationCoursesBeforeUpdate);
    });

    it('should update whitelisted values in database', async function () {
      // given
      const unpersistedUpdatedCertificationCourse = new CertificationCourse({
        ...certificationCourse.toDTO(),
        firstName: 'Jean-Pix',
        lastName: 'Compétan',
        birthdate: '2000-01-01',
        birthplace: 'Paris',
        isCancelled: true,
        completedAt: new Date('1999-12-31'),
        birthINSEECode: '01091',
        birthPostalCode: '01200',
        birthCountry: 'Kazakhstan',
        sex: 'M',
        isRejectedForFraud: true,
      });

      // when
      await certificationCourseRepository.update({ certificationCourse: unpersistedUpdatedCertificationCourse });

      // then
      const unpersistedUpdatedCertificationCourseDTO = unpersistedUpdatedCertificationCourse.toDTO();
      const persistedUpdatedCertificationCourse = await certificationCourseRepository.get({
        id: unpersistedUpdatedCertificationCourseDTO.id,
      });
      const persistedUpdatedCertificationCourseDTO = persistedUpdatedCertificationCourse.toDTO();
      expect(persistedUpdatedCertificationCourse.getId()).to.equal(unpersistedUpdatedCertificationCourse.getId());
      expect(persistedUpdatedCertificationCourseDTO.firstName).to.equal(
        unpersistedUpdatedCertificationCourseDTO.firstName,
      );
      expect(persistedUpdatedCertificationCourseDTO.lastName).to.equal(
        unpersistedUpdatedCertificationCourseDTO.lastName,
      );
      expect(persistedUpdatedCertificationCourseDTO.birthdate).to.equal(
        unpersistedUpdatedCertificationCourseDTO.birthdate,
      );
      expect(persistedUpdatedCertificationCourseDTO.birthplace).to.equal(
        unpersistedUpdatedCertificationCourseDTO.birthplace,
      );
      expect(persistedUpdatedCertificationCourseDTO.birthPostalCode).to.equal(
        unpersistedUpdatedCertificationCourseDTO.birthPostalCode,
      );
      expect(persistedUpdatedCertificationCourseDTO.birthINSEECode).to.equal(
        unpersistedUpdatedCertificationCourseDTO.birthINSEECode,
      );
      expect(persistedUpdatedCertificationCourseDTO.birthCountry).to.equal(
        unpersistedUpdatedCertificationCourseDTO.birthCountry,
      );
      expect(persistedUpdatedCertificationCourseDTO.sex).to.equal(unpersistedUpdatedCertificationCourseDTO.sex);
      expect(persistedUpdatedCertificationCourseDTO.isCancelled).to.be.true;
      expect(persistedUpdatedCertificationCourseDTO.completedAt).to.deep.equal(new Date('1999-12-31'));
      expect(persistedUpdatedCertificationCourseDTO.isRejectedForFraud).to.be.true;
    });

    it('should prevent other values to be updated', async function () {
      // given
      certificationCourse.version = 1;

      // when
      await certificationCourseRepository.update({ certificationCourse });

      // then
      const certificationCourseUpdated = await certificationCourseRepository.get({ id: certificationCourse.getId() });

      expect(certificationCourseUpdated.toDTO().version).to.equal(2);
    });

    it('should return a NotFoundError when ID doesnt exist', function () {
      // given
      const certificationCourseToBeUpdated = new CertificationCourse({
        ...certificationCourse,
        id: certificationCourse.getId() + 1,
      });

      // when
      const promise = certificationCourseRepository.update({ certificationCourse: certificationCourseToBeUpdated });

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#isVerificationCodeAvailable', function () {
    const verificationCode = 'P-XBCDXF11';

    it('should return true if certification code does not exist', async function () {
      // when
      const result = await certificationCourseRepository.isVerificationCodeAvailable({ verificationCode });

      // then
      expect(result).to.equal(true);
    });

    it('should return false if certification code already exists', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ verificationCode });
      await databaseBuilder.commit();

      // when
      const result = await certificationCourseRepository.isVerificationCodeAvailable({ verificationCode });

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#findCertificationCoursesBySessionId', function () {
    let sessionId;
    let sessionIdWithoutCertifCourses;
    let firstCertifCourse;
    let secondCertifCourse;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      sessionIdWithoutCertifCourses = databaseBuilder.factory.buildSession().id;
      firstCertifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId });
      secondCertifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId });
      return databaseBuilder.commit();
    });

    function _cleanCertificationCourse(certificationCourse) {
      return _.omit(certificationCourse, '_certificationIssueReports', '_assessment', '_challenges', 'updatedAt');
    }

    it('should returns all certification courses id with given sessionId', async function () {
      // when
      const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
        sessionId,
      });

      // then
      expect(certificationCourses).to.have.lengthOf(2);
      expect(_cleanCertificationCourse(certificationCourses[0])).to.deep.equal(
        _cleanCertificationCourse(new CertificationCourse(firstCertifCourse)),
      );
      expect(_cleanCertificationCourse(certificationCourses[1])).to.deep.equal(
        _cleanCertificationCourse(new CertificationCourse(secondCertifCourse)),
      );
    });

    it('should return empty array when no certification course found', async function () {
      // when
      const result = await certificationCourseRepository.findCertificationCoursesBySessionId({
        sessionId: sessionIdWithoutCertifCourses,
      });

      // then
      expect(result).to.be.empty;
    });
  });
});

function _buildCertificationCourse({ createdAt, description, version = 2 }) {
  const userId = databaseBuilder.factory.buildUser().id;
  const sessionId = databaseBuilder.factory.buildSession().id;
  const expectedCertificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId,
    completedAt: null,
    createdAt,
    firstName: 'Timon',
    lastName: 'De La Havane',
    birthdate: '1993-08-14',
    birthplace: 'Cuba',
    isPublished: true,
    isRejectedForFraud: true,
    version,
  });
  const anotherCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
  _.each(
    [
      { courseId: expectedCertificationCourse.id },
      { courseId: expectedCertificationCourse.id },
      { courseId: anotherCourseId },
    ],
    (certificationChallenge) => {
      databaseBuilder.factory.buildCertificationChallenge(certificationChallenge);
    },
  );
  _.each(
    [
      {
        certificationCourseId: expectedCertificationCourse.id,
        badge: databaseBuilder.factory.buildBadge({ key: 'forêt_noire' }),
        complementaryCertificationId: databaseBuilder.factory.buildComplementaryCertification({ key: 'CHOCO' }).id,
      },
      {
        certificationCourseId: expectedCertificationCourse.id,
        badge: databaseBuilder.factory.buildBadge({ key: 'baba_au_rhum' }),
        complementaryCertificationId: databaseBuilder.factory.buildComplementaryCertification({ key: 'EPONGE' }).id,
      },
      {
        certificationCourseId: anotherCourseId,
        badge: databaseBuilder.factory.buildBadge({ key: 'tropézienne' }),
        complementaryCertificationId: databaseBuilder.factory.buildComplementaryCertification({ key: 'CREME' }).id,
      },
    ],
    ({ certificationCourseId, complementaryCertificationId, badge }) => {
      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge.id,
        complementaryCertificationId,
      }).id;
      const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId,
        complementaryCertificationBadgeId,
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
      });
    },
  );
  databaseBuilder.factory.buildCertificationIssueReport({
    certificationCourseId: expectedCertificationCourse.id,
    description,
  });

  return {
    userId,
    sessionId,
    expectedCertificationCourse,
  };
}
