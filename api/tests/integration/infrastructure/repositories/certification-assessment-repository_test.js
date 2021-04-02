const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const certificationAssessmentRepository = require('../../../../lib/infrastructure/repositories/certification-assessment-repository');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');
const _ = require('lodash');

describe('Integration | Infrastructure | Repositories | certification-assessment-repository', () => {

  describe('#get', () => {

    let certificationAssessmentId;
    let expectedCertificationCourseId;
    let expectedUserId;
    const expectedState = CertificationAssessment.states.COMPLETED;
    const expectedCreatedAt = new Date('2020-01-01T00:00:00Z');
    const expectedCompletedAt = new Date('2020-01-02T00:00:00Z');

    context('when the certification assessment exists', () => {

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        expectedCertificationCourseId = dbf.buildCertificationCourse({
          userId: expectedUserId,
          createdAt: expectedCreatedAt,
          completedAt: expectedCompletedAt,
          isV2Certification: true,
        }).id;
        certificationAssessmentId = dbf.buildAssessment({
          userId: expectedUserId,
          certificationCourseId: expectedCertificationCourseId,
          state: expectedState,
        }).id;
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildCertificationChallenge({ courseId: expectedCertificationCourseId, isNeutralized: true });
        dbf.buildCertificationChallenge({ courseId: expectedCertificationCourseId });

        return databaseBuilder.commit();
      });

      it('should return the certification assessment with certification challenges and answers', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.get(certificationAssessmentId);

        // then
        expect(certificationAssessment).to.be.an.instanceOf(CertificationAssessment);
        expect(certificationAssessment.id).to.equal(certificationAssessmentId);
        expect(certificationAssessment.userId).to.equal(expectedUserId);
        expect(certificationAssessment.certificationCourseId).to.equal(expectedCertificationCourseId);
        expect(certificationAssessment.state).to.equal(expectedState);
        expect(certificationAssessment.isV2Certification).to.be.true;

        expect(certificationAssessment.certificationAnswersByDate).to.have.length(2);
        expect(certificationAssessment.certificationChallenges).to.have.length(2);
        expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
      });
    });

    context('when the assessment does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(certificationAssessmentRepository.get)(12345);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getByCertificationCourseId', () => {

    let expectedCertificationAssessmentId;
    let certificationCourseId;
    let expectedUserId;
    const expectedState = CertificationAssessment.states.COMPLETED;
    const expectedCreatedAt = new Date('2020-01-01T00:00:00Z');
    const expectedCompletedAt = new Date('2020-01-02T00:00:00Z');

    context('when the certification assessment exists', () => {
      let firstAnswerInTime;
      let secondAnswerInTime;
      let firstChallengeId;
      let secondChallengeId;

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        certificationCourseId = dbf.buildCertificationCourse({
          userId: expectedUserId,
          createdAt: expectedCreatedAt,
          completedAt: expectedCompletedAt,
          isV2Certification: true,
        }).id;
        expectedCertificationAssessmentId = dbf.buildAssessment({
          userId: expectedUserId,
          certificationCourseId: certificationCourseId,
          state: expectedState,
        }).id;

        // secondAnswerInTime must be inserted in DB before firstAnswerInTime so we can ensure that ordering is based on createdAt
        secondAnswerInTime = dbf.buildAnswer({
          assessmentId: expectedCertificationAssessmentId,
          createdAt: new Date('2020-06-24T00:00:01Z'),
        }).id;

        firstAnswerInTime = dbf.buildAnswer({
          assessmentId: expectedCertificationAssessmentId,
          createdAt: new Date('2020-06-24T00:00:00Z'),
        }).id;

        secondChallengeId = dbf.buildCertificationChallenge({ courseId: certificationCourseId, id: 123 }).id;
        firstChallengeId = dbf.buildCertificationChallenge({ courseId: certificationCourseId, id: 456 }).id;

        return databaseBuilder.commit();
      });

      it('should return the certification assessment with certification challenges and answers', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(certificationAssessment).to.be.an.instanceOf(CertificationAssessment);
        expect(certificationAssessment.id).to.equal(expectedCertificationAssessmentId);
        expect(certificationAssessment.userId).to.equal(expectedUserId);
        expect(certificationAssessment.certificationCourseId).to.equal(certificationCourseId);
        expect(certificationAssessment.state).to.equal(expectedState);
        expect(certificationAssessment.isV2Certification).to.be.true;

        expect(certificationAssessment.certificationAnswersByDate).to.have.length(2);
        expect(certificationAssessment.certificationChallenges).to.have.length(2);
      });

      it('should return the certification answers ordered by date', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(_.map(certificationAssessment.certificationAnswersByDate, 'id')).to.deep.equal([firstAnswerInTime, secondAnswerInTime]);
      });

      it('should return the certification challenges ordered by id', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

        // then
        expect(_.map(certificationAssessment.certificationChallenges, 'id')).to.deep.equal([secondChallengeId, firstChallengeId]);
      });
    });

    context('when the assessment does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(certificationAssessmentRepository.getByCertificationCourseId)({ certificationCourseId: 12345 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', () => {

    it('persists the mutation of neutralized certification challenges', async () => {
      // given
      const dbf = databaseBuilder.factory;
      const userId = dbf.buildUser().id;
      const certificationCourseId = dbf.buildCertificationCourse({ userId }).id;
      const certificationAssessmentId = dbf.buildAssessment({
        userId,
        certificationCourseId,
      }).id;
      dbf.buildAnswer({ assessmentId: certificationAssessmentId });
      dbf.buildAnswer({ assessmentId: certificationAssessmentId });

      const certificationChallenge1RecId = 'rec1234';
      const certificationChallenge2RecId = 'rec567' ;
      dbf.buildCertificationChallenge({ challengeId: certificationChallenge1RecId, courseId: certificationCourseId, isNeutralized: false });
      dbf.buildCertificationChallenge({ challengeId: certificationChallenge2RecId, courseId: certificationCourseId, isNeutralized: false });
      dbf.buildCertificationChallenge({ challengeId: 'rec8910', courseId: certificationCourseId, isNeutralized: false });

      await databaseBuilder.commit();
      const certificationAssessmentToBeSaved = await certificationAssessmentRepository.get(certificationAssessmentId);

      // when
      certificationAssessmentToBeSaved.neutralizeChallengeByRecId(certificationChallenge1RecId);
      certificationAssessmentToBeSaved.neutralizeChallengeByRecId(certificationChallenge2RecId);
      await certificationAssessmentRepository.save(certificationAssessmentToBeSaved);

      // then
      const persistedCertificationAssessment = await certificationAssessmentRepository.get(certificationAssessmentId);
      expect(persistedCertificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
      expect(persistedCertificationAssessment.certificationChallenges[1].isNeutralized).to.be.true;
      expect(persistedCertificationAssessment.certificationChallenges[2].isNeutralized).to.be.false;
    });
  });
});
