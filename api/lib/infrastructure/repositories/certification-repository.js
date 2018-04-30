const AssessmentResult = require('../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../lib/domain/models/Assessment');

const Certification = require('../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../lib/domain/errors');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');
const AssessmentResultBookshelf = require('../../../lib/infrastructure/data/assessment-result');

function _getDomainModels(certificationCoursesBookshelf) {

  return Promise.all(
    certificationCoursesBookshelf.map(_getDomainModel)
  );
}

function _getDomainModel(certificationCourseBookshelf) {

  return _getAssessmentResults(certificationCourseBookshelf)
    .then((assessmentResults) => {

      return new Certification({
        id: certificationCourseBookshelf.get('id'),
        date: certificationCourseBookshelf.get('completedAt'),
        certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter'),
        isPublished: Boolean(certificationCourseBookshelf.get('isPublished')),
        assessmentState: certificationCourseBookshelf.related('assessment').get('state'),
        assessmentResults: assessmentResults
      });
    });
}

function _getAssessmentResults(certificationCourseBookshelf) {

  return AssessmentResultBookshelf
    .where({
      assessmentId: certificationCourseBookshelf.related('assessment').get('id')
    })
    .fetchAll()
    .then((assessmentResultsBookshelf) => assessmentResultsBookshelf.map(_assessmentResultToDomain));
}

function _assessmentResultToDomain(assessmentResultBookshelf) {

  return new AssessmentResult({
    level: assessmentResultBookshelf.get('level'),
    pixScore: assessmentResultBookshelf.get('pixScore'),
    emitter: assessmentResultBookshelf.get('emitter'),
    status: assessmentResultBookshelf.get('status')
  });
}

module.exports = {

  findCompletedCertificationsByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetchAll({ withRelated: ['session', 'assessment'] })
      .then((certificationCoursesBookshelf) => {

        const certifications = [];

        certificationCoursesBookshelf.forEach((certificationCourseBookshelf) => {
          if (certificationCourseBookshelf.related('assessment').get('state') !== 'completed') {
            return;
          }

          const certification = new Certification({
            id: certificationCourseBookshelf.get('id'),
            date: certificationCourseBookshelf.get('completedAt'),
            certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter')
          });

          certifications.push(certification);
        });

        return Promise.resolve(certifications);
      });
  },

  findCertificationsByUserId(userId) {
    return CertificationCourseBookshelf
      .where({ userId })
      .fetchAll({
        withRelated: [
          'session',
          'assessment'
        ]
      })
      .then(_getDomainModels);
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
