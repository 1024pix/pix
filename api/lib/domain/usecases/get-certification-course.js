const { UserNotAuthorizedToGetCertificationCoursesError } = require('../../../lib/domain/errors');

module.exports = async function getCertificationCourse({
  userId,
  certificationCourseId,
  certificationCourseRepository,
  userRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  if (!certificationCourse.doesBelongTo(userId)) {
    const isSuperAdmin = await userRepository.isSuperAdmin(userId);
    const isSupport = await userRepository.isSupport(userId);
    const isCertif = await userRepository.isCertif(userId);
    const isMetier = await userRepository.isMetier(userId);
    const hasRights = isSuperAdmin || isSupport || isCertif || isMetier;
    if (!hasRights) {
      throw new UserNotAuthorizedToGetCertificationCoursesError();
    }
  }

  return certificationCourse;
};
