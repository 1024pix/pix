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
};
