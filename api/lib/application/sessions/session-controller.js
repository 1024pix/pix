const Boom = require('boom');

const usecases = require('../../domain/usecases');
const sessionService = require('../../domain/services/session-service');
const { NotFoundError, EntityValidationError } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const JSONAPI = require('../../interfaces/jsonapi');
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

  async get(request) {
    const sessionId = request.params.id;

    try {
      const session = await sessionService.get(sessionId);
      return serializer.serialize(session);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw Boom.notFound(error);
      }
      logger.error(error);
      throw Boom.badImplementation(error);
    }
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);

    try {
      const newSession = await usecases.createSession({ userId, session });
      return serializer.serialize(newSession);
    } catch (error) {
      if (error instanceof EntityValidationError) {
        return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
      }

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
      if (error instanceof EntityValidationError) {
        return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
      }

      return errorManager.send(h, error);
    }
  }
};
