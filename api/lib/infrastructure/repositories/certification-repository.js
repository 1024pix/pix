const AssessmentResultBookshelf = require('../data/assessment-result');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../lib/domain/errors');

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

  getCertification({ id }) {
    return CertificationCourseBookshelf
      .where({ id })
      .fetch({
        require: true,
        withRelated: [
          'session',
          'assessment',
          'assessment.assessmentResults',
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

  findCertificationsByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetchAll({
        withRelated: [
          'session',
          'assessment',
          'assessment.assessmentResults',
        ],
      })
      .then((certificationCoursesBookshelf) => {
        return certificationCoursesBookshelf.map(_certificationToDomain);
      });
  },

  updateCertification({ id, attributes }) {
    return CertificationCourseBookshelf
      .where({ id })
      .save(attributes, {
        patch: true,
        method: 'update',
        require: true,
      })
      .then(() => {
        return CertificationCourseBookshelf
          .where({ id })
          .fetch({
            withRelated: [
              'session',
              'assessment',
              'assessment.assessmentResults',
            ],
          });
      })
      .then(_certificationToDomain)
      .catch((err) => {
        if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
          throw new NotFoundError(`Not found certification for ID ${id}`);
        } else {
          throw err;
        }
      });
  },
};
