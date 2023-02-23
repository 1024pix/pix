const { NotFoundError } = require('../http-errors.js');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository.js');

module.exports.verifySessionAuthorization = async (request) => {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.id;

  return await _isAuthorizedToAccessSession({ userId, sessionId });
};

module.exports.verifyCertificationSessionAuthorization = async (request) => {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.id;

  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);

  return await _isAuthorizedToAccessSession({ userId, sessionId: certificationCourse.getSessionId() });
};

async function _isAuthorizedToAccessSession({ userId, sessionId }) {
  const hasMembershipAccess = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
    userId,
    sessionId
  );

  if (!hasMembershipAccess) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  return hasMembershipAccess;
}
