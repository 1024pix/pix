const { SessionStartedDeletionError } = require('../errors.js');

module.exports = async function deleteSession({ sessionId, sessionRepository, certificationCourseRepository }) {
  if (await _isSessionStarted(certificationCourseRepository, sessionId)) {
    throw new SessionStartedDeletionError();
  }

  await sessionRepository.delete(sessionId);
};

async function _isSessionStarted(certificationCourseRepository, sessionId) {
  const foundCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  return foundCertificationCourses.length > 0;
}
