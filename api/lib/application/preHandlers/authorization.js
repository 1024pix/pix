import { NotFoundError } from '../http-errors.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as sessionRepository from '../../infrastructure/repositories/sessions/session-repository.js';

module.exports.verifySessionAuthorization = async (request, h, dependencies = { sessionRepository }) => {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.id;

  return await _isAuthorizedToAccessSession({ userId, sessionId, sessionRepository: dependencies.sessionRepository });
};

module.exports.verifyCertificationSessionAuthorization = async (
  request,
  h,
  dependencies = { sessionRepository, certificationCourseRepository }
) => {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.id;

  const certificationCourse = await dependencies.certificationCourseRepository.get(certificationCourseId);

  return await _isAuthorizedToAccessSession({
    userId,
    sessionId: certificationCourse.getSessionId(),
    sessionRepository: dependencies.sessionRepository,
  });
};
export { verifySessionAuthorization, verifyCertificationSessionAuthorization };

async function _isAuthorizedToAccessSession({ userId, sessionId, sessionRepository }) {
  const hasMembershipAccess = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
    userId,
    sessionId
  );

  if (!hasMembershipAccess) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  return hasMembershipAccess;
}
