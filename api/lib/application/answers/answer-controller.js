const Boom = require('boom');
const Answer = require('../../domain/models/data/answer');
const answerSerializer = require('../../infrastructure/serializers/answer-serializer');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');
const solutionService = require('../../domain/services/solution-service');
const logger = require('../../infrastructure/logger');

module.exports = {

  save(request, reply) {

    const answer = answerSerializer.deserialize(request.payload);

    solutionRepository
      .get(answer.get('challengeId'))
      .then((solution) => {
        const answerCorrectness = solutionService.match(answer, solution);
        answer.set('result', answerCorrectness);
        return answer.save()
          .then((answer) => reply(answerSerializer.serialize(answer)).code(201))
          .catch((err) => reply(Boom.badImplementation(err)));
      });
  },

  get(request, reply) {

    new Answer({ id: request.params.id })
      .fetch()
      .then((answer) => reply(answerSerializer.serialize(answer)));
  }

};
