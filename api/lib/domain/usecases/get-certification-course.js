const { UserNotAuthorizedToGetCertificationCoursesError } = require('../../../lib/domain/errors');

module.exports = async function getCertificationCourse({
  userId,
  certificationCourseId,
  certificationCourseRepository,
  userRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (!certificationCourse.doesBelongTo(userId)) {
    const userIsSuperAdmin = await userRepository.isSuperAdmin(userId);
    if (!userIsSuperAdmin) {
      throw new UserNotAuthorizedToGetCertificationCoursesError();
    }
  }

  return certificationCourse;
};
