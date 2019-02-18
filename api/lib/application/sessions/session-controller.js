const Boom = require('boom');

const usecases = require('../../domain/usecases');
const sessionService = require('../../domain/services/session-service');
const { NotFoundError, ForbiddenAccess, EntityValidationError, UserNotAuthorizedToUpdateResourceError } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const infraErrors = require('../../infrastructure/errors');
const JSONAPI = require('../../interfaces/jsonapi');
const controllerReplies = require('../../infrastructure/controller-replies');

module.exports = {

  async find(request, h) {
    try {
      const session = await sessionService.find();
      return serializer.serialize(session);
    } catch(err) {
      return controllerReplies(h).error(err);
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
    } catch (err) {
      if (err instanceof NotFoundError) {
        const notFoundError = new infraErrors.NotFoundError('Le centre de certification n\'existe pas');
        return controllerReplies(h).error(notFoundError);
      }

      if (err instanceof EntityValidationError) {
        return h.response(JSONAPI.unprocessableEntityError(err.invalidAttributes)).code(422);
      }

      if(err instanceof ForbiddenAccess) {
        const forbiddenError = new infraErrors.ForbiddenError(err.message);
        return controllerReplies(h).error(forbiddenError);
      }

      logger.error(err);
      throw Boom.badImplementation(err);
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
      const mappedError = _mapToInfraError(error);
      return controllerReplies(h).error(mappedError);
    }
  }
};

function _mapToInfraError(error) {
  if (error instanceof UserNotAuthorizedToUpdateResourceError) {
    return new infraErrors.ForbiddenError(error.message);
  }
  else if (error instanceof NotFoundError) {
    return new infraErrors.NotFoundError(error.message);
  }

  return error;
}
