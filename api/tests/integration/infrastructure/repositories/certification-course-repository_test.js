const { expect, databaseBuilder, domainBuilder, knex } = require('../../../test-helper');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const BookshelfCertificationCourse = require('../../../../lib/infrastructure/data/certification-course');
const { NotFoundError } = require('../../../../lib/domain/errors');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const _ = require('lodash');

describe('Integration | Repository | Certification Course', function() {

  describe('#save', () => {
    let certificationCourse;

    beforeEach(() => {
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      certificationCourse = new CertificationCourse({
        firstName: 'Antoine',
        lastName: 'Griezmann',
        birthplace: 'Macon',
        birthdate: '1991-03-21',
        externalId: 'xenoverse2',
        isPublished: false,
        examinerComment: 'Salut',
        hasSeenEndTestScreen: false,
        isV2Certification: false,
        sessionId,
        userId,
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-courses').delete();
    });

    it('should persist the certif course in db', async () => {
      // when
      await certificationCourseRepository.save({ certificationCourse });

      // then
      const certificationCourseSaved = await knex('certification-courses').select();
      expect(certificationCourseSaved).to.have.lengthOf(1);
    });

    it('should return the saved certification course', async () => {
      // when
      const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

      // then
      expect(savedCertificationCourse).to.be.an.instanceOf(CertificationCourse);
      expect(savedCertificationCourse).to.have.property('id').and.not.null;
    });

  });

  describe('#changeCompletionDate', () => {
    let courseId;

    beforeEach(async () => {
      courseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      await databaseBuilder.commit();
    });

    it('should update completedAt of the certificationCourse if one date is passed', async () => {
      // when
      const completionDate = new Date('2018-01-01T06:07:08Z');
      const updatedCertificationCourse = await certificationCourseRepository.changeCompletionDate(courseId, completionDate);

      // then
      expect(updatedCertificationCourse).to.be.instanceOf(CertificationCourse);
      expect(new Date(updatedCertificationCourse.completedAt)).to.deep.equal(completionDate);
    });
  });

  describe('#get', function() {
    let expectedCertificationCourse;
    let anotherCourseId;
    let sessionId;
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      sessionId = databaseBuilder.factory.buildSession().id;
      expectedCertificationCourse = databaseBuilder.factory.buildCertificationCourse(
        {
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
      _.each([
        { courseId: expectedCertificationCourse.id },
        { courseId: expectedCertificationCourse.id },
        { courseId: anotherCourseId },
      ], (certificationChallenge) => {
        databaseBuilder.factory.buildCertificationChallenge(certificationChallenge);
      });
      _.each([
        { certificationCourseId: expectedCertificationCourse.id,  partnerKey: databaseBuilder.factory.buildBadge({}).key },
        { certificationCourseId: expectedCertificationCourse.id,  partnerKey: databaseBuilder.factory.buildBadge({}).key },
        { certificationCourseId: anotherCourseId,  partnerKey: databaseBuilder.factory.buildBadge({}).key },
      ], (acquiredPartnerCertification) => {
        databaseBuilder.factory.buildCertificationAcquiredPartner(acquiredPartnerCertification,);
      });
      return databaseBuilder.commit();
    });

    context('When the certification course exists', () => {

      it('should retrieve certification course informations', async () => {
        // when
        const actualCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

        // then
        expect(actualCertificationCourse.id).to.equal(expectedCertificationCourse.id);
        expect(actualCertificationCourse.completedAt).to.equal(expectedCertificationCourse.completedAt);
        expect(actualCertificationCourse.firstName).to.equal(expectedCertificationCourse.firstName);
        expect(actualCertificationCourse.lastName).to.equal(expectedCertificationCourse.lastName);
        expect(actualCertificationCourse.birthdate).to.equal(expectedCertificationCourse.birthdate);
        expect(actualCertificationCourse.birthplace).to.equal(expectedCertificationCourse.birthplace);
        expect(actualCertificationCourse.sessionId).to.equal(sessionId);
        expect(actualCertificationCourse.isPublished).to.equal(expectedCertificationCourse.isPublished);
      });

      it('should retrieve associated challenges with the certification course', async () => {
        // when
        const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

        // then
        expect(thisCertificationCourse.challenges.length).to.equal(2);
      });

      context('When the certification course has one assessment', () => {
        let assessmentId;

        beforeEach(() => {
          assessmentId = databaseBuilder.factory.buildAssessment({ type: 'CERTIFICATION', certificationCourseId: expectedCertificationCourse.id, userId }).id;
          return databaseBuilder.commit();
        });

        it('should retrieve associated assessment', async () => {
          // when
          const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

          // then
          expect(thisCertificationCourse.assessment.id).to.equal(assessmentId);
        });

        it('should retrieve acquired badge', async () => {
          // when
          const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

          // then
          expect(thisCertificationCourse.acquiredPartnerCertifications.length).to.equal(2);
        });

      });

    });

    context('When the certification course does not exist', () => {
      it('should retrieve a NotFoundError Error', function() {
        // when
        const promise = certificationCourseRepository.get(3);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

  });

  describe('#findOneCertificationCourseByUserIdAndSessionId', function() {

    const createdAt = new Date('2018-12-11T01:02:03Z');
    const createdAtLater = new Date('2018-12-12T01:02:03Z');
    let userId;
    let sessionId;

    beforeEach(() => {
      // given
      userId = databaseBuilder.factory.buildUser({}).id;
      sessionId = databaseBuilder.factory.buildSession({}).id;
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt });
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt: createdAtLater });

      databaseBuilder.factory.buildCertificationCourse({ sessionId });
      databaseBuilder.factory.buildCertificationCourse({ userId });

      return databaseBuilder.commit();
    });

    it('should retrieve the most recently created certification course with given userId, sessionId', async () => {
      // when
      const certificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({ userId, sessionId });

      // then
      expect(certificationCourse.createdAt).to.deep.equal(createdAtLater);
    });

    it('should return null when no certification course found', async () => {
      // when
      const result = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({ userId: userId + 1, sessionId });

      // then
      expect(result).to.be.null;
    });
  });

  describe('#update', () => {
    let certificationCourse;

    beforeEach(async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const bookshelfCertificationCourse = databaseBuilder.factory.buildCertificationCourse({ userId });
      certificationCourse = domainBuilder.buildCertificationCourse(bookshelfCertificationCourse);
      await databaseBuilder.commit();
    });

    it('should return a certification course domain object', async () => {
      // when
      const updatedCertificationCourse = await certificationCourseRepository.update(certificationCourse);

      // then
      expect(updatedCertificationCourse).to.be.an.instanceof(CertificationCourse);
    });

    it('should not add row in table "certification-courses"', async () => {
      // given
      const countCertificationCoursesBeforeUpdate = await BookshelfCertificationCourse.count();

      // when
      await certificationCourseRepository.update(certificationCourse);

      // then
      const countCertificationCoursesAfterUpdate = await BookshelfCertificationCourse.count();
      expect(countCertificationCoursesAfterUpdate).to.equal(countCertificationCoursesBeforeUpdate);
    });

    it('should update model in database', async () => {
      // given
      certificationCourse.firstName = 'Jean-Pix';
      certificationCourse.lastName = 'Compétan';

      // when
      const certificationCourseUpdated = await certificationCourseRepository.update(certificationCourse);

      // then
      expect(certificationCourseUpdated.id).to.equal(certificationCourse.id);
      expect(certificationCourseUpdated.firstName).to.equal(certificationCourse.firstName);
      expect(certificationCourseUpdated.lastName).to.equal(certificationCourse.lastName);
    });

    it('should return a NotFoundError when ID doesnt exist', function() {
      // given
      certificationCourse.id += 1;
      certificationCourse.firstName = 'Jean-Pix';
      certificationCourse.lastName = 'Compétan';

      // when
      const promise = certificationCourseRepository.update(certificationCourse);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#findIdsBySessionId', () => {
    let sessionIdWithoutCertificationCourses;
    let sessionIdWithCertificationCourses;
    const expectedCertificationCourseIds = [];

    beforeEach(() => {
      // given
      sessionIdWithoutCertificationCourses = databaseBuilder.factory.buildSession().id;
      sessionIdWithCertificationCourses = databaseBuilder.factory.buildSession().id;
      const unrelatedSessionId = databaseBuilder.factory.buildSession().id;

      expectedCertificationCourseIds.length = 0;
      expectedCertificationCourseIds.push(databaseBuilder.factory.buildCertificationCourse({ sessionId: sessionIdWithCertificationCourses }).id);
      expectedCertificationCourseIds.push(databaseBuilder.factory.buildCertificationCourse({ sessionId: sessionIdWithCertificationCourses }).id);
      databaseBuilder.factory.buildCertificationCourse({ sessionId: unrelatedSessionId });

      return databaseBuilder.commit();
    });

    it('should return an empty array there is no certification course for given session', async () => {
      // when
      const actualCertificationCourseIds = await certificationCourseRepository.findIdsBySessionId(sessionIdWithoutCertificationCourses);

      // then
      expect(actualCertificationCourseIds).to.be.empty;
    });

    it('should return an array with the certification course ids when session has some', async () => {
      // when
      const actualCertificationCourseIds = await certificationCourseRepository.findIdsBySessionId(sessionIdWithCertificationCourses);

      // then
      expect(actualCertificationCourseIds).to.include.members(expectedCertificationCourseIds);
      expect(actualCertificationCourseIds.length).to.equal(expectedCertificationCourseIds.length);
    });
  });

});
