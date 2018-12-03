const errorSerializer = require('./serializers/jsonapi/error-serializer');
const infraError = require('./errors');
const logger = require('./logger');

function controllerReplies(h) {
  return {

    ok(payload) {
      return h.response(payload).code(200);
    },

    created(payload) {
      return h.response(payload).code(201);
    },

    noContent() {
      return h.response().code(204);
    },

    error(error) {

      if (error instanceof infraError.InfrastructureError) {
        return h.response(errorSerializer.serialize(error)).code(error.code);
      }

      logger.error(error);
      const mappedError = new infraError.InfrastructureError(error.message);
      return h.response(errorSerializer.serialize(mappedError)).code(mappedError.code);
    },
  };
}

module.exports = controllerReplies;
