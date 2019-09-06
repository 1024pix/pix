const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const BookshelfCertificationCourse = require('../../../../lib/infrastructure/data/certification-course');
const { NotFoundError } = require('../../../../lib/domain/errors');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const _ = require('lodash');

describe('Integration | Repository | Certification Course', function() {

  describe('#changeCompletionDate', () => {
    let courseId;

    beforeEach(async () => {
      courseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
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
    let courseId;
    let anotherCourseId;
    let sessionId;
    let assessmentId;

    beforeEach(async () => {
      const userId = databaseBuilder.factory.buildUser({}).id;
      sessionId = databaseBuilder.factory.buildSession({}).id;
      courseId = databaseBuilder.factory.buildCertificationCourse(
        {
          userId,
          sessionId,
          completedAt: null,
          firstName: 'Timon',
          lastName: 'De La Havane',
          birthdate: '1993-08-14',
          birthplace: 'Cuba',
          isPublished: true,
        }).id;
      anotherCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
      assessmentId = databaseBuilder.factory.buildAssessment({ courseId: courseId, userId }).id;
      _.each([
        { courseId: courseId },
        { courseId: courseId },
        { courseId: anotherCourseId },
      ], (certificationChallenge) => {
        databaseBuilder.factory.buildCertificationChallenge(certificationChallenge);
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('When the certification course exists', () => {
      it('should retrieve certification course informations', async () => {
        // when
        const thisCertificationCourse = await certificationCourseRepository.get(courseId);

        // then
        expect(thisCertificationCourse.id).to.equal(courseId);
        expect(thisCertificationCourse.type).to.equal('CERTIFICATION');
        expect(thisCertificationCourse.completedAt).to.equal(null);
        expect(thisCertificationCourse.firstName).to.equal('Timon');
        expect(thisCertificationCourse.lastName).to.equal('De La Havane');
        expect(thisCertificationCourse.birthdate.toDateString()).to.equal(new Date('1993-08-14').toDateString());
        expect(thisCertificationCourse.birthplace).to.equal('Cuba');
        expect(thisCertificationCourse.sessionId).to.equal(sessionId);
        expect(thisCertificationCourse.isPublished).to.be.ok;
      });

      it('should retrieve associated assessment and challenges with the certification course', async () => {
        // when
        const thisCertificationCourse = await certificationCourseRepository.get(courseId);

        // then
        expect(thisCertificationCourse.assessment.id).to.equal(assessmentId);
        expect(thisCertificationCourse.challenges.length).to.equal(2);
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

  describe('#findLastCertificationCourseByUserIdAndSessionId', function() {

    let userId, yetAnotherUserId;
    let sessionId, yetAnotherSessionId;
    let expectedCertificationCourse;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser({}).id;
      const anotherUserId = databaseBuilder.factory.buildUser({}).id;
      yetAnotherUserId = databaseBuilder.factory.buildUser({}).id;
      sessionId = databaseBuilder.factory.buildSession({}).id;
      const anotherSessionId = databaseBuilder.factory.buildSession({}).id;
      yetAnotherSessionId = databaseBuilder.factory.buildSession({}).id;
      _.each([
        { userId: anotherUserId, sessionId, completedAt: null, createdAt: new Date('2018-12-21T01:02:03Z') },
        { userId, sessionId: anotherSessionId, completedAt: null, createdAt: new Date('2018-12-21T01:02:03Z') },
        { userId, sessionId, createdAt: new Date('2018-12-11T01:02:03Z') },
        { userId, sessionId, completedAt: null, createdAt: new Date('2018-11-11T01:02:03Z') },
      ], (certificationCourse) => {
        databaseBuilder.factory.buildCertificationCourse(certificationCourse);
      });
      expectedCertificationCourse = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, completedAt: null, createdAt: new Date('2018-12-12T01:02:03Z') });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should retrieve certification course with given userId, sessionId and with value null as completedAt', async () => {
      // when
      const certificationCourses = await certificationCourseRepository.findLastCertificationCourseByUserIdAndSessionId(userId, sessionId);
      // then
      expect(certificationCourses).to.have.lengthOf(1);
      expect(_.omit(certificationCourses[0], [
        'assessment',
        'challenges',
        'type',
        'nbChallenges',
        // TODO : Handle date type correctly
        'birthdate',
        'updatedAt'
      ])).to.deep.equal(_.omit(expectedCertificationCourse, ['birthdate', 'updatedAt']));
      expect(certificationCourses[0]['birthdate'].toLocaleDateString()).to.equal(expectedCertificationCourse['birthdate'].toLocaleDateString());
    });

    it('should retrieve empty array when none of certification courses matches', async () => {
      // when
      const certificationCourses = await certificationCourseRepository.findLastCertificationCourseByUserIdAndSessionId(yetAnotherUserId, yetAnotherSessionId);

      // then
      expect(certificationCourses).to.deep.equal([]);
    });
  });

  describe('#getLastCertificationCourseByUserIdAndSessionId', function() {

    const createdAt = new Date('2018-12-11T01:02:03Z');
    const createdAtLater = new Date('2018-12-12T01:02:03Z');
    let userId;
    let sessionId;

    beforeEach(async () => {
      // given
      await databaseBuilder.clean();
      userId = databaseBuilder.factory.buildUser({}).id;
      sessionId = databaseBuilder.factory.buildSession({}).id;
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt });
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, createdAt: createdAtLater });

      databaseBuilder.factory.buildCertificationCourse({ sessionId });
      databaseBuilder.factory.buildCertificationCourse({ userId });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

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

    afterEach(async () => {
      await databaseBuilder.clean();
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
});

