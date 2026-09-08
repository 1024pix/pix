import { NotFoundError } from '../../../../shared/application/errors/http-errors.js';
import * as sessionRepository from '../../../session-management/infrastructure/repositories/session-management-repository.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';

export function verifySessionAuthorization(request, h, dependencies = { sessionRepository }) {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.sessionId;

  return _isAuthorizedToAccessSession({
    userId,
    sessionId,
    sessionRepository: dependencies.sessionRepository,
  });
}

export async function verifyCertificationSessionAuthorization(
  request,
  h,
  dependencies = { sessionRepository, certificationCourseRepository },
) {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;

  const sessionId = await dependencies.certificationCourseRepository.getSessionId({ id: certificationCourseId });

  return _isAuthorizedToAccessSession({
    userId,
    sessionId,
    sessionRepository: dependencies.sessionRepository,
  });
}

export const authorization = { verifySessionAuthorization, verifyCertificationSessionAuthorization };

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
