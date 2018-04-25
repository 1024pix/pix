const Certification = require('../../../lib/domain/models/Certification');
const CertificationCourseBookshelf = require('../../../lib/infrastructure/data/certification-course');

function _toDomain(certificationCourseBookshelf) {
  return new Certification({
    id: certificationCourseBookshelf.get('id'),
    date: certificationCourseBookshelf.get('completedAt'),
    certificationCenter: certificationCourseBookshelf.related('session').get('certificationCenter')
  });
}

module.exports = {

  findCompletedCertificationsByUserId(userId) {
    return CertificationCourseBookshelf
      .query((qb) => {
        qb.innerJoin('assessments', 'certification-courses.id', 'assessments.courseId');
        qb.where('assessments.state', '=', 'completed');
        qb.where('certification-courses.userId', '=', userId);
      })
      .fetchAll({ withRelated: ['session', 'assessment'] })
      .then((certificationCoursesBookshelf) => {
        return certificationCoursesBookshelf.map(_toDomain);
      });
  }
};
