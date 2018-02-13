const Boom = require('boom');

const logger = require('../../infrastructure/logger');
const sessionService = require('../../domain/services/session-service');
const sessionRepository = require('../../infrastructure/repositories/session-repository');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const { ValidationError } = require('bookshelf-validate/lib/errors');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

module.exports = {
  get(request, reply) {
    reply(sessionService.getCurrentCode());
  },

  save(request, reply) {
    const sessionModel = serializer.deserialize(request.payload);

    return sessionRepository.save(sessionModel)
      .then((session) => serializer.serialize(session))
      .then(reply)
      .catch((err) => {

        if (err instanceof ValidationError) {
          return reply(validationErrorSerializer.serialize(err)).code(400);
        }

        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }
};
