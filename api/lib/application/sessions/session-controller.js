const Boom = require('boom');

const usecases = require('../../domain/usecases');
const sessionService = require('../../domain/services/session-service');
const { NotFoundError, ForbiddenAccess, EntityValidationError, UserNotAuthorizedToUpdateRessourceError } = require('../../domain/errors');

const logger = require('../../infrastructure/logger');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const infraErrors = require('../../infrastructure/errors');
const JSONAPI = require('../../interfaces/jsonapi');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const controllerReplies = require('../../infrastructure/controller-replies');

module.exports = {

  find(request, h) {
    return sessionService.find()
      .then(serializer.serialize)
      .catch(controllerReplies(h).error);
  },

  get(request) {
    const sessionId = request.params.id;
    return sessionService.get(sessionId)
      .then(serializer.serialize)
      .catch((error) => {
        if (error instanceof NotFoundError) {
          throw Boom.notFound(error);
        }
        logger.error(error);
        throw Boom.badImplementation(error);
      });
  },

  save(request, h) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);

    try {
      return usecases.createSession({ userId, session })
        .then(serializer.serialize)
        .then(h)
        .catch((err) => {
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
        });
    }
    catch (error) {
      const serializedError = errorSerializer.serialize(error.getErrorMessage());
      return h.response(serializedError).code(400);
    }
  },

  update(request, h) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);
    session.id = request.params.id;

    return usecases.updateSession({ userId, session })
      .then(serializer.serialize)
      .then(controllerReplies(h).ok)
      .catch((error) => {

        let infraError;

        if (error instanceof UserNotAuthorizedToUpdateRessourceError) {
          infraError = new infraErrors.ForbiddenError(error.message);
        }

        else if (error instanceof NotFoundError) {
          infraError = new infraErrors.NotFoundError(error.message);
        }
        else {
          infraError = error;
        }

        return controllerReplies(h).error(infraError);
      });
  }
};
