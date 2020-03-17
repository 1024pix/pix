const Assessment = require('../../domain/models/Assessment');
const AssessmentResultBookshelf = require('../data/assessment-result');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError, CertificationCourseNotPublishableError } = require('../../../lib/domain/errors');

function _certificationToDomain(certificationCourseBookshelf) {
  const assessmentResultsBookshelf = certificationCourseBookshelf
    .related('assessment')
    .related('assessmentResults');
  const assessmentResults = bookshelfToDomainConverter.buildDomainObjects(AssessmentResultBookshelf, assessmentResultsBookshelf);

  return _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults });
}

function _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults }) {
  return new Certification({
    id: certificationCourseBookshelf.get('id'),
    assessmentState: certificationCourseBookshelf.related('assessment').get('state'),
    assessmentResults: assessmentResults,
    certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter'),
    birthdate: certificationCourseBookshelf.get('birthdate'),
    birthplace: certificationCourseBookshelf.get('birthplace'),
    firstName: certificationCourseBookshelf.get('firstName'),
    lastName: certificationCourseBookshelf.get('lastName'),
    date: certificationCourseBookshelf.get('completedAt'),
    isPublished: Boolean(certificationCourseBookshelf.get('isPublished')),
    userId: certificationCourseBookshelf.get('userId'),
  });
}

module.exports = {

  getByCertificationCourseId({ id }) {
    return CertificationCourseBookshelf
      .query((qb) => {
        qb.innerJoin(
          Bookshelf.knex.raw('?? ON ?? = ??',
            ['assessments', 'assessments.certificationCourseId', 'certification-courses.id'])
        );
        qb.where('certification-courses.id', id);
        qb.where('assessments.state', Assessment.states.COMPLETED);
      })
      .fetch({
        require: true,
        withRelated: [
          'session', 'assessment', 'assessment.assessmentResults',
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

  getAssessmentResultsStatusesBySessionId(id) {
    return CertificationCourseBookshelf
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
      .fetchAll({ columns: ['status'] })
      .then((collection) => collection.map((obj) => obj.attributes.status)
      );
  },

  findByUserId(userId) {
    return CertificationCourseBookshelf
      .query((qb) => {
        qb.innerJoin(
          Bookshelf.knex.raw('?? ON ?? = ??',
            ['assessments', 'assessments.certificationCourseId', 'certification-courses.id'])
        );
        qb.where('certification-courses.userId', userId);
        qb.where('assessments.state', Assessment.states.COMPLETED);
        qb.orderBy('id', 'desc');
      })
      .fetchAll({
        required: false,
        withRelated: [
          'session', 'assessment', 'assessment.assessmentResults',
        ],
      })
      .then((certificationCoursesBookshelf) => {
        return certificationCoursesBookshelf.map(_certificationToDomain);
      });
  },

  updatePublicationStatus({ id, isPublished }) {
    return CertificationCourseBookshelf
      .where({ id })
      .save({ isPublished }, {
        patch: true,
        method: 'update',
        require: true,
      })
      .catch((err) => {
        if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
          throw new NotFoundError(`Not found certification for ID ${id}`);
        } else {
          throw err;
        }
      })
      .then(() => {
        return module.exports.getByCertificationCourseId({ id });
      });
  },

  updatePublicationStatusesBySessionId(sessionId, toPublish) {
    return Bookshelf.transaction(async (trx) => {
      const statuses = await this.getAssessmentResultsStatusesBySessionId(sessionId);
      if (statuses.includes('error') || statuses.includes('started')) {
        throw new CertificationCourseNotPublishableError();
      }
      await CertificationCourseBookshelf
        .where({ sessionId })
        .save({ isPublished: toPublish },{ patch: true, transacting: trx });
    });
  }
};
