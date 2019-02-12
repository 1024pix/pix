const Answer = require('../../domain/models/Answer');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer');
const Boom = require('boom');
const controllerReplies = require('../../infrastructure/controller-replies');
const infraErrors = require('../../infrastructure/errors');
const logger = require('../../infrastructure/logger');
const usecases = require('../../domain/usecases');
const smartPlacementAssessmentRepository =
  require('../../infrastructure/repositories/smart-placement-assessment-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');
const solutionService = require('../../domain/services/solution-service');
const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../../domain/errors');

function _updateExistingAnswer(existingAnswer, newAnswer) {
  return solutionRepository
    .getByChallengeId(existingAnswer.challengeId)
    .then((solution) => {
      const answerCorrectness = solutionService.validate(newAnswer, solution);

      return answerRepository.save({
        id: existingAnswer.id,
        result: answerCorrectness.result,
        resultDetails: answerCorrectness.resultDetails,
        value: newAnswer.get('value'),
        timeout: newAnswer.get('timeout'),
        elapsedTime: newAnswer.get('elapsedTime'),
        challengeId: newAnswer.get('challengeId'),
        assessmentId: newAnswer.get('assessmentId'),
      });
    })
    .then(answerSerializer.serialize)
    .catch((err) => {
      logger.error(err);
      throw Boom.badImplementation(err);
    });
}

module.exports = {

  save(request, h) {

    return Promise.resolve(request.payload)
      .then(partialDeserialize)
      .then((newAnswer) => {
        return usecases.correctAnswerThenUpdateAssessment({
          answer: newAnswer,
        });
      })
      .then((answer) => {
        return h.response(answerSerializer.serialize(answer)).created();
      })
      .catch((error) => {
        const mappedError = mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  get(request) {
    return answerRepository.get(request.params.id)
      .then(answerSerializer.serialize)
      .catch((err) => logger.error(err));
  },

  update(request, h) {

    const updatedAnswer = answerSerializer.deserializeToBookshelfAnswer(request.payload);
    return answerRepository
      .getByChallengeAndAssessment(updatedAnswer.get('challengeId'), updatedAnswer.get('assessmentId'))
      .then((existingAnswer) => {

        if (!existingAnswer) {
          throw Boom.notFound();
        }

        // XXX if assessment is a Smart Placement, then return 204 and do not update answer. If not proceed normally.
        return isAssessmentSmartPlacement(existingAnswer.assessmentId)
          .then((assessmentIsSmartPlacement) => {
            if (assessmentIsSmartPlacement) {
              return null;
            } else {
              return _updateExistingAnswer(existingAnswer, updatedAnswer);
            }
          })
          .catch(controllerReplies(h).error);
      });
  },

  findByChallengeAndAssessment(request) {
    return answerRepository
      .getByChallengeAndAssessment({ challengeId: request.url.query.challenge, assessmentId: request.url.query.assessment })
      .then(answerSerializer.serialize)
      .catch((err) => {
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },
};

function partialDeserialize(payload) {
  // XXX missing AnswerStatus adapter for result serialisation
  return new Answer({
    value: payload.data.attributes.value,
    result: null,
    resultDetails: null,
    timeout: payload.data.attributes.timeout,
    elapsedTime: payload.data.attributes['elapsed-time'],
    assessmentId: payload.data.relationships.assessment.data.id,
    challengeId: payload.data.relationships.challenge.data.id,
  });
}

function mapToInfrastructureErrors(error) {

  if (error instanceof ChallengeAlreadyAnsweredError) {
    return new infraErrors.ConflictError('This challenge has already been answered.');
  }

  return error;
}

function isAssessmentSmartPlacement(assessmentId) {

  return smartPlacementAssessmentRepository.get(assessmentId)
    .then(() => {
      return true;
    })
    .catch((error) => {

      if (error instanceof NotFoundError) {
        return false;

      } else {
        throw error;
      }
    });
}
