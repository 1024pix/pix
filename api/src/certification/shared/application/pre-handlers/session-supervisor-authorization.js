import * as requestResponseUtils from '../../../../shared/infrastructure/utils/request-response-utils.js';
import * as supervisorAccessRepository from '../../../session-management/infrastructure/repositories/supervisor-access-repository.js';

const verifyByCertificationCandidateId = async function (
  request,
  h,
  dependencies = { requestResponseUtils, supervisorAccessRepository },
) {
  const supervisorUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const certificationCandidateId = request.params.certificationCandidateId;
  const isSupervisorForSession = await dependencies.supervisorAccessRepository.isUserSupervisorForSessionCandidate({
    supervisorId: supervisorUserId,
    certificationCandidateId,
  });

  if (!isSupervisorForSession) {
    return h.response().code(401).takeover();
  }

  return true;
};

const verifyBySessionId = async function (
  request,
  h,
  dependencies = { requestResponseUtils, supervisorAccessRepository },
) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const sessionId = request.params.sessionId;

  const isSupervisorForSession = await dependencies.supervisorAccessRepository.isUserSupervisorForSession({
    sessionId,
    userId,
  });

  if (!isSupervisorForSession) {
    return h.response().code(401).takeover();
  }
  return true;
};

const assessmentSupervisorAuthorization = { verifyByCertificationCandidateId, verifyBySessionId };

export { assessmentSupervisorAuthorization };
