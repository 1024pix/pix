const bluebird = require('bluebird');
const AssessmentResultBookshelf = require('../data/assessment-result');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const PrivateCertificate = require('../../domain/models/PrivateCertificate');
const ShareableCertificate = require('../../domain/models/ShareableCertificate');
const CertificationAttestation = require('../../domain/models/CertificationAttestation');
const { status: assessmentStatus } = require('../../domain/models/AssessmentResult');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');

async function getAssessmentResultsStatusesBySessionId(id) {
  const collection = await CertificationCourseBookshelf
    .query((qb) => {
      qb.innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id');
      qb.innerJoin(
        Bookshelf.knex.raw(
          `"assessment-results" ar ON ar."assessmentId" = "assessments".id
                    and ar."createdAt" = (select max(sar."createdAt") from "assessment-results" sar where sar."assessmentId" = "assessments".id)`,
        ),
      );
      qb.where({ 'certification-courses.sessionId': id });
    })
    .fetchAll({ columns: ['status'] });

  return collection.map((obj) => obj.attributes.status);
}

async function _getLatestAssessmentResult(certificationCourseId) {
  const latestAssessmentResultBookshelf = await AssessmentResultBookshelf
    .query((qb) => {
      qb.join('assessments', 'assessments.id', 'assessment-results.assessmentId');
      qb.where('assessments.certificationCourseId', '=', certificationCourseId);
    })
    .orderBy('createdAt', 'desc')
    .fetch();

  return bookshelfToDomainConverter.buildDomainObject(AssessmentResultBookshelf, latestAssessmentResultBookshelf);
}

function _getBaseCertificationQuery() {
  return Bookshelf.knex
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      isPublished: 'certification-courses.isPublished',
      isCancelled: 'certification-courses.isCancelled',
      userId: 'certification-courses.userId',
      date: 'certification-courses.createdAt',
      verificationCode: 'certification-courses.verificationCode',
      deliveredAt: 'sessions.publishedAt',
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId');
}

function getNotFoundErrorMessage(id) {
  return `Certification attestation not found for ID ${id}`;
}

function getStatus(certification, assessmentResult) {
  return certification.isCancelled ?
    PrivateCertificate.status.CANCELLED : assessmentResult?.status;
}

module.exports = {

  async findByUserId(userId) {
    const results = await _getBaseCertificationQuery()
      .where('certification-courses.userId', '=', userId)
      .orderBy('id', 'desc');

    return bluebird.mapSeries(results, async (result) => {
      const latestAssessmentResult = await _getLatestAssessmentResult(result.id);

      return new PrivateCertificate({
        ...result,
        pixScore: latestAssessmentResult?.pixScore,
        status: getStatus(result, latestAssessmentResult),
        commentForCandidate: latestAssessmentResult && latestAssessmentResult.commentForCandidate,
      });
    });
  },

  async publishCertificationCoursesBySessionId(sessionId) {
    const statuses = await getAssessmentResultsStatusesBySessionId(sessionId);
    if (statuses.includes('error') || statuses.includes('started')) {
      throw new CertificationCourseNotPublishableError();
    }
    await CertificationCourseBookshelf
      .where({ sessionId })
      .save({ isPublished: true }, { method: 'update', require: false });
  },

  async unpublishCertificationCoursesBySessionId(sessionId) {
    await CertificationCourseBookshelf
      .where({ sessionId })
      .save({ isPublished: false }, { method: 'update' });
  },

  async hasVerificationCode(id) {
    const certification = await CertificationCourseBookshelf
      .where({ id })
      .fetch({ require: false, columns: 'verificationCode' });

    return Boolean(certification.attributes.verificationCode);
  },

  async saveVerificationCode(id, verificationCode) {
    return CertificationCourseBookshelf
      .where({ id })
      .save({ verificationCode }, { method: 'update' });
  },

  async getPrivateCertificateByCertificationCourseId({ id }) {
    const certificationCourseDTO = await _getBaseCertificationQuery()
      .where('certification-courses.id', '=', id)
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`Not found certification for ID ${id}`);
    }

    const latestAssessmentResult = await _getLatestAssessmentResult(certificationCourseDTO.id);

    return new PrivateCertificate({
      ...certificationCourseDTO,
      pixScore: latestAssessmentResult && latestAssessmentResult.pixScore,
      status: getStatus(certificationCourseDTO, latestAssessmentResult),
      commentForCandidate: latestAssessmentResult && latestAssessmentResult.commentForCandidate,
    });
  },

  async getShareableCertificateByVerificationCode({ verificationCode }) {
    const certificationCourseDTO = await _getBaseCertificationQuery()
      .where({ verificationCode, 'isPublished': true })
      .first();
    const notFoundError = new NotFoundError('There is no certification course with this verification code');

    if (!certificationCourseDTO) {
      throw notFoundError;
    }

    const latestAssessmentResult = await _getLatestAssessmentResult(certificationCourseDTO.id);
    if (!latestAssessmentResult || latestAssessmentResult.status !== assessmentStatus.VALIDATED) {
      throw notFoundError;
    }

    return new ShareableCertificate({
      ...certificationCourseDTO,
      pixScore: latestAssessmentResult.pixScore,
      status: latestAssessmentResult.status,
    });
  },

  async getCertificationAttestation({ id }) {
    const certificationCourseDTO = await _getBaseCertificationQuery()
      .where('certification-courses.id', '=', id)
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(getNotFoundErrorMessage(id));
    }

    const latestAssessmentResult = await _getLatestAssessmentResult(certificationCourseDTO.id);
    if (!latestAssessmentResult) {
      throw new NotFoundError(getNotFoundErrorMessage(id));
    }

    return new CertificationAttestation({
      ...certificationCourseDTO,
      pixScore: latestAssessmentResult.pixScore,
      status: latestAssessmentResult.status,
    });
  },
};
