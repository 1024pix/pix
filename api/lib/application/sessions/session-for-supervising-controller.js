const usecases = require('../../domain/usecases');
const sessionForSupervisingSerializer = require('../../infrastructure/serializers/jsonapi/session-for-supervising-serializer');
const { NotFoundError } = require('../http-errors');
const endTestScreenRemovalService = require('../../domain/services/end-test-screen-removal-service');

module.exports = {
  async get(request) {
    const sessionId = request.params.id;
    const isEndTestScreenRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(
      sessionId
    );
    if (!isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }

    const session = await usecases.getSessionForSupervising({ sessionId });
    return sessionForSupervisingSerializer.serialize(session);
  },

  async supervise(request, h) {
    const { 'supervisor-password': supervisorPassword, 'session-id': sessionId } = request.payload.data.attributes;
    const isEndTestScreenRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(
      // eslint-disable-next-line no-restricted-syntax
      parseInt(sessionId, 10)
    );
    if (!isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }
    const { userId } = request.auth.credentials;
    await usecases.superviseSession({ sessionId, userId, supervisorPassword });
    return h.response().code(204);
  },
};
