const AssessmentResult = require('../../../lib/domain/models/AssessmentResult');
const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../lib/domain/errors');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');

function _assessmentResultToDomain(assessmentResultBookshelf) {
  return new AssessmentResult({
    id: assessmentResultBookshelf.get('id'),
    commentForCandidate: assessmentResultBookshelf.get('commentForCandidate'),
    commentForJury: assessmentResultBookshelf.get('commentForJury'),
    commentForOrganization: assessmentResultBookshelf.get('commentForOrganization'),
    createdAt: assessmentResultBookshelf.get('createdAt'),
    emitter: assessmentResultBookshelf.get('emitter'),
    level: assessmentResultBookshelf.get('level'),
    juryId: assessmentResultBookshelf.get('juryId'),
    pixScore: assessmentResultBookshelf.get('pixScore'),
    status: assessmentResultBookshelf.get('status')
  });
}

function _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults }) {
  return new Certification({
    id: certificationCourseBookshelf.get('id'),
    assessmentState: certificationCourseBookshelf.related('assessment').get('state'),
    assessmentResults: assessmentResults,
    certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter'),
    date: certificationCourseBookshelf.get('completedAt'),
    isPublished: Boolean(certificationCourseBookshelf.get('isPublished'))
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
      .then(() => {
        return CertificationCourseBookshelf
          .where({ id })
          .fetch({
            withRelated: [
              'session',
              'assessment',
              'assessment.assessmentResults'
            ]
          });
      })
      .then((certificationCourseBookshelf) => {
        const assessmentResultsBookshelf = certificationCourseBookshelf
          .related('assessment')
          .related('assessmentResults');

        const assessmentResults = assessmentResultsBookshelf.map(_assessmentResultToDomain);

        return _createCertificationDomainModel({ certificationCourseBookshelf, assessmentResults });
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
