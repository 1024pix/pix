import supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository';
import requestResponseUtils from '../../infrastructure/utils/request-response-utils';

export default {
  async verifyByCertificationCandidateId(request, h) {
    const supervisorUserId = requestResponseUtils.extractUserIdFromRequest(request);
    const candidateId = request.params.id;
    const isSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSessionCandidate({
      supervisorId: supervisorUserId,
      certificationCandidateId: candidateId,
    });

    if (!isSupervisorForSession) {
      return h.response().code(401).takeover();
    }

    return true;
  },

  async verifyBySessionId(request, h) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const sessionId = request.params.id;

    const isSupervisorForSession = await supervisorAccessRepository.isUserSupervisorForSession({
      sessionId,
      userId,
    });

    if (!isSupervisorForSession) {
      return h.response().code(401).takeover();
    }
    return true;
  },
};
