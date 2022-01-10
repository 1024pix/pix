const { SupervisorAccessNotAuthorizedError } = require('../../domain/errors');
const endTestScreenRemovalService = require('../../domain/services/end-test-screen-removal-service');

module.exports = {
  async verifyBySessionId(request, h) {
    let sessionId = request.params?.id;
    if (!sessionId) {
      sessionId = request.payload.data.attributes['session-id'];
    }

    const isEndTestScreenRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(
      sessionId
    );
    if (!isEndTestScreenRemovalEnabled) {
      throw new SupervisorAccessNotAuthorizedError();
    }

    return true;
  },

  async verifyByCertificationCandidateId(request, h) {
    const candidateId = request.params.id;

    const isEndTestScreenRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId(
      candidateId
    );
    if (!isEndTestScreenRemovalEnabled) {
      return h.response().code(404).takeover();
    }

    return true;
  },
};
