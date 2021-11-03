const usecases = require('../../domain/usecases');
const sessionForSupervisingSerializer = require('../../infrastructure/serializers/jsonapi/session-for-supervising-serializer');
const { featureToggles } = require('../../config');
const { NotFoundError } = require('../http-errors');

module.exports = {
  async get(request) {
    if (!featureToggles.isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }

    const sessionId = request.params.id;
    const session = await usecases.getSessionForSupervising({ sessionId });
    return sessionForSupervisingSerializer.serialize(session);
  },

  async supervise(request, h) {
    if (!featureToggles.isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }

    const { userId } = request.auth.credentials;
    const { 'supervisor-password': supervisorPassword, 'session-id': sessionId } = request.payload.data.attributes;
    await usecases.superviseSession({ sessionId, userId, supervisorPassword });
    return h.response().code(204);
  },
};
