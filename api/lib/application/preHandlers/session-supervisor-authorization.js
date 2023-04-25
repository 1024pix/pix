const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  async verifyByCertificationCandidateId(
    request,
    h,
    dependencies = { requestResponseUtils, supervisorAccessRepository }
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
  },

  async verifyBySessionId(request, h, dependencies = { requestResponseUtils, supervisorAccessRepository }) {
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
  },
};
