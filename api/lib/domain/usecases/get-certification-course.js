const { UserNotAuthorizedToGetCertificationCoursesError } = require('../../../lib/domain/errors');

module.exports = async function getCertificationCourse({
  userId,
  certificationCourseId,
  certificationCourseRepository,
  userRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (!certificationCourse.doesBelongTo(userId)) {
    const userIsPixMaster = await userRepository.isPixMaster(userId);
    if (!userIsPixMaster) {
      throw new UserNotAuthorizedToGetCertificationCoursesError();
    }
  }

  return certificationCourse;
};
