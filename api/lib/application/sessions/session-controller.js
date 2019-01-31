const Boom = require('boom');

const logger = require('../../infrastructure/logger');
const sessionService = require('../../domain/services/session-service');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const { NotFoundError, ForbiddenAccess } = require('../../domain/errors');
const infraErrors = require('../../infrastructure/errors');
const { ValidationError: BookshelfValidationError } = require('bookshelf-validate/lib/errors');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
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

    try {
      return serializer.deserialize(request.payload)
        .then((session) => sessionService.save({ userId, session }))
        .then(serializer.serialize)
        .then(h)
        .catch((err) => {
          if (err instanceof NotFoundError) {
            const notFoundError = new infraErrors.NotFoundError('Le centre de certification n\'existe pas');
            return controllerReplies(h).error(notFoundError);
          }

          if (err instanceof BookshelfValidationError) {
            return h.response(validationErrorSerializer.serialize(err)).code(400);
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
  }
};
