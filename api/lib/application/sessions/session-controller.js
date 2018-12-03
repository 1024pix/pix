const Boom = require('boom');

const logger = require('../../infrastructure/logger');
const sessionService = require('../../domain/services/session-service');
const { NotFoundError } = require('../../domain/errors');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
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
    try {
      return serializer.deserialize(request.payload)
        .then((sessionModel) => sessionService.save(sessionModel))
        .then((session) => serializer.serialize(session))
        .then(h)
        .catch((err) => {

          if (err instanceof BookshelfValidationError) {
            return h.response(validationErrorSerializer.serialize(err)).code(400);
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
