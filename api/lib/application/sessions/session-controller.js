const Boom = require('boom');

const logger = require('../../infrastructure/logger');
const sessionService = require('../../domain/services/session-service');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const { ValidationError: BookshelfValidationError } = require('bookshelf-validate/lib/errors');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

module.exports = {
  get(request, reply) {
    reply(sessionService.getCurrentCode());
  },

  save(request, reply) {
    try {
      return serializer.deserialize(request.payload)
        .then((sessionModel) => sessionService.save(sessionModel))
        .then((session) => serializer.serialize(session))
        .then(reply)
        .catch((err) => {

          if (err instanceof BookshelfValidationError) {
            return reply(validationErrorSerializer.serialize(err)).code(400);
          }

          logger.error(err);
          reply(Boom.badImplementation(err));
        });
    }
    catch (error) {
      const serializedError = errorSerializer.serialize(error.getErrorMessage());
      return reply(serializedError).code(400);
    }
  }
};
