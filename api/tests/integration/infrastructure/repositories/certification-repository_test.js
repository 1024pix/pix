const { expect, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Repository | Certification ', () => {
  let user;
  let session;
  let certificationCourse;
  let incompleteCertificationCourse;
  let expectedCertification;
  let assessment;
  let assessmentResult;

  beforeEach(async () => {
    user = databaseBuilder.factory.buildUser();
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
      name: 'Université des chocolats pralinés'
    });
    session = databaseBuilder.factory.buildSession({
      certificationCenterId: certificationCenter.id,
      certificationCenter: certificationCenter.name,
    });
    certificationCourse = databaseBuilder.factory.buildCertificationCourse({
      userId: user.id,
      sessionId: session.id,
      isPublished: true,
    });
    assessment = databaseBuilder.factory.buildAssessment({
      courseId: certificationCourse.id,
      userId: user.id,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    });
    assessmentResult = databaseBuilder.factory.buildAssessmentResult({
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: AssessmentResult.status.REJECTED,
      assessmentId: assessment.id,
      commentForCandidate: 'Comment for candidate',
    });
    expectedCertification = domainBuilder.buildCertification({
      id: certificationCourse.id,
      assessmentState: assessment.state,
      birthdate: certificationCourse.birthdate,
      birthplace: certificationCourse.birthplace,
      certificationCenter: session.certificationCenter,
      date: certificationCourse.completedAt,
      firstName: certificationCourse.firstName,
      lastName: certificationCourse.lastName,
      isPublished: true,
      pixScore: assessmentResult.pixScore,
      status: 'rejected',
      commentForCandidate: assessmentResult.commentForCandidate,
      userId: user.id,
    });
    incompleteCertificationCourse = databaseBuilder.factory.buildCertificationCourse({
      userId: user.id,
      sessionId: session.id,
      isPublished: true,
    });
    databaseBuilder.factory.buildAssessment({
      courseId: incompleteCertificationCourse.id,
      userId: user.id,
      type: Assessment.types.CERTIFICATION,
      state: 'started',
    });

    await databaseBuilder.commit();
  });

  afterEach(() => databaseBuilder.clean());

  describe('#getCertification', () => {
    let certificationCourseWithoutDate;
    let expectedCertificationWithoutDate;

    beforeEach(async () => {
      certificationCourseWithoutDate = databaseBuilder.factory.buildCertificationCourse({
        userId: user.id,
        birthdate: null,
        completedAt: null,
        sessionId: session.id,
        isPublished: true,
        certificationCenter: session.certificationCenter,
      });
      const assessmentOfCertificationCourseWithoutDate = databaseBuilder.factory.buildAssessment({
        courseId: certificationCourseWithoutDate.id,
        userId: user.id,
        type: Assessment.types.CERTIFICATION,
        state: 'completed',
      });
      const assessmentResultOfCertificationCourseWithoutDate = databaseBuilder.factory.buildAssessmentResult({
        level: 1,
        pixScore: 23,
        emitter: 'PIX-ALGO',
        status: AssessmentResult.status.REJECTED,
        assessmentId: assessmentOfCertificationCourseWithoutDate.id,
        commentForCandidate: 'Comment for candidate',
      });
      expectedCertificationWithoutDate = domainBuilder.buildCertification({
        id: certificationCourseWithoutDate.id,
        assessmentState: assessmentOfCertificationCourseWithoutDate.state,
        birthdate: certificationCourseWithoutDate.birthdate,
        birthplace: certificationCourseWithoutDate.birthplace,
        certificationCenter: session.certificationCenter,
        date: certificationCourseWithoutDate.completedAt,
        firstName: certificationCourseWithoutDate.firstName,
        lastName: certificationCourseWithoutDate.lastName,
        isPublished: true,
        pixScore: assessmentResultOfCertificationCourseWithoutDate.pixScore,
        status: 'rejected',
        commentForCandidate: assessmentResultOfCertificationCourseWithoutDate.commentForCandidate,
        userId: user.id,
      });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    it('should return a certification with needed informations', async () => {
      // when
      const actualCertification = await certificationRepository.getCertification({ id: certificationCourse.id });

      // then
      expect(actualCertification).to.deep.equal(expectedCertification);
    });

    it('should not return a false birthdate or completedAt date if there are null in database', async () => {
      // when
      const actualCertification = await certificationRepository.getCertification({ id: certificationCourseWithoutDate.id });

      // then
      expect(actualCertification).to.deep.equal(expectedCertificationWithoutDate);
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

    it('should return an array of Certification related to completed assessment with needed informations', async () => {
      // when
      const certifications = await certificationRepository.findCertificationsByUserId(user.id);

      // then
      expect(certifications).to.deep.equal([expectedCertification]);
    });

  });

  describe('#updateCertification', () => {

    context('the certification does not exist', () => {

      it('should return a NotFoundError', async () => {
        // given
        const NON_EXISITNG_CERTIFICATION_ID = certificationCourse.id + 1;

        // when
        const result = await catchErr(certificationRepository.updateCertification)({
          id: NON_EXISITNG_CERTIFICATION_ID,
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

      // then
      it('should update the certification', () => {
        const expectedUpdatedCertification = expectedCertification;
        expectedUpdatedCertification.isPublished = false;
        expect(certification).to.be.deep.equal(expectedUpdatedCertification);
      });

    });

  });

});
