const { UserNotAuthorizedToGetSessionCertificationCoursesError } = require('../errors');

module.exports = async function findCertificationCourses({ userId, sessionId, certificationCourseRepository, sessionRepository, userRepository }) {
  const [ user, session ] = await Promise.all([
    userRepository.getWithCertificationCenterMemberships(userId),
    sessionRepository.get(sessionId)
  ]);
  if (!user.hasAccessToCertificationCenter(session.certificationCenterId)) {
    throw new UserNotAuthorizedToGetSessionCertificationCoursesError('Cet utilisateur n\'a pas accès à la liste des participants de cette session');
  }
  return certificationCourseRepository.find(sessionId);
};
