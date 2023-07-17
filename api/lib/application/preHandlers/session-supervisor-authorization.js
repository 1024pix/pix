import * as supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';

const verifyByCertificationCandidateId = async function (
  request,
  h,
  dependencies = { requestResponseUtils, supervisorAccessRepository },
) {
  const supervisorUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const candidateId = request.params.id;
  const isSupervisorForSession = await dependencies.supervisorAccessRepository.isUserSupervisorForSessionCandidate({
    supervisorId: supervisorUserId,
    certificationCandidateId: candidateId,
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
  const sessionId = request.params.id;

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
