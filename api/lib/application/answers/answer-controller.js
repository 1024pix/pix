const Answer = require('../../domain/models/Answer');
const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const BookshelfAnswer = require('../../infrastructure/data/answer');
const Boom = require('boom');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const controllerReplies = require('../../infrastructure/controller-replies');
const infraErrors = require('../../infrastructure/errors');
const jsYaml = require('js-yaml');
const logger = require('../../infrastructure/logger');
const usecases = require('../../domain/usecases');
const smartPlacementAssessmentRepository =
  require('../../infrastructure/repositories/smart-placement-assessment-repository');
const smartPlacementKnowledgeElementRepository =
  require('../../infrastructure/repositories/smart-placement-knowledge-element-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');
const solutionService = require('../../domain/services/solution-service');
const { ChallengeAlreadyAnsweredError } = require('../../domain/errors');

function _updateExistingAnswer(existingAnswer, newAnswer, reply) {
  solutionRepository
    .getByChallengeId(existingAnswer.get('challengeId'))
    .then((solution) => {
      const answerCorrectness = solutionService.validate(newAnswer, solution);
      new BookshelfAnswer({ id: existingAnswer.id })
        .save({
          result: answerCorrectness.result,
          resultDetails: jsYaml.safeDump(answerCorrectness.resultDetails),
          value: newAnswer.get('value'),
          timeout: newAnswer.get('timeout'),
          elapsedTime: newAnswer.get('elapsedTime'),
          challengeId: newAnswer.get('challengeId'),
          assessmentId: newAnswer.get('assessmentId'),
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

module.exports = {

  save(request, reply) {

    return Promise.resolve(request.payload)
      .then(deserialize)
      .then((newAnswer) => {
        return usecases.saveAnswerAndCreateAssociatedKnowledgeElements({
          answer: newAnswer,
          answerRepository,
          challengeRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
          solutionRepository,
          solutionService,
        });
      })
      .then(answerSerializer.serialize)
      .then(controllerReplies(reply).created)
      .catch(mapToInfrastructureErrors)
      .catch(controllerReplies(reply).error);
  },

  get(request, reply) {

    new BookshelfAnswer({ id: request.params.id })
      .fetch()
      .then((answer) => reply(answerSerializer.serialize(answer)))
      .catch((err) => logger.error(err));
  },

  update(request, reply) {

    const updatedAnswer = answerSerializer.deserialize(request.payload);
    answerRepository
      .findByChallengeAndAssessment(updatedAnswer.get('challengeId'), updatedAnswer.get('assessmentId'))
      .then((existingAnswer) => {

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
      .catch((err) => {
        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  },
};

function deserialize(payload) {
  return new Answer({
    value: payload.data.attributes.value,
    result: payload.data.attributes.result,
    resultDetails: payload.data.attributes['result-details'],
    timeout: payload.data.attributes.timeout,
    elapsedTime: payload.data.attributes['elapsed-time'],
    assessmentId: payload.data.relationships.assessment.data.id,
    challengeId: payload.data.relationships.challenge.data.id,
  });
}

function mapToInfrastructureErrors(error) {

  if (error instanceof ChallengeAlreadyAnsweredError) {
    throw new infraErrors.ConflictError('This challenge has already been answered.');
  }

  throw error;
}
