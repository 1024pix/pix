import { NotFoundError } from '../http-errors';
import certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository';
import sessionRepository from '../../infrastructure/repositories/sessions/session-repository';

export const verifySessionAuthorization = async (request) => {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.id;

  return await _isAuthorizedToAccessSession({ userId, sessionId });
};

export const verifyCertificationSessionAuthorization = async (request) => {
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
