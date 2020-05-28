const AssessmentResultBookshelf = require('../data/assessment-result');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');
const CertificationPartnerAcquisitionBookshelf = require('../../../lib/infrastructure/data/certification-partner-acquisition');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');

function _certificationToDomain(certificationCourseBookshelf) {
  const assessmentResultsBookshelf = certificationCourseBookshelf
    .related('assessment')
    .related('assessmentResults');
  const assessmentResults = bookshelfToDomainConverter.buildDomainObjects(AssessmentResultBookshelf, assessmentResultsBookshelf);
  const certificationPartnerAcquisitionBookshelf = certificationCourseBookshelf
    .related('acquiredPartnerCertifications');
  const acquiredPartnerCertifications = bookshelfToDomainConverter.buildDomainObjects(CertificationPartnerAcquisitionBookshelf, certificationPartnerAcquisitionBookshelf);
  return _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults, acquiredPartnerCertifications });
}

function _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults, acquiredPartnerCertifications }) {
  return new Certification({
    id: certificationCourseBookshelf.get('id'),
    assessmentState: certificationCourseBookshelf.related('assessment').get('state'),
    certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter'),
    birthdate: certificationCourseBookshelf.get('birthdate'),
    birthplace: certificationCourseBookshelf.get('birthplace'),
    firstName: certificationCourseBookshelf.get('firstName'),
    lastName: certificationCourseBookshelf.get('lastName'),
    date: certificationCourseBookshelf.get('createdAt'),
    isPublished: Boolean(certificationCourseBookshelf.get('isPublished')),
    userId: certificationCourseBookshelf.get('userId'),
    assessmentResults,
    acquiredPartnerCertifications
  });
}

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

module.exports = {

  getByCertificationCourseId({ id }) {
    return CertificationCourseBookshelf
      .query((qb) => {
        qb.innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id');
        qb.leftOuterJoin('certification-partner-acquisitions', 'certification-partner-acquisitions.certificationCourseId', 'certification-courses.id');
        qb.where('certification-courses.id', id);
      })
      .fetch({
        require: true,
        withRelated: [
          'session', 'assessment', 'assessment.assessmentResults', 'acquiredPartnerCertifications',
        ],
      })
      .then(_certificationToDomain)
      .catch((err) => {
        if (err instanceof CertificationCourseBookshelf.NotFoundError) {
          throw new NotFoundError(`Not found certification for ID ${id}`);
        } else {
          throw err;
        }
      });
  },

  findByUserId(userId) {
    return CertificationCourseBookshelf
      .query((qb) => {
        qb.innerJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id');
        qb.innerJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id');
        qb.where('certification-courses.userId', userId);
        qb.groupBy('certification-courses.id');
        qb.orderBy('id', 'desc');
      })
      .fetchAll({
        withRelated: [
          'session', 'assessment', 'assessment.assessmentResults'
        ],
      })
      .then((certificationCoursesBookshelf) => {
        return certificationCoursesBookshelf.map(_certificationToDomain);
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
