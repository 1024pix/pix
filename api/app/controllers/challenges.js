'use strict';

const Boom = require('boom');
const challengeRepository = require('../repositories/challenge-repository');
const challengeSerializer = require('../serializers/challenge-serializer');

module.exports = {

  list: {
    handler: (request, reply) => {

      challengeRepository
        .list()
        .then((challenges) => reply(challengeSerializer.serializeArray(challenges)))
        .catch((error) => reply(Boom.badImplementation(error)));
    }
  },

  get: {
    handler: (request, reply) => {

      challengeRepository
        .get(request.params.id)
        .then((challenge) => reply(challengeSerializer.serialize(challenge)))
        .catch((error) => reply(Boom.badImplementation(error)));
    }
  }
};
