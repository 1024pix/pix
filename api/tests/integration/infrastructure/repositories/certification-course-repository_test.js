const { catchErr, expect, databaseBuilder, domainBuilder, knex } = require('../../../test-helper');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const BookshelfCertificationCourse = require('../../../../lib/infrastructure/data/certification-course');
const { NotFoundError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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
        hasSeenEndTestScreen: false,
        isV2Certification: false,
        sessionId,
        userId,
        challenges: [
          domainBuilder.buildCertificationChallenge(),
          domainBuilder.buildCertificationChallenge(),
          domainBuilder.buildCertificationChallenge(),
        ],
        verificationCode: null,
        maxReachableLevelOnCertificationDate: 5,
      });

      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('certification-challenges').delete();
      return knex('certification-courses').delete();
    });

    it('should persist the certif course in db', async () => {
      // when
      const savedCertificationCourse = await certificationCourseRepository.save({ certificationCourse });

      // then
      const retrievedCertificationCourse = await certificationCourseRepository.get(savedCertificationCourse.id);
      const fieldsToOmitInCertificationCourse = [
        'id',
        'assessment',
        'challenges',
        'completedAt',
        'createdAt',
        'certificationIssueReports',
      ];
      const fieldsToOmitInCertificationChallenge = [ 'id', 'courseId' ];

      expect(
        _.omit(retrievedCertificationCourse, fieldsToOmitInCertificationCourse),
      ).to.deep.equal(
        _.omit(certificationCourse, fieldsToOmitInCertificationCourse),
      );

      const certificationChallengeToBeSaved = _.map(certificationCourse.challenges, (c) => _.omit(c, fieldsToOmitInCertificationChallenge));
      const savedCertificationChallenge = _.map(savedCertificationCourse.challenges, (c) => _.omit(c, fieldsToOmitInCertificationChallenge));
      expect(savedCertificationChallenge).to.deep.equal(certificationChallengeToBeSaved);

      expect(
        _.every(savedCertificationCourse.challenges, (c) => c.courseId === savedCertificationCourse.id),
      ).to.be.true;
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
      // given
      const completionDate = new Date('2018-01-01T06:07:08Z');

      // when
      const updatedCertificationCourse = await DomainTransaction.execute(async (domainTransaction) =>
        certificationCourseRepository.changeCompletionDate(courseId, completionDate, domainTransaction),
      );

      // then
      expect(updatedCertificationCourse).to.be.instanceOf(CertificationCourse);
      expect(new Date(updatedCertificationCourse.completedAt)).to.deep.equal(completionDate);
    });
  });

  describe('#getCreationDate', () => {
    let certificationCourse;

    afterEach(() => {
      return knex('certification-courses').delete();
    });

    beforeEach(async () => {
      certificationCourse = databaseBuilder.factory.buildCertificationCourse({});
      await databaseBuilder.commit();
    });

    it('should get the created date', async () => {
      // when
      const createdAt = await certificationCourseRepository.getCreationDate(certificationCourse.id);

      // then
      expect(createdAt).to.deep.equal(certificationCourse.createdAt);
    });

    it('should throw an error if not found', async () => {
      // when
      const error = await catchErr(certificationCourseRepository.getCreationDate)(certificationCourse.id + 1);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#get', function() {
    let expectedCertificationCourse;
    let anotherCourseId;
    let sessionId;
    let userId;
    const description = 'Un commentaire du surveillant';

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
        {
          certificationCourseId: expectedCertificationCourse.id,
          partnerKey: databaseBuilder.factory.buildBadge({ key: 'forêt_noire' }).key,
        },
        {
          certificationCourseId: expectedCertificationCourse.id,
          partnerKey: databaseBuilder.factory.buildBadge({ key: 'baba_au_rhum' }).key,
        },
        { certificationCourseId: anotherCourseId, partnerKey: databaseBuilder.factory.buildBadge({ key: 'tropézienne' }).key },
      ], (acquiredPartnerCertification) =>
        databaseBuilder.factory.buildPartnerCertification(acquiredPartnerCertification));
      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: expectedCertificationCourse.id,
        description,
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
        expect(actualCertificationCourse.certificationIssueReports[0].description).to.equal(description);
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
          assessmentId = databaseBuilder.factory.buildAssessment({
            type: 'CERTIFICATION',
            certificationCourseId: expectedCertificationCourse.id,
            userId,
          }).id;
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
      const certificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
        userId,
        sessionId,
      });

      // then
      expect(certificationCourse.createdAt).to.deep.equal(createdAtLater);
    });

    it('should return null when no certification course found', async () => {
      // when
      const result = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
        userId: userId + 1,
        sessionId,
      });

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

  describe('#isVerificationCodeAvailable', () => {
    const verificationCode = 'P-XBCDXF11';

    it('should return true if certification code does not exist', async () => {
      // when
      const result = await certificationCourseRepository.isVerificationCodeAvailable(verificationCode);

      // then
      expect(result).to.equal(true);
    });

    it('should return false if certification code already exists', async () => {
      // given
      databaseBuilder.factory.buildCertificationCourse({ verificationCode });
      await databaseBuilder.commit();

      // when
      const result = await certificationCourseRepository.isVerificationCodeAvailable(verificationCode);

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#findCertificationCoursesBySessionId', () => {
    let sessionId;
    let sessionIdWithoutCertifCourses;
    let firstCertifCourse;
    let secondCertifCourse;

    beforeEach(() => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      sessionIdWithoutCertifCourses = databaseBuilder.factory.buildSession().id;
      firstCertifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId });
      secondCertifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId });
      return databaseBuilder.commit();
    });

    function _cleanCertificationCourse(certificationCourse) {
      return _.omit(certificationCourse, 'certificationIssueReports', 'assessment', 'challenges', 'updatedAt');
    }
    it('should returns all certification courses id with given sessionId', async () => {
      // when
      const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId });

      // then
      expect(certificationCourses).to.have.lengthOf(2);
      expect(_cleanCertificationCourse(certificationCourses[0])).to.deep.equal(_cleanCertificationCourse(firstCertifCourse));
      expect(_cleanCertificationCourse(certificationCourses[1])).to.deep.equal(_cleanCertificationCourse(secondCertifCourse));
    });

    it('should return empty array when no certification course found', async () => {
      // when
      const result = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId: sessionIdWithoutCertifCourses });

      // then
      expect(result).to.be.empty;
    });
  });

  describe('#findBySessionIdAndUserIds', () => {
    let sessionId;
    let firstCertifCourse;
    let user1;
    let user2;

    it('should returns all certification courses id with given session id and user ids', async () => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      user1 = databaseBuilder.factory.buildUser();
      user2 = databaseBuilder.factory.buildUser();
      firstCertifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId, userId: user1.id });
      databaseBuilder.factory.buildCertificationCourse({ sessionId, userId: user2.id });
      await databaseBuilder.commit();

      // when
      const certificationCourses = await certificationCourseRepository.findBySessionIdAndUserIds({ sessionId, userIds: [user1.id] });

      // then
      expect(certificationCourses).to.have.lengthOf(1);
      expect(_cleanCertificationCourse(certificationCourses[0])).to.deep.equal(_cleanCertificationCourse(firstCertifCourse));
    });
  });

  describe('#findCertificationCoursesByCandidateIds', () => {
    it('returns an empty array when none exists', async () => {
      // given
      const candidateIds = [1, 2, 3];
      // when
      const certificationCourses = certificationCourseRepository.findCertificationCoursesByCandidateIds({ candidateIds });
      // then
      expect(certificationCourses).to.be.empty;
    });

    it('returns the certifications courses of given candidates Ids', async () => {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const certifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId, userId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId,
      }).id;
      await databaseBuilder.commit();

      // when
      const certificationCourses = await certificationCourseRepository.findCertificationCoursesByCandidateIds({ candidateIds: [certificationCandidateId] });
      // then
      expect(certificationCourses).to.have.lengthOf(1);
      expect(certificationCourses[0]).to.be.an.instanceof(CertificationCourse);
      expect(_cleanCertificationCourse(certificationCourses[0])).to.deep.equal(_cleanCertificationCourse(certifCourse));
    });

    it('returns only the certification course that is linked to the candidate\'s session', async () => {
      const aSessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const certifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId: aSessionId, userId });
      databaseBuilder.factory.buildCertificationCourse({ sessionId: anotherSessionId, userId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId: aSessionId,
      }).id;
      await databaseBuilder.commit();

      // when
      const certificationCourses = await certificationCourseRepository.findCertificationCoursesByCandidateIds({ candidateIds: [certificationCandidateId] });
      // then
      expect(certificationCourses).to.have.lengthOf(1);
      expect(_cleanCertificationCourse(certificationCourses[0])).to.deep.equal(_cleanCertificationCourse(certifCourse));
    });

    it('returns only the certification course that is linked to the candidate\'s user', async () => {
      const aSessionId = databaseBuilder.factory.buildSession().id;
      const aUserId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      const certifCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId: aSessionId, userId: aUserId });
      databaseBuilder.factory.buildCertificationCourse({ sessionId: aSessionId, userId: anotherUserId });
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId: aUserId,
        sessionId: aSessionId,
      }).id;
      await databaseBuilder.commit();

      // when
      const certificationCourses = await certificationCourseRepository.findCertificationCoursesByCandidateIds({ candidateIds: [certificationCandidateId] });
      // then
      expect(certificationCourses).to.have.lengthOf(1);
      expect(_cleanCertificationCourse(certificationCourses[0])).to.deep.equal(_cleanCertificationCourse(certifCourse));
    });
  });
});

function _cleanCertificationCourse(certificationCourse) {
  return _.omit(certificationCourse, 'certificationIssueReports', 'assessment', 'challenges', 'updatedAt');
}
