const { UserNotAuthorizedToGetCertificationCoursesError } = require('../../../lib/domain/errors');

module.exports = async function getCertificationCourse({ userId, certificationCourseId, certificationCourseRepository }) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (userId !== certificationCourse.userId) {
    throw new UserNotAuthorizedToGetCertificationCoursesError();
  }

  return certificationCourse;
};
