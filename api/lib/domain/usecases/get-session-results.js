const { getCertificationResultByCertifCourse } = require('../../domain/services/certification-service');

module.exports = async function getSessionResults({
  sessionId,
  sessionRepository,
  certificationCourseRepository,
}) {
  const session = await sessionRepository.get(sessionId);
  const allCertificationCoursesInSession = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId });

  const certificationResults = await Promise.all(allCertificationCoursesInSession.map(
    (certificationCourse) => getCertificationResultByCertifCourse({ certificationCourse }),
  ));

  return { session, certificationResults };
};
