const { expect, domainBuilder, databaseBuilder, catchErr, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { status } = require('../../../../lib/domain/models/AssessmentResult');
const ShareableCertificate = require('../../../../lib/domain/models/ShareableCertificate');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');

const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');
const PARTNER_CLEA_KEY = 'BANANA';
const verificationCode = 'P-123498NN';
const notPublishedSessionVerificationCode = 'P-123498XX';
const rejectedSessionVerificationCode = 'P-123498ZZ';

describe('Integration | Repository | Certification ', () => {

  const pixScore = 400;

  let userId;
  let completeSession;
  let completeCertificationCourse;
  let completeAssessmentResult;
  let expectedCertification;
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
    ({ session: completeSession, certificationCourse: completeCertificationCourse, assessmentResult: completeAssessmentResult }
      = _buildValidatedPublishedCertificationData({ verificationCode, certificationCenterId, certificationCenter, userId, type, pixScore }));

    expectedCertification = _buildPrivateCertificate(certificationCenter, completeCertificationCourse, completeAssessmentResult, completeSession.publishedAt);
    databaseBuilder.factory.buildPartnerCertification({ certificationCourseId: expectedCertification.id, partnerKey: PARTNER_CLEA_KEY, acquired: false });

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

  describe('#getByCertificationCourseId', () => {

    it('should return a certification with needed informations', async () => {
      // when
      const certificate = await certificationRepository.getPrivateCertificateByCertificationCourseId({ id: completeCertificationCourse.id });

      // then
      expect(certificate).to.deep.equal(expectedCertification);
    });

    it('should return a not found error when certification does not exist', async () => {
      // when
      const result = await catchErr(certificationRepository.getPrivateCertificateByCertificationCourseId)({ id: -1 });

      // then
      expect(result).to.be.instanceOf(NotFoundError);
    });
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

  describe('#findByUserId', () => {
    let expectedCertifications;

    beforeEach(() => {
      // Without assessment
      databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: completeSession.id });
      // Without assessment-result
      const withoutAsrCcId = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: completeSession.id }).id;
      databaseBuilder.factory.buildAssessment({ userId, certificationCourseId: withoutAsrCcId });
      // Ok
      const certificationCourse1 = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: completeSession.id });
      const assessment1 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse1.id,
        userId,
        type,
        state: 'started',
      });
      const assessmentResult1 = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment1.id });
      const certificationCourse2 = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId: completeSession.id });
      const assessment2 = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse2.id,
        userId,
        type,
        state: 'completed',
      });
      const assessmentResult2 = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment2.id });
      expectedCertifications = [
        _buildPrivateCertificate(completeSession.certificationCenter, certificationCourse1, assessmentResult1, completeSession.publishedAt),
        _buildPrivateCertificate(completeSession.certificationCenter, certificationCourse2, assessmentResult2, completeSession.publishedAt),
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

  describe('#getCertificationByVerificationCode', () => {

    context('when verificationCode match', () => {
      it('should return a certification when a correct verificationCode matches a correct pixScore', async () => {
        // when
        const certificate = await certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });

        // then
        expect(certificate).to.be.instanceOf(ShareableCertificate);
      });
    });

    context('when verificationCode match a not published certificate', () => {
      it('should throw an error', async () => {
        // given
        _buildNotPublishedCertificationData({ verificationCode: notPublishedSessionVerificationCode, certificationCenterId, certificationCenter, userId, type, pixScore });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationRepository.getShareableCertificateByVerificationCode)({ verificationCode: notPublishedSessionVerificationCode });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when verificationCode match an rejected certificate', () => {
      it('should throw an error', async () => {
        // given
        _buildRejectedCertificationData({ verificationCode: rejectedSessionVerificationCode, certificationCenterId, certificationCenter, userId, type, pixScore });
        await databaseBuilder.commit();
        // when
        const error = await catchErr(certificationRepository.getShareableCertificateByVerificationCode)({ verificationCode: rejectedSessionVerificationCode });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when verificationCode does not match', () => {
      it('should throw an error', async () => {
        //given
        const wrongVerificationCode = 'P-BBBCCC$$';

        // when
        const error = await catchErr(certificationRepository.getShareableCertificateByVerificationCode)({ verificationCode: wrongVerificationCode });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getCertificationAttestation', () => {

    it('should return a certification attestation for a given certification', async () => {
      // when
      const certificationAttestation = await certificationRepository.getCertificationAttestation({ id: completeCertificationCourse.id });

      // then
      expect(certificationAttestation).to.be.instanceOf(CertificationAttestation);
      expect(certificationAttestation.pixScore).to.equal(pixScore);
      expect(certificationAttestation.firstName).to.equal(completeCertificationCourse.firstName);
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

function _buildNotPublishedCertificationData({ certificationCenterId, certificationCenter, verificationCode, userId, type, pixScore }) {
  return _buildCertificationData({ certificationCenterId, certificationCenter, isPublished: false, status: status.VALIDATED, verificationCode, userId, type, pixScore });
}

function _buildRejectedCertificationData({ certificationCenterId, certificationCenter, verificationCode, userId, type, pixScore }) {
  return _buildCertificationData({ certificationCenterId, certificationCenter, isPublished: true, status: status.REJECTED, verificationCode, userId, type, pixScore });
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

function _buildPrivateCertificate(certificationCenterName, certificationCourse, assessmentResult, deliveredAt) {
  const certificate = domainBuilder.buildPrivateCertificate({
    id: certificationCourse.id,
    birthdate: certificationCourse.birthdate,
    birthplace: certificationCourse.birthplace,
    certificationCenter: certificationCenterName,
    date: certificationCourse.createdAt,
    firstName: certificationCourse.firstName,
    lastName: certificationCourse.lastName,
    deliveredAt,
    isPublished: certificationCourse.isPublished,
    pixScore: assessmentResult.pixScore,
    status: assessmentResult.status,
    commentForCandidate: assessmentResult.commentForCandidate,
    userId: certificationCourse.userId,
    verificationCode: certificationCourse.verificationCode,
  });
  certificate.cleaCertificationResult = undefined;
  return certificate;
}
