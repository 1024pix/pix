const bluebird = require('bluebird');
const AssessmentResultBookshelf = require('../data/assessment-result');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');
const CertificationPartnerAcquisitionBookshelf = require('../../../lib/infrastructure/data/certification-partner-acquisition');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');

async function getAssessmentResultsStatusesBySessionId(id) {
  const collection = await CertificationCourseBookshelf
    .query((qb) => {
      qb.innerJoin('assessments','assessments.certificationCourseId','certification-courses.id');
      qb.innerJoin(
        Bookshelf.knex.raw(
          `"assessment-results" ar ON ar."assessmentId" = "assessments".id
                    and ar."createdAt" = (select max(sar."createdAt") from "assessment-results" sar where sar."assessmentId" = "assessments".id)`
        )
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
    .fetch({ require: true });

  return bookshelfToDomainConverter.buildDomainObject(AssessmentResultBookshelf, latestAssessmentResultBookshelf);
}

async function _findAcquiredPartnerCertifications(certificationCourseId) {
  const acquiredPartnerCertificationsBookshelf = await CertificationPartnerAcquisitionBookshelf
    .where({ certificationCourseId })
    .fetchAll();

  return bookshelfToDomainConverter.buildDomainObjects(CertificationPartnerAcquisitionBookshelf, acquiredPartnerCertificationsBookshelf);
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
      userId: 'certification-courses.userId',
      date: 'certification-courses.createdAt',
      certificationCenter: 'sessions.certificationCenter',
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId');
}

module.exports = {

  async getByCertificationCourseId({ id }) {
    const results = await _getBaseCertificationQuery()
      .where('certification-courses.id', '=', id)
      .limit(1);
    if (!results[0]) {
      throw new NotFoundError(`Not found certification for ID ${id}`);
    }
    const latestAssessmentResult = await _getLatestAssessmentResult(id);
    const acquiredPartnerCertifications = await _findAcquiredPartnerCertifications(id);

    return new Certification({
      ...results[0],
      pixScore: latestAssessmentResult && latestAssessmentResult.pixScore,
      status: latestAssessmentResult && latestAssessmentResult.status,
      commentForCandidate: latestAssessmentResult && latestAssessmentResult.commentForCandidate,
      acquiredPartnerCertifications,
    });
  },

  async findByUserId(userId) {
    const results = await _getBaseCertificationQuery()
      .where('certification-courses.userId', '=', userId)
      .orderBy('id', 'desc');

    return bluebird.mapSeries(results, async (result) => {
      const latestAssessmentResult = await _getLatestAssessmentResult(result.id);

      return new Certification({
        ...result,
        pixScore: latestAssessmentResult && latestAssessmentResult.pixScore,
        status: latestAssessmentResult && latestAssessmentResult.status,
        commentForCandidate: latestAssessmentResult && latestAssessmentResult.commentForCandidate,
      });
    });
  },

  async updatePublicationStatusesBySessionId(sessionId, toPublish) {
    const statuses = await getAssessmentResultsStatusesBySessionId(sessionId);
    if (statuses.includes('error') || statuses.includes('started')) {
      throw new CertificationCourseNotPublishableError();
    }
    await CertificationCourseBookshelf
      .where({ sessionId })
      .save({ isPublished: toPublish }, { method: 'update' });
  }
};
