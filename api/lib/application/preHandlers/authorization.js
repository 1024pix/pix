import * as sessionRepository from '../../../src/certification/session-management/infrastructure/repositories/session-repository.js';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import { NotFoundError } from '../http-errors.js';

const verifySessionAuthorization = (request, h, dependencies = { sessionRepository }) => {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.id;

  return _isAuthorizedToAccessSession({
    userId,
    sessionId,
    sessionRepository: dependencies.sessionRepository,
  });
};

const verifyCertificationSessionAuthorization = async (
  request,
  h,
  dependencies = { sessionRepository, certificationCourseRepository },
) => {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.id;

  const sessionId = await dependencies.certificationCourseRepository.getSessionId({ id: certificationCourseId });

  return _isAuthorizedToAccessSession({
    userId,
    sessionId,
    sessionRepository: dependencies.sessionRepository,
  });
};

const authorization = { verifySessionAuthorization, verifyCertificationSessionAuthorization };

export { authorization, verifyCertificationSessionAuthorization, verifySessionAuthorization };

async function _isAuthorizedToAccessSession({ userId, sessionId, sessionRepository }) {
  const hasMembershipAccess = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession({
    userId,
    sessionId,
  });

  if (!hasMembershipAccess) {
    throw new NotFoundError(
      "Session does not exist or it's access is restricted.",
      'SESSION_DOES_NOT_EXIST_OR_ACCESS_RESTRICTED',
    );
  }

  return hasMembershipAccess;
}
