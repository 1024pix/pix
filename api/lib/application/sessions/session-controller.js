const usecases = require('../../domain/usecases');
const sessionService = require('../../domain/services/session-service');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  async find(request, h) {
    try {
      const session = await sessionService.find();
      return serializer.serialize(session);
    } catch(error) {
      return errorManager.send(h, error);
    }
  },

  async get(request, h) {
    const sessionId = request.params.id;

    try {
      const session = await sessionService.get(sessionId);
      return serializer.serialize(session);
    } catch (error) {
      return errorManager.send(h, error);
    }
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);

    try {
      const newSession = await usecases.createSession({ userId, session });
      return serializer.serialize(newSession);
    } catch (error) {
      return errorManager.send(h, error);
    }
  },

  async update(request, h) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);
    session.id = request.params.id;

    try {
      const updatedSession = await usecases.updateSession({ userId, session });
      return serializer.serialize(updatedSession);
    } catch (error) {
      return errorManager.send(h, error);
    }
  }
};
