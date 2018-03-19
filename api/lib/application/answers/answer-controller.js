const Boom = require('boom');
const Answer = require('../../infrastructure/data/answer');
const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const solutionService = require('../../domain/services/solution-service');
const jsYaml = require('js-yaml');

const logger = require('../../infrastructure/logger');

function _updateExistingAnswer(existingAnswer, newAnswer, reply) {
  solutionRepository
    .get(existingAnswer.get('challengeId'))
    .then((solution) => {
      const answerCorrectness = solutionService.validate(newAnswer, solution);
      new Answer({ id: existingAnswer.id })
        .save({
          result: answerCorrectness.result,
          resultDetails: jsYaml.safeDump(answerCorrectness.resultDetails),
          value: newAnswer.get('value'),
          timeout: newAnswer.get('timeout'),
          elapsedTime: newAnswer.get('elapsedTime'),
          challengeId: newAnswer.get('challengeId'),
          assessmentId: newAnswer.get('assessmentId')
        }, { method: 'update' })
        .then((updatedAnswer) => {
          return reply(answerSerializer.serialize(updatedAnswer)).code(200);
        })
        .catch((err) => {
          logger.error(err);
          reply(Boom.badImplementation(err));
        });
    });
}

function _saveNewAnswer(newAnswer, reply) {
  solutionRepository
    .get(newAnswer.get('challengeId'))
    .then((solution) => {
      const answerCorrectness = solutionService.validate(newAnswer, solution);
      newAnswer.save({
        result: answerCorrectness.result,
        resultDetails: jsYaml.safeDump(answerCorrectness.resultDetails),
        value: newAnswer.get('value'),
        timeout: newAnswer.get('timeout'),
        elapsedTime: newAnswer.get('elapsedTime'),
        challengeId: newAnswer.get('challengeId'),
        assessmentId: newAnswer.get('assessmentId')
      }, { method: 'insert' })
        .then((newAnswer) => reply(answerSerializer.serialize(newAnswer)).code(201))
        .catch((err) => {
          logger.error(err);
          reply(Boom.badImplementation(err));
        });
    });
}

module.exports = {

  save(request, reply) {

    const newAnswer = answerSerializer.deserialize(request.payload);
    answerRepository
      .findByChallengeAndAssessment(newAnswer.get('challengeId'), newAnswer.get('assessmentId'))
      .then(existingAnswer => {
        if (existingAnswer) {
          return reply(Boom.conflict(`An answer with id ${existingAnswer.get('id')} already exists.`));
        }
        return _saveNewAnswer(newAnswer, reply);
      });
  },

  get(request, reply) {

    new Answer({ id: request.params.id })
      .fetch()
      .then((answer) => reply(answerSerializer.serialize(answer)))
      .catch(err => logger.error(err));
  },

  update(request, reply) {

    const updatedAnswer = answerSerializer.deserialize(request.payload);
    answerRepository
      .findByChallengeAndAssessment(updatedAnswer.get('challengeId'), updatedAnswer.get('assessmentId'))
      .then(existingAnswer => {

        if (!existingAnswer) {
          return reply(Boom.notFound());
        }

        return _updateExistingAnswer(existingAnswer, updatedAnswer, reply);
      });
  },

  findByChallengeAndAssessment(request, reply) {
    return answerRepository
      .findByChallengeAndAssessment(request.url.query.challenge, request.url.query.assessment)
      .then((answer) => {
        return reply(answerSerializer.serialize(answer)).code(200);
      })
      .catch(err => {
        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  }

};
