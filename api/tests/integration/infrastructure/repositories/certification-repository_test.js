const { expect, domainBuilder, databaseBuilder, catchErr, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');

const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');

describe('Integration | Repository | Certification ', () => {

  let userId;
  let session;
  let certificationCourse;
  let incompleteCertificationCourse;
  let certificationCourseWithoutDate;
  let expectedCertification;
  let expectedCertificationWithoutDate;
  const type = Assessment.types.CERTIFICATION;

  let sessionWithUnpublishedCertifCourse;
  let sessionWithUnpublishedCertifCourseIds = [];

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
      birthdate: certificationCourse.birthdate,
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
      birthdate: certificationCourseWithoutDate.birthdate,
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

    sessionWithUnpublishedCertifCourseIds = [];
    sessionWithUnpublishedCertifCourse = databaseBuilder.factory.buildSession();
    let certifCourse =  databaseBuilder.factory.buildCertificationCourse({
      sessionId: sessionWithUnpublishedCertifCourse.id,
      isPublished: false,
    });
    sessionWithUnpublishedCertifCourseIds.push(certifCourse.id);
    certifCourse =  databaseBuilder.factory.buildCertificationCourse({
      sessionId: sessionWithUnpublishedCertifCourse.id,
      isPublished: false,
    });
    sessionWithUnpublishedCertifCourseIds.push(certifCourse.id);

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('assessment-results').delete();
    await knex('assessments').delete();
    await knex('certification-courses').delete();
    await knex('sessions').delete();
    return;
  });

  describe('#getByCertificationCourseId', () => {

    it('should return a certification with needed informations', async () => {
      // when
      const actualCertification = await certificationRepository.getByCertificationCourseId({ id: certificationCourse.id });

      // then
      expect(actualCertification).to.deep.equal(expectedCertification);
    });

    it('should not return a false birthdate or completedAt date if there are null in database', async () => {
      // when
      const actualCertification = await certificationRepository.getByCertificationCourseId({ id: certificationCourseWithoutDate.id });

      // then
      expect(actualCertification).to.deep.equal(expectedCertificationWithoutDate);
    });

    it('should return a not found error when certification does not exist', async () => {
      // when
      const result = await catchErr(certificationRepository.getByCertificationCourseId)({ id: -1 });

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });

    it('should return a not found error when certification does not reference a completed assessment', async () => {
      // when
      const result = await catchErr(certificationRepository.getByCertificationCourseId)({ id: incompleteCertificationCourse.id });

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findByUserId', () => {

    it('should return an array of Certifications related to completed assessment with needed informations', async () => {
      // when
      const certifications = await certificationRepository.findByUserId(userId);

      // then
      expect(certifications).to.deep.equal([expectedCertificationWithoutDate, expectedCertification]);
    });

  });

  describe('#updatePublicationStatus', () => {

    context('the certification does not exist', () => {

      it('should return a NotFoundError', async () => {
        // when
        const result = await catchErr(certificationRepository.updatePublicationStatus)({
          id: -1,
          isPublished: true,
        });

        // then
        expect(result).to.be.instanceOf(NotFoundError);
      });
    });

    context('the certification does exist', () => {

      let certification;
      beforeEach(async () => {
        certification = await certificationRepository.updatePublicationStatus({
          id: certificationCourse.id,
          isPublished: false,
        });
      });

      it('should update the certification', () => {
        const expectedUpdatedCertification = expectedCertification;
        expectedUpdatedCertification.isPublished = false;
        expect(certification).to.deep.equal(expectedUpdatedCertification);
      });
    });
  });

  describe('#updateCertifications', () => {
    
    it('should update the specified certifications', async () => {
      await certificationRepository.updatePublicationStatusesBySessionId(sessionWithUnpublishedCertifCourse.id, true);
      await Promise.all(sessionWithUnpublishedCertifCourseIds.map(async (id) => {
        const certifCourse = await get(id);
        expect(certifCourse.isPublished).to.be.true;
      }));
    });
  });

  async function get(id) {
    const certification = await CertificationCourseBookshelf
      .where({ id })
      .fetch();
    return certification.attributes;
  }

});
