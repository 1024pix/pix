const { expect, domainBuilder, databaseBuilder, catchErr, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');

const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');

describe('Integration | Repository | Certification ', () => {

  let userId;
  let session;
  let certificationCourse;
  let expectedCertification;
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
    const assessment = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certificationCourse.id,
      userId,
      type,
    });
    const assessmentResult = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment.id });
    expectedCertification = _buildCertification(session.certificationCenter, certificationCourse, assessment, assessmentResult);

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
    return knex('sessions').delete();
  });

  describe('#getByCertificationCourseId', () => {

    it('should return a certification with needed informations', async () => {
      // when
      const actualCertification = await certificationRepository.getByCertificationCourseId({ id: certificationCourse.id });

      // then
      expect(actualCertification).to.deep.equal(expectedCertification);
    });

    it('should return a not found error when certification does not exist', async () => {
      // when
      const result = await catchErr(certificationRepository.getByCertificationCourseId)({ id: -1 });

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findByUserId', () => {
    let expectedCertifications;

    beforeEach(() => {
      // Without assessment
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: session.id });
      // Without assessment-result
      const withoutAsrCcId = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: session.id }).id;
      databaseBuilder.factory.buildAssessment({ userId, certificationCourseId: withoutAsrCcId });
      // Ok
      const certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: session.id });
      const assessment1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse1.id,
        userId,
        type,
        state: 'started',
      });
      const assessmentResult1 = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment1.id });
      const certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: session.id });
      const assessment2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse2.id,
        userId,
        type,
        state: 'completed',
      });
      const assessmentResult2 = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment2.id });
      expectedCertifications = [
        _buildCertification(session.certificationCenter, certificationCourse1, assessment1, assessmentResult1),
        _buildCertification(session.certificationCenter, certificationCourse2, assessment2, assessmentResult2),
        expectedCertification,
      ];

      return databaseBuilder.commit();
    });

    it('should return an array of Certifications with needed informations', async () => {
      // when
      const certifications = await certificationRepository.findByUserId(userId);

      // then
      expect(certifications).to.deep.include.members(expectedCertifications);
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

function _buildCertification(certificationCenterName, certificationCourse, assessment, assessmentResult) {
  return domainBuilder.buildCertification({
    id: certificationCourse.id,
    assessmentState: assessment.state,
    birthdate: certificationCourse.birthdate,
    birthplace: certificationCourse.birthplace,
    certificationCenter: certificationCenterName,
    date: certificationCourse.createdAt,
    firstName: certificationCourse.firstName,
    lastName: certificationCourse.lastName,
    isPublished: certificationCourse.isPublished,
    pixScore: assessmentResult.pixScore,
    status: assessmentResult.status,
    commentForCandidate: assessmentResult.commentForCandidate,
    userId: certificationCourse.userId,
  });
}
