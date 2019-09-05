const { expect, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const _ = require('lodash');

describe('Integration | Repository | Certification ', () => {

  let userId;
  let session;
  let certificationCourse;
  let incompleteCertificationCourse;
  let certificationCourseWithoutDate;
  let expectedCertification;
  let expectedCertificationWithoutDate;
  const type = Assessment.types.CERTIFICATION;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    const {
      id: certificationCenterId,
      name: certificationCenter,
    } = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College' });
    session = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter });
    certificationCourse = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: session.id, isPublished: true });
    databaseBuilder.factory.buildAssessment({
      courseId: certificationCourse.id,
      userId,
      type,
      state: Assessment.states.STARTED,
    });
    const {
      id: assessmentId,
      state: assessmentState,
    } = databaseBuilder.factory.buildAssessment({
      courseId: certificationCourse.id,
      userId,
      type,
      state: Assessment.states.COMPLETED,
    });
    const {
      pixScore,
      commentForCandidate,
      status,
    } = databaseBuilder.factory.buildAssessmentResult({ assessmentId });
    expectedCertification = domainBuilder.buildCertification({
      id: certificationCourse.id,
      assessmentState,
      // TODO : Handle date type correctly
      // birthdate: certificationCourse.birthdate,
      birthplace: certificationCourse.birthplace,
      certificationCenter: session.certificationCenter,
      date: certificationCourse.completedAt,
      firstName: certificationCourse.firstName,
      lastName: certificationCourse.lastName,
      isPublished: true,
      pixScore,
      status,
      commentForCandidate,
      userId,
    });
    // TODO : Handle date type correctly
    expectedCertification = _.omit(expectedCertification, 'birthdate');
    incompleteCertificationCourse = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: session.id, isPublished: true });
    databaseBuilder.factory.buildAssessment({
      courseId: incompleteCertificationCourse.id,
      userId,
      type,
      state: Assessment.states.STARTED,
    });
    certificationCourseWithoutDate = databaseBuilder.factory.buildCertificationCourse({
      userId,
      birthdate: null,
      completedAt: null,
      sessionId: session.id,
      isPublished: true,
      certificationCenter: session.certificationCenter,
    });
    const {
      id: assessmentIdNoDate,
      state: assessmentStateNoDate,
    } = databaseBuilder.factory.buildAssessment({
      courseId: certificationCourseWithoutDate.id,
      userId,
      type,
      state: Assessment.states.COMPLETED,
    });
    const {
      pixScore: pixScoreNoDate,
      commentForCandidate: commentForCandidateNoDate,
      status: statusNoDate,
    } = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessmentIdNoDate });
    expectedCertificationWithoutDate = domainBuilder.buildCertification({
      id: certificationCourseWithoutDate.id,
      assessmentState: assessmentStateNoDate,
      // TODO : Handle date type correctly
      // birthdate: certificationCourseWithoutDate.birthdate,
      birthplace: certificationCourseWithoutDate.birthplace,
      certificationCenter: session.certificationCenter,
      date: certificationCourseWithoutDate.completedAt,
      firstName: certificationCourseWithoutDate.firstName,
      lastName: certificationCourseWithoutDate.lastName,
      isPublished: true,
      pixScore: pixScoreNoDate,
      status: statusNoDate,
      commentForCandidate: commentForCandidateNoDate,
      userId,
    });
    // TODO : Handle date type correctly
    expectedCertificationWithoutDate = _.omit(expectedCertificationWithoutDate, 'birthdate');

    await databaseBuilder.commit();
  });

  afterEach(() => databaseBuilder.clean());

  describe('#getCertification', () => {

    it('should return a certification with needed informations', async () => {
      // when
      const actualCertification = await certificationRepository.getCertification({ id: certificationCourse.id });

      // then
      // TODO : Handle date type correctly
      expect(_.omit(actualCertification, 'birthdate')).to.deep.equal(expectedCertification);
    });

    it('should not return a false birthdate or completedAt date if there are null in database', async () => {
      // when
      const actualCertification = await certificationRepository.getCertification({ id: certificationCourseWithoutDate.id });

      // then
      // TODO : Handle date type correctly
      expect(_.omit(actualCertification, 'birthdate')).to.deep.equal(expectedCertificationWithoutDate);
    });

    it('should return a not found error when certification does not exist', async () => {
      // when
      const result = await catchErr(certificationRepository.getCertification)({ id: -1 });

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });

    it('should return a not found error when certification does not reference a completed assessment', async () => {
      // when
      const result = await catchErr(certificationRepository.getCertification)({ id: incompleteCertificationCourse.id });

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findCertificationbyUserId', () => {

    it('should return an array of Certifications related to completed assessment with needed informations', async () => {
      // when
      const certifications = await certificationRepository.findCertificationsByUserId(userId);

      // then
      expect(_.map(certifications, (certification) => _.omit(certification, 'birthdate')))
        .to.deep.equal([expectedCertificationWithoutDate, expectedCertification]);
    });

  });

  describe('#updateCertification', () => {

    context('the certification does not exist', () => {

      it('should return a NotFoundError', async () => {
        // when
        const result = await catchErr(certificationRepository.updateCertification)({
          id: -1,
          attributes: { isPublished: true },
        });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });
    });

    context('the certification does exist', () => {

      let certification;
      beforeEach(async () => {
        certification = await certificationRepository.updateCertification({
          id: certificationCourse.id,
          attributes: { isPublished: false },
        });
      });

      it('should update the certification', () => {
        const expectedUpdatedCertification = expectedCertification;
        expectedUpdatedCertification.isPublished = false;
        // TODO : Handle date type correctly
        expect(_.omit(certification, 'birthdate')).to.be.deep.equal(expectedUpdatedCertification, 'birthdate');
      });

    });

  });

});
