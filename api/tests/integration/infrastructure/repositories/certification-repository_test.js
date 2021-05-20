const { expect, databaseBuilder, catchErr, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { CertificationCourseNotPublishableError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { status } = require('../../../../lib/domain/models/AssessmentResult');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');

const CertificationCourseBookshelf = require('../../../../lib/infrastructure/orm-models/CertificationCourse');
const PARTNER_CLEA_KEY = 'BANANA';
const verificationCode = 'P-123498NN';

describe('Integration | Repository | Certification ', () => {

  const pixScore = 400;

  let userId;
  let completeCertificationCourse;
  const type = Assessment.types.CERTIFICATION;

  let sessionLatestAssessmentRejected;
  let sessionWithPublishedCertificationCourses;
  let sessionWithStartedAndError;
  let sessionLatestAssessmentRejectedCertifCourseIds;
  let sessionWithStartedAndErrorCertifCourseIds;
  let sessionWithPublishedCertificationCoursesCertifCourseIds;

  let certificationCenterId;
  let certificationCenter;

  beforeEach(async () => {

    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildBadge({ key: PARTNER_CLEA_KEY });
    ({
      id: certificationCenterId,
      name: certificationCenter,
    } = databaseBuilder.factory.buildCertificationCenter({ name: 'Certif College' }));
    ({ certificationCourse: completeCertificationCourse }
      = _buildValidatedPublishedCertificationData({ verificationCode, certificationCenterId, certificationCenter, userId, type, pixScore }));

    sessionLatestAssessmentRejectedCertifCourseIds = [];
    sessionWithStartedAndErrorCertifCourseIds = [];
    sessionWithPublishedCertificationCoursesCertifCourseIds = [];

    sessionLatestAssessmentRejected = databaseBuilder.factory.buildSession();
    let id = createCertifCourseWithAssessementResults(sessionLatestAssessmentRejected.id, { status: 'started', createdAt: new Date('2018-02-15T15:00:34Z') }, { status: 'rejected', createdAt: new Date('2018-02-16T15:00:34Z') });
    sessionLatestAssessmentRejectedCertifCourseIds.push(id);

    sessionWithStartedAndError = databaseBuilder.factory.buildSession();
    id = createCertifCourseWithAssessementResults(sessionWithStartedAndError.id, { status: 'started' });
    sessionWithStartedAndErrorCertifCourseIds.push(id);
    id = createCertifCourseWithAssessementResults(sessionWithStartedAndError.id, { status: 'error' });
    sessionWithStartedAndErrorCertifCourseIds.push(id);

    sessionWithPublishedCertificationCourses = databaseBuilder.factory.buildSession();
    id = createPublishedCertifCourseWithAssessementResults(sessionWithPublishedCertificationCourses.id, { status: 'started', createdAt: new Date('2018-02-15T15:00:34Z') }, { status: 'rejected', createdAt: new Date('2018-02-16T15:00:34Z') });
    sessionWithPublishedCertificationCoursesCertifCourseIds.push(id);

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('partner-certifications').delete();
    await knex('assessment-results').delete();
    await knex('assessments').delete();
    await knex('certification-courses').delete();
    return knex('sessions').delete();
  });

  describe('#hasVerificationCode', () => {

    it('should return false if certificate does not have a verificationCode', async () => {
      // given
      const { certificationCourse } = _buildValidatedPublishedCertificationData({ verificationCode: null, certificationCenterId, certificationCenter, userId, type, pixScore });
      await databaseBuilder.commit();
      // when
      const result = await certificationRepository.hasVerificationCode(certificationCourse.id);

      // then
      expect(result).to.be.false;
    });

    it('should return true if certificate has a verificationCode', async () => {
      // given
      const { certificationCourse } = _buildValidatedPublishedCertificationData({ verificationCode: 'P-888BBBDD', certificationCenterId, certificationCenter, userId, type, pixScore });
      await databaseBuilder.commit();
      // when
      const result = await certificationRepository.hasVerificationCode(certificationCourse.id);

      // then
      expect(result).to.be.true;
    });
  });

  describe('#saveVerificationCode', () => {

    it('should save verification code', async () => {
      // given
      const { certificationCourse } = _buildValidatedPublishedCertificationData({ verificationCode: null, certificationCenterId, certificationCenter, userId, type, pixScore });
      await databaseBuilder.commit();
      const verificationCode = 'P-XXXXXXXX';

      // when
      await certificationRepository.saveVerificationCode(certificationCourse.id, verificationCode);

      // then
      const savedCertificationCourse = await CertificationCourseBookshelf.where({ id: certificationCourse.id }).fetch({ columns: 'verificationCode' });
      expect(savedCertificationCourse.attributes.verificationCode).to.equal(verificationCode);
    });
  });

  describe('#publishCertificationCoursesBySessionId', () => {

    it('should flag the specified certifications as published', async () => {
      await certificationRepository.publishCertificationCoursesBySessionId(sessionLatestAssessmentRejected.id);
      await Promise.all(sessionLatestAssessmentRejectedCertifCourseIds.map(async (id) => {
        const certifCourse = await get(id);
        expect(certifCourse.isPublished).to.be.true;
      }));
    });

    it('should not flag the specified certifications as published and be rejected', async () => {
      const result = await catchErr(certificationRepository.publishCertificationCoursesBySessionId.bind(certificationRepository))(sessionWithStartedAndError.id);
      // then
      expect(result).to.be.instanceOf(CertificationCourseNotPublishableError);

      await Promise.all(sessionWithStartedAndErrorCertifCourseIds.map(async (id) => expect((await get(id)).isPublished).to.be.false));
    });

    it('does nothing when there are no certification courses', async () => {
      // given
      const sessionWithNoCertificationCourses = databaseBuilder.factory.buildSession({
        certificationCenterId,
        certificationCenter,
        finalizedAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const publicationPromise = certificationRepository.publishCertificationCoursesBySessionId(sessionWithNoCertificationCourses.id);

      // then
      await expect(publicationPromise).not.to.be.rejected;
    });
  });

  describe('#unpublishCertificationCoursesBySessionId', () => {

    it('should update the specified certifications', async () => {
      await certificationRepository.unpublishCertificationCoursesBySessionId(sessionWithPublishedCertificationCourses.id);
      await Promise.all(sessionWithPublishedCertificationCoursesCertifCourseIds.map(async (id) => {
        const certifCourse = await get(id);
        expect(certifCourse.isPublished).to.be.false;
      }));
    });
  });

  describe('#getCertificationAttestation', () => {

    it('should return a certification attestation for a given certification', async () => {
      // when
      const certificationAttestation = await certificationRepository.getCertificationAttestation({ id: completeCertificationCourse.id });

      // then
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestation.pixScore).to.equal(pixScore);
      expect(certificationAttestation.firsName).to.equal(userId.firstName);
    });
  });

  function createPublishedCertifCourseWithAssessementResults(sessionId, ...assessmentResults) {
    const { id: certifCourseId } = databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: true });
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

function _buildValidatedPublishedCertificationData({ certificationCenterId, certificationCenter, verificationCode, userId, type, pixScore }) {
  return _buildCertificationData({ certificationCenterId, certificationCenter, isPublished: true, status: status.VALIDATED, verificationCode, userId, type, pixScore });
}

function _buildCertificationData({ isPublished, status, verificationCode, certificationCenterId, certificationCenter, userId, type, pixScore }) {
  const session = databaseBuilder.factory.buildSession({
    certificationCenterId,
    certificationCenter,
    publishedAt: new Date('2020-02-21T14:23:56Z'),
  });

  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId: session.id,
    isPublished,
    verificationCode,
  });
  const assessment = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationCourse.id,
    userId,
    type,
  });
  const assessmentResult = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment.id, pixScore, status });
  return { session, certificationCourse, assessmentResult };
}
