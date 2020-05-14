const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const certificationAssessmentRepository = require('../../../../lib/infrastructure/repositories/certification-assessment-repository');
const CertificationAssessment = require('../../../../lib/domain/models/CertificationAssessment');

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
        expectedCertificationCourseId = dbf.buildCertificationCourse({ userId: expectedUserId, createdAt: expectedCreatedAt, completedAt: expectedCompletedAt, isV2Certification: true }).id;
        certificationAssessmentId = dbf.buildAssessment({ userId: expectedUserId, certificationCourseId: expectedCertificationCourseId, state: expectedState }).id;
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildAnswer({ assessmentId: certificationAssessmentId });
        dbf.buildCertificationChallenge({ courseId: expectedCertificationCourseId });
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

        expect(certificationAssessment.certificationAnswers).to.have.length(2);
        expect(certificationAssessment.certificationChallenges).to.have.length(2);
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

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        expectedUserId = dbf.buildUser().id;
        certificationCourseId = dbf.buildCertificationCourse({ userId: expectedUserId, createdAt: expectedCreatedAt, completedAt: expectedCompletedAt, isV2Certification: true }).id;
        expectedCertificationAssessmentId = dbf.buildAssessment({ userId: expectedUserId, certificationCourseId: certificationCourseId, state: expectedState }).id;
        dbf.buildAnswer({ assessmentId: expectedCertificationAssessmentId });
        dbf.buildAnswer({ assessmentId: expectedCertificationAssessmentId });
        dbf.buildCertificationChallenge({ courseId: certificationCourseId });
        dbf.buildCertificationChallenge({ courseId: certificationCourseId });

        return databaseBuilder.commit();
      });

      it('should return the certification assessment with certification challenges and answers', async () => {
        // when
        const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId(certificationCourseId);

        // then
        expect(certificationAssessment).to.be.an.instanceOf(CertificationAssessment);
        expect(certificationAssessment.id).to.equal(expectedCertificationAssessmentId);
        expect(certificationAssessment.userId).to.equal(expectedUserId);
        expect(certificationAssessment.certificationCourseId).to.equal(certificationCourseId);
        expect(certificationAssessment.state).to.equal(expectedState);
        expect(certificationAssessment.isV2Certification).to.be.true;

        expect(certificationAssessment.certificationAnswers).to.have.length(2);
        expect(certificationAssessment.certificationChallenges).to.have.length(2);
      });
    });

    context('when the assessment does not exist', () => {
      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(certificationAssessmentRepository.getByCertificationCourseId)(12345);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

});
