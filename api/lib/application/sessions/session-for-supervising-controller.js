const usecases = require('../../domain/usecases/index.js');
const sessionForSupervisingSerializer = require('../../infrastructure/serializers/jsonapi/session-for-supervising-serializer');

module.exports = {
  async get(request) {
    const sessionId = request.params.id;
    const session = await usecases.getSessionForSupervising({ sessionId });
    return sessionForSupervisingSerializer.serialize(session);
  },

  async supervise(request, h) {
    const { 'supervisor-password': supervisorPassword, 'session-id': sessionId } = request.payload.data.attributes;
    const { userId } = request.auth.credentials;
    await usecases.superviseSession({ sessionId, userId, supervisorPassword });
    return h.response().code(204);
  },
};
