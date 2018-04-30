const AssessmentResult = require('../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../lib/domain/models/Assessment');

const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../lib/domain/errors');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');

function _assessmentResultToDomain(assessmentResultBookshelf) {
  return new AssessmentResult({
    level: assessmentResultBookshelf.get('level'),
    pixScore: assessmentResultBookshelf.get('pixScore'),
    status: assessmentResultBookshelf.get('status')
  });
}

function _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults }) {
  return new Certification({
    id: certificationCourseBookshelf.get('id'),
    date: certificationCourseBookshelf.get('completedAt'),
    certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter'),
    isPublished: Boolean(certificationCourseBookshelf.get('isPublished')),
    assessmentState: certificationCourseBookshelf.related('assessment').get('state'),
    assessmentResults: assessmentResults
  });
}

module.exports = {
  findCertificationsByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetchAll({
        withRelated: [
          'session',
          'assessment',
          'assessment.assessmentResults'
        ]
      })
      .then((certificationCoursesBookshelf) => {
        return certificationCoursesBookshelf.map((certificationCourseBookshelf) => {
          const assessmentResultsBookshelf = certificationCourseBookshelf
            .related('assessment')
            .related('assessmentResults');

          const assessmentResults = assessmentResultsBookshelf.map(_assessmentResultToDomain);

          return _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults });
        });
      });
  },

  updateCertification({ id, attributes }) {
    return CertificationCourseBookshelf
      .where({ id })
      .save(attributes, {
        patch: true,
        method: 'update',
        require: true
      })
      .catch(err => {
        if (err instanceof CertificationCourseBookshelf.NoRowsUpdatedError) {
          throw new NotFoundError(`Not found certification for ID ${id}`);
        } else {
          throw err;
        }
      });
  }
};
