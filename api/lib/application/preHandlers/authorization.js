import { NotFoundError } from '../http-errors.js';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as sessionRepository from '../../../src/certification/session/infrastructure/repositories/session-repository.js';

const verifySessionAuthorization = async (request, h, dependencies = { sessionRepository }) => {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.id;

  return await _isAuthorizedToAccessSession({ userId, sessionId, sessionRepository: dependencies.sessionRepository });
};

const verifyCertificationSessionAuthorization = async (
  request,
  h,
  dependencies = { sessionRepository, certificationCourseRepository },
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

const authorization = { verifySessionAuthorization, verifyCertificationSessionAuthorization };

export { authorization, verifySessionAuthorization, verifyCertificationSessionAuthorization };

async function _isAuthorizedToAccessSession({ userId, sessionId, sessionRepository }) {
  const hasMembershipAccess = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
    userId,
    sessionId,
  );

  if (!hasMembershipAccess) {
    throw new NotFoundError(
      "Session does not exist or it's access is restricted.",
      'SESSION_DOES_NOT_EXIST_OR_ACCESS_RESTRICTED',
    );
  }

  return hasMembershipAccess;
}
