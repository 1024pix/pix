import jsonapiSerializer from 'jsonapi-serializer';

import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import * as invigilatorAccessRepository from '../../infrastructure/repositories/invigilator-access-repository.js';
import * as sessionManagementRepository from '../../infrastructure/repositories/session-management-repository.js';

const { Error: JSONAPIError } = jsonapiSerializer;

const FORBIDDEN_ERROR_MESSAGE = 'User is not allowed to access to this resource.';

function _replyForbiddenError(h) {
  const errorHttpStatusCode = 403;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Forbidden access',
    detail: 'Missing or insufficient permissions.',
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

async function checkUserHaveCertificationCenterMembershipForSession(
  request,
  h,
  dependencies = { sessionManagementRepository },
) {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.sessionId;

  try {
    const hasMembershipAccess =
      await dependencies.sessionManagementRepository.doesUserHaveCertificationCenterMembershipForSession({
        userId,
        sessionId,
      });

    if (!hasMembershipAccess) {
      throw new ForbiddenAccess(FORBIDDEN_ERROR_MESSAGE);
    }
    return h.response(true);
  } catch {
    return _replyForbiddenError(h);
  }
}

async function checkUserHaveInvigilatorAccessForSession(request, h, dependencies = { invigilatorAccessRepository }) {
  const { userId } = request.auth.credentials;
  const sessionId = request.params.sessionId;

  try {
    const isInvigilatorForSession = await dependencies.invigilatorAccessRepository.isUserInvigilatorForSession({
      sessionId,
      userId,
    });

    if (!isInvigilatorForSession) {
      throw new ForbiddenAccess(FORBIDDEN_ERROR_MESSAGE);
    }
    return h.response(true);
  } catch {
    return _replyForbiddenError(h);
  }
}

const checkUserHaveInvigilatorAccessForSessionCandidate = async function (
  request,
  h,
  dependencies = { invigilatorAccessRepository },
) {
  const { userId } = request.auth.credentials;
  const certificationCandidateId = request.params.certificationCandidateId;
  try {
    const isInvigilatorForSession = await dependencies.invigilatorAccessRepository.isUserInvigilatorForSessionCandidate(
      {
        invigilatorId: userId,
        certificationCandidateId,
      },
    );

    if (!isInvigilatorForSession) {
      throw new ForbiddenAccess(FORBIDDEN_ERROR_MESSAGE);
    }
    return h.response(true);
  } catch {
    return _replyForbiddenError(h);
  }
};

const authorization = {
  checkUserHaveCertificationCenterMembershipForSession,
  checkUserHaveInvigilatorAccessForSession,
  checkUserHaveInvigilatorAccessForSessionCandidate,
};

export { authorization };
