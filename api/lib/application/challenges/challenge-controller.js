const Boom = require('boom');

const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

const logger = require('../../infrastructure/logger');

module.exports = {

  get(request, reply) {

    challengeRepository
      .get(request.params.id)
      .then((challenge) => reply(challengeSerializer.serialize(challenge)))
      .catch((err) => {
        logger.error(err);
        let error = Boom.badImplementation(err);
        if ('MODEL_ID_NOT_FOUND' == err.error.type) {
          error = Boom.notFound(err);
        }
        return reply(error);
      });

  },

  // TODO: Déplacer ça dans le cache controller
  refresh(request, reply) {

    challengeRepository
      .refresh(request.params.id)
      .then((challenge) => reply(challengeSerializer.serialize(challenge)))
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  refreshSolution(request, reply) {

    solutionRepository
      .refresh(request.params.id)
      .then(() => reply('ok'))
      .catch((err) => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });

  }

};
