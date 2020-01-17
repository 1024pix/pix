const { expect, databaseBuilder, knex, domainBuilder, catchErr } = require('../../../test-helper');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const BookshelfCertificationCourse = require('../../../../lib/infrastructure/data/certification-course');
const { NotFoundError, CertificationCourseUpdateError } = require('../../../../lib/domain/errors');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const Assessment = require('../../../../lib/domain/models/Assessment');
const _ = require('lodash');

describe('Integration | Repository | Certification Course', function() {

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
      userId = databaseBuilder.factory.buildUser({}).id;
      sessionId = databaseBuilder.factory.buildSession({}).id;
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

      context('When the certification course has several assessments', () => {

        context('When one of those assessment is completed', () => {
          let completedAssessmentId;

          beforeEach(() => {
            databaseBuilder.factory.buildAssessment({ courseId: expectedCertificationCourse.id, userId, state: Assessment.states.STARTED });
            completedAssessmentId = databaseBuilder.factory.buildAssessment({ courseId: expectedCertificationCourse.id, userId }).id;
            return databaseBuilder.commit();
          });

          it('should retrieve associated completed assessment', async () => {
            // when
            const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

            // then
            expect(thisCertificationCourse.assessment.id).to.equal(completedAssessmentId);
          });
        });

        context('When no assessment is completed', () => {
          let assessmentIds;

          beforeEach(() => {
            assessmentIds = _.map([
              { courseId: expectedCertificationCourse.id, userId, state: Assessment.states.STARTED },
              { courseId: expectedCertificationCourse.id, userId, state: Assessment.states.STARTED },
              { courseId: expectedCertificationCourse.id, userId, state: Assessment.states.STARTED },
            ], (assessment) => databaseBuilder.factory.buildAssessment(assessment).id);
            return databaseBuilder.commit();
          });

          it('should retrieve an assessment anyway', async () => {
            // when
            const actualCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

            // then
            expect(assessmentIds).to.include(actualCertificationCourse.assessment.id);
          });

        });

      });

      context('When the certification course has one assessment', () => {
        let assessmentId;

        beforeEach(() => {
          assessmentId = databaseBuilder.factory.buildAssessment({ courseId: expectedCertificationCourse.id, userId }).id;
          return databaseBuilder.commit();
        });

        it('should retrieve associated assessment', async () => {
          // when
          const thisCertificationCourse = await certificationCourseRepository.get(expectedCertificationCourse.id);

          // then
          expect(thisCertificationCourse.assessment.id).to.equal(assessmentId);
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

  describe('#getLastCertificationCourseByUserIdAndSessionId', function() {

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

    it('should retrieve the last certification course with given userId, sessionId', async () => {
      // when
      const certificationCourse = await certificationCourseRepository.getLastCertificationCourseByUserIdAndSessionId(userId, sessionId);

      // then
      expect(certificationCourse.createdAt).to.deep.equal(createdAtLater);
    });

    it('should throw not found error when no certification course found', async () => {
      // when
      const result = await catchErr(certificationCourseRepository.getLastCertificationCourseByUserIdAndSessionId)(userId + 1, sessionId + 1);

      // then
      expect(result).to.be.instanceOf(NotFoundError);
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

  describe('#finalize', () => {
    let certificationCourse;
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    beforeEach(async () => {
      certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        hasSeenEndTestScreen: false,
        examinerComment: null,
        sessionId,
      });

      return databaseBuilder.commit();
    });

    it('should return the finalized certification courses', async () => {
      // given
      certificationCourse.hasSeenEndTestScreen = true;
      certificationCourse.examinerComment = 'J\'aime les fruits et les poulets';

      // when
      await certificationCourseRepository.finalize({ certificationCourse });

      // then
      const actualCertificationCourses = await knex('certification-courses').where({ sessionId });
      expect(actualCertificationCourses[0].hasSeenEndTestScreen).to.equal(certificationCourse.hasSeenEndTestScreen);
      expect(actualCertificationCourses[0].examinerComment).to.equal(certificationCourse.examinerComment);
    });

  });

  describe('#finalizeAll', () => {
    let certificationCourse1;
    let certificationCourse2;
    let sessionId;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when Courses are being successfully finalized', () => {

      beforeEach(async () => {
        certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should return the finalized certification Courses', async () => {
        // given
        certificationCourse1.hasSeenEndTestScreen = true;
        certificationCourse2.examinerComment = 'J\'aime les fruits et les poulets';

        // when
        await certificationCourseRepository.finalizeAll([certificationCourse1, certificationCourse2]);

        // then
        const actualCertificationCourses = await knex('certification-courses').where({ sessionId });
        const actualCourse1 = _.find(actualCertificationCourses, { id: certificationCourse1.id });
        const actualCourse2 = _.find(actualCertificationCourses, { id: certificationCourse2.id });
        expect(actualCourse1.hasSeenEndTestScreen).to.equal(certificationCourse1.hasSeenEndTestScreen);
        expect(actualCourse2.examinerComment).to.equal(certificationCourse2.examinerComment);
      });

    });

    context('when finalization fails', () => {

      beforeEach(async () => {
        certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({
          hasSeenEndTestScreen: false,
          examinerComment: null,
          sessionId,
        });

        return databaseBuilder.commit();
      });

      it('should have left the Courses as they were and rollback updates if any', async () => {
        // given
        certificationCourse1.examinerComment = 'J\'aime les fruits et les poulets';
        certificationCourse2.hasSeenEndTestScreen = 'je suis supposé être un booléen';

        // when
        const error = await catchErr(certificationCourseRepository.finalizeAll)([certificationCourse1, certificationCourse2]);

        // then
        const actualCertificationCourses = await knex('certification-courses').where({ sessionId });
        const actualCourse1 = _.find(actualCertificationCourses, { id: certificationCourse1.id });
        const actualCourse2 = _.find(actualCertificationCourses, { id: certificationCourse2.id });
        expect(actualCourse2.examinerComment).to.equal(null);
        expect(actualCourse1.hasSeenEndTestScreen).to.equal(false);
        expect(error).to.be.an.instanceOf(CertificationCourseUpdateError);
      });

    });

  });

});
