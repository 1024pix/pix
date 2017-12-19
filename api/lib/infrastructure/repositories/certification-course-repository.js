const CertificationCourseBookshelf = require('../../domain/models/data/certification-course');
const AssessmentBookshelf = require('../../domain/models/data/assessment');
const CertificationCourse = require('../../domain/models/CertificationCourse');

function _toDomain(model) {
  return new CertificationCourse({
    id: model.get('id'),
    userId: model.get('userId'),
    status: model.get('status')
  });
}

module.exports = {

  save(certificationCourseDomainModel) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourseDomainModel);
    return certificationCourseBookshelf.save()
      .then(_toDomain);
  },

  updateStatus(status, certificationCourseId) {
    const certificationCourseBookshelf = new CertificationCourseBookshelf({ id: certificationCourseId, status });
    return certificationCourseBookshelf.save();
  },

  get(id) {
    let certificationCourse;
    const getCertificationCoursePromise = CertificationCourseBookshelf
      .where({ id })
      .fetch()
      .then(_toDomain);

    return getCertificationCoursePromise
      .then((foundCertificationCourse) => {
        certificationCourse = foundCertificationCourse;
        return AssessmentBookshelf.where({ courseId: id, userId: certificationCourse.userId }).fetch();
      }).then((assessment) => {
        certificationCourse.assessment = assessment.toJSON();
        return certificationCourse;
      });
  }

};
