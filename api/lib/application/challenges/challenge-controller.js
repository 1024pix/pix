const Boom = require('boom');
const repository = require('../../infrastructure/repositories/challenge-repository');
const serializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

module.exports = {

  list(request, reply) {

    repository
      .list()
      .then((challenges) => reply(serializer.serializeArray(challenges)))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  get(request, reply) {

    repository
      .get(request.params.id)
      .then((challenge) => reply(serializer.serialize(challenge)))
      .catch((err) => {
        let error = Boom.badImplementation(err);
        if ('MODEL_ID_NOT_FOUND' == err.error.type) {
          error = Boom.notFound(err);
        }
        return reply(error);
      });
  },

  refresh(request, reply) {

    repository
      .refresh(request.params.id)
      .then((challenge) => reply(serializer.serialize(challenge)))
      .catch((err) => reply(Boom.badImplementation(err)));
  }

};

