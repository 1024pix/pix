const errorSerializer = require('./serializers/jsonapi/error-serializer');
const infraError = require('./errors');
const logger = require('./logger');

function controllerReplies(reply) {
  return {

    ok(payload) {
      return reply(payload).code(200);
    },

    created(payload) {
      return reply(payload).code(201);
    },

    noContent() {
      return reply().code(204);
    },

    error(error) {

      if (error instanceof infraError.InfrastructureError) {
        return reply(errorSerializer.serialize(error)).code(error.code);
      }

      logger.error(error);
      const mappedError = new infraError.InfrastructureError(error.message);
      return reply(errorSerializer.serialize(mappedError)).code(mappedError.code);
    },
  };
}

module.exports = controllerReplies;
