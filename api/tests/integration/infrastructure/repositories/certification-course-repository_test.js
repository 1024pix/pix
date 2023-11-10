import _ from 'lodash';
import { catchErr, expect, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as certificationCourseRepository from '../../../../lib/infrastructure/repositories/certification-course-repository.js';
import { BookshelfCertificationCourse } from '../../../../lib/infrastructure/orm-models/CertificationCourse.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { CertificationCourse } from '../../../../lib/domain/models/CertificationCourse.js';

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
        const retrievedCertificationCourse = await certificationCourseRepository.get(savedCertificationCourse.getId());
        const fieldsToOmitInCertificationCourse = [
          'id',
          'assessment',
          'challenges',
          'completedAt',
          'createdAt',
          'certificationIssueReports',
          'complementaryCertificationCourses',
          'maxReachableLevelOnCertificationDate',
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
        });

        return databaseBuilder.commit();
      });

      it('should persist the certification course in db', async function () {
        // when
        const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

        // then
        const retrievedCertificationCourse = await certificationCourseRepository.get(savedCertificationCourse.getId());
        expect(retrievedCertificationCourse.getVersion()).to.equal(3);
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

  describe('#changeCompletionDate', function () {
    let courseId;

    beforeEach(async function () {
      courseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      await databaseBuilder.commit();
    });

    it('should update completedAt of the certificationCourse if one date is passed', async function () {
      // when
      const completionDate = new Date('2018-01-01T06:07:08Z');
      const updatedCertificationCourse = await certificationCourseRepository.changeCompletionDate(
        courseId,
        completionDate,
      );

      // then
      expect(updatedCertificationCourse).to.be.instanceOf(CertificationCourse);
      expect(new Date(updatedCertificationCourse.toDTO().completedAt)).to.deep.equal(completionDate);
    });
  });

  describe('#getCreationDate', function () {
    let certificationCourse;

    beforeEach(async function () {
      certificationCourse = databaseBuilder.factory.buildCertificationCourse({});
      await databaseBuilder.commit();
    });

    it('should get the created date', async function () {
      // when
      const createdAt = await certificationCourseRepository.getCreationDate(certificationCourse.id);

      // then
      expect(createdAt).to.deep.equal(certificationCourse.createdAt);
    });

    it('should throw an error if not found', async function () {
      // when
      const error = await catchErr(certificationCourseRepository.getCreationDate)(certificationCourse.id + 1);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#get', function () {
    let expectedCertificationCourse;
    let anotherCourseId;
    let sessionId;
    let userId;
    const description = 'Un commentaire du surveillant';

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      sessionId = databaseBuilder.factory.buildSession().id;
      expectedCertificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId,
        sessionId,
        completedAt: null,
        firstName: 'Timon',
        lastName: 'De La Havane',
        birthdate: '1993-08-14',
        birthplace: 'Cuba',
        isPublished: true,
      });
      anotherCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
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
            complementaryCertificationId: databaseBuilder.factory.buildComplementaryCertification().id,
          },
          {
            certificationCourseId: expectedCertificationCourse.id,
            badge: databaseBuilder.factory.buildBadge({ key: 'baba_au_rhum' }),
            complementaryCertificationId: databaseBuilder.factory.buildComplementaryCertification().id,
          },
          {
            certificationCourseId: anotherCourseId,
            badge: databaseBuilder.factory.buildBadge({ key: 'tropézienne' }),
            complementaryCertificationId: databaseBuilder.factory.buildComplementaryCertification().id,
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
            partnerKey: badge.partnerKey,
            complementaryCertificationCourseId,
            certificationCourseId,
          });
        },
      );
      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: expectedCertificationCourse.id,
        description,
      });
      return databaseBuilder.commit();
    });

    context('When the certification course exists', function () {
      it('should retrieve certification course informations', async function () {
        // when
        const actualCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

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
        expect(actualCertificationCourseDTO.certificationIssueReports[0].description).to.equal(description);
      });

      it('should retrieve associated challenges with the certification course', async function () {
        // when
        const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

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
          const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

          // then
          expect(thisCertificationCourse.toDTO().assessment.id).to.equal(assessmentId);
        });
      });
    });

    context('When the certification course does not exist', function () {
      it('should retrieve a NotFoundError Error', function () {
        // when
        const promise = certificationCourseRepository.get(3);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });

  describe('#findOneCertificationCourseByUserIdAndSessionId', function () {
    const createdAt = new Date('2018-12-11T01:02:03Z');
    const createdAtLater = new Date('2018-12-12T01:02:03Z');
    let userId;
    let sessionId;

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

  describe('#update', function () {
    let certificationCourse;

    beforeEach(async function () {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const bookshelfCertificationCourse = databaseBuilder.factory.buildCertificationCourse({
        userId,
        isCancelled: false,
      });
      certificationCourse = domainBuilder.buildCertificationCourse(bookshelfCertificationCourse);
      await databaseBuilder.commit();
    });

    it('should return a certification course domain object', async function () {
      // when
      const updatedCertificationCourse = await certificationCourseRepository.update(certificationCourse);

      // then
      expect(updatedCertificationCourse).to.be.an.instanceof(CertificationCourse);
    });

    it('should not add row in table "certification-courses"', async function () {
      // given
      const countCertificationCoursesBeforeUpdate = await BookshelfCertificationCourse.count();

      // when
      await certificationCourseRepository.update(certificationCourse);

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
      });

      // when
      const persistedUpdatedCertificationCourse = await certificationCourseRepository.update(
        unpersistedUpdatedCertificationCourse,
      );

      // then
      const persistedUpdatedCertificationCourseDTO = persistedUpdatedCertificationCourse.toDTO();
      const unpersistedUpdatedCertificationCourseDTO = unpersistedUpdatedCertificationCourse.toDTO();
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
    });

    it('should prevent other values to be updated', async function () {
      // given
      certificationCourse.version = 1;

      // when
      const certificationCourseUpdated = await certificationCourseRepository.update(certificationCourse);

      // then
      expect(certificationCourseUpdated.toDTO().version).to.equal(2);
    });

    it('should return a NotFoundError when ID doesnt exist', function () {
      // given
      const certificationCourseToBeUpdated = new CertificationCourse({
        ...certificationCourse,
        id: certificationCourse.getId() + 1,
      });

      // when
      const promise = certificationCourseRepository.update(certificationCourseToBeUpdated);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#isVerificationCodeAvailable', function () {
    const verificationCode = 'P-XBCDXF11';

    it('should return true if certification code does not exist', async function () {
      // when
      const result = await certificationCourseRepository.isVerificationCodeAvailable(verificationCode);

      // then
      expect(result).to.equal(true);
    });

    it('should return false if certification code already exists', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ verificationCode });
      await databaseBuilder.commit();

      // when
      const result = await certificationCourseRepository.isVerificationCodeAvailable(verificationCode);

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
