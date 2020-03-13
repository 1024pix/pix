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

  let sessionLatestAssessmentRejected;
  let sessionWithStartedAndError;
  let sessionLatestAssessmentRejectedCertifCourseIds;
  let sessionWithStartedAndErrorCertifCourseIds;

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

    sessionLatestAssessmentRejectedCertifCourseIds = [];
    sessionWithStartedAndErrorCertifCourseIds = [];

    sessionLatestAssessmentRejected = databaseBuilder.factory.buildSession();
    let id = createCertifCourseWithAssessementResults(sessionLatestAssessmentRejected.id,{ status:'started', createdAt: new Date('2018-02-15T15:00:34Z') }, { status: 'rejected', createdAt: new Date('2018-02-16T15:00:34Z') });
    sessionLatestAssessmentRejectedCertifCourseIds.push(id);

    sessionWithStartedAndError = databaseBuilder.factory.buildSession();
    id = createCertifCourseWithAssessementResults(sessionWithStartedAndError.id,{ status:'started' });
    sessionWithStartedAndErrorCertifCourseIds.push(id);
    id = createCertifCourseWithAssessementResults(sessionWithStartedAndError.id,{ status: 'error' });
    sessionWithStartedAndErrorCertifCourseIds.push(id);

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
      await certificationRepository.updatePublicationStatusesBySessionId(sessionLatestAssessmentRejected.id, true);
      await Promise.all(sessionLatestAssessmentRejectedCertifCourseIds.map(async (id) => {
        const certifCourse = await get(id);
        expect(certifCourse.isPublished).to.be.true;
      }));
    });

    it('should not update the specified certifications and be rejected', async () => {
      const result = await catchErr(certificationRepository.updatePublicationStatusesBySessionId.bind(certificationRepository))(sessionWithStartedAndError.id, true);
      // then
      expect(result).to.be.instanceOf(CertificationCourseNotPublishableError);

      await Promise.all(sessionWithStartedAndErrorCertifCourseIds.map(async (id) => expect((await get(id)).isPublished).to.be.false));
    });
  });

  describe('#getStatuses', () => {

    it('should get distinct latest status from certification course', async () => {
      // when
      const statuses = await certificationRepository.getAssessmentResultsStatusesBySessionId(sessionWithStartedAndError.id);

      // then
      expect(statuses.sort()).to.deep.equal(['started', 'error'].sort());
    });

    it('should get latest status from each assessment results', async () => {
      // when
      const statuses = await certificationRepository.getAssessmentResultsStatusesBySessionId(sessionLatestAssessmentRejected.id);

      // then
      expect(statuses).to.deep.equal(['rejected']);
    });
  });

  function createCertifCourseWithAssessementResults(sessionId, ...assessmentResults) {
    const { id: certifCourseId } = databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: false });
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certifCourseId,
    });
    assessmentResults.forEach(({ status, createdAt }) =>
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId,
        createdAt,
        status,
      }));

    return certifCourseId;
  }

  async function get(id) {
    const certification = await CertificationCourseBookshelf
      .where({ id })
      .fetch();
    return certification.attributes;
  }

});
