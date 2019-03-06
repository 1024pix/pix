const Boom = require('boom');

const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

const logger = require('../../infrastructure/logger');

module.exports = {

  get(request) {

    return challengeRepository
      .get(request.params.id)
      .then((challenge) => challengeSerializer.serialize(challenge))
      .catch((err) => {
        logger.error(err);
        if (err.error && 'MODEL_ID_NOT_FOUND' === err.error.type) {
          throw Boom.notFound(err);
        }
        throw Boom.badImplementation(err);
      });

  },

};
