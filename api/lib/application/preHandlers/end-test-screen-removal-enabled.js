const { SupervisorAccessNotAuthorizedError } = require('../../domain/errors');
const endTestScreenRemovalService = require('../../domain/services/end-test-screen-removal-service');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async verifyBySessionId(request) {
    let sessionId = request.params?.id;
    if (!sessionId) {
      sessionId = request.payload.data.attributes['session-id'];
    }

    try {
      await sessionRepository.get(sessionId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError('Le numéro de session et/ou le mot de passe saisis sont incorrects.');
      }
      throw error;
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
