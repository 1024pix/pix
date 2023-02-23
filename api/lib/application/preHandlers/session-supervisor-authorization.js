const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
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
