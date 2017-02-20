const Boom = require('boom');

const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

const answerRepository = require('../../infrastructure/repositories/answer-repository');
const solutionService = require('../../domain/services/solution-service');
const challengeService = require('../../domain/services/challenge-service');

module.exports = {

  list(request, reply) {

    challengeRepository
      .list()
      .then((challenges) => reply(challengeSerializer.serializeArray(challenges)))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  revalidateAnswers(request, reply) {
    const challengeId = request.params.id;
    return answerRepository
            .findByChallenge(challengeId)
            .then(oldAnswers => {
              const revalidatedAnswers = oldAnswers.map(oldAnswer => solutionService.revalidate(oldAnswer));
              Promise.all(revalidatedAnswers).then(newAnswers => {
                const revalidationStatistics = challengeService.getRevalidationStatistics(oldAnswers, newAnswers);
                return reply(revalidationStatistics);
              });
            })
            .catch((err) => reply(Boom.badImplementation(err)));

  },

  get(request, reply) {

    challengeRepository
      .get(request.params.id)
      .then((challenge) => reply(challengeSerializer.serialize(challenge)))
      .catch((err) => {
        let error = Boom.badImplementation(err);
        if ('MODEL_ID_NOT_FOUND' == err.error.type) {
          error = Boom.notFound(err);
        }
        return reply(error);
      });

  },

  refresh(request, reply) {

    challengeRepository
      .refresh(request.params.id)
      .then((challenge) => reply(challengeSerializer.serialize(challenge)))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  refreshSolution(request, reply) {

    solutionRepository
      .refresh(request.params.id)
      .then(() => reply('ok'))
      .catch((err) => reply(Boom.badImplementation(err)));

  }

};
