'use strict';

const Boom = require('boom');
const answerSerializer = require('../serializers/answer-serializer');
const solutionRepository = require('../repositories/solution-repository');
const solutionService = require('../services/solution-service');
const Answer = require('../models/data/answer');

module.exports = {

  save: {
    handler: (request, reply) => {

      const answer = answerSerializer.deserialize(request.payload);


      solutionRepository
        .get(answer.attributes.challengeId)
        .then((solution) => {
          const answerCorrectness = solutionService.matchUserAnswerWithActualSolution(answer, solution);
          answer.attributes.result = answerCorrectness;
          return answer.save()
            .then((answer) => reply(answerSerializer.serialize(answer)).code(201))
            .catch((error) => reply(Boom.badImplementation(error)));
        });

    }
  },

  get: {
    handler: (request, reply) => {

      new Answer({ id: request.params.id }).fetch().then((answer) => {
        reply(answerSerializer.serialize(answer));
      });
    }
  }

};
