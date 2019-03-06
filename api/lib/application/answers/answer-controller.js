const Answer = require('../../domain/models/Answer');
const AnswerStatus = require('../../domain/models/AnswerStatus');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer');
const usecases = require('../../domain/usecases');
const smartPlacementAssessmentRepository =
  require('../../infrastructure/repositories/smart-placement-assessment-repository');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');
const solutionService = require('../../domain/services/solution-service');
const { NotFoundError } = require('../../domain/errors');
const errorManager = require('../../infrastructure/utils/error-manager');

function _updateExistingAnswer(existingAnswer, newAnswer) {
  return solutionRepository
    .getByChallengeId(existingAnswer.challengeId)
    .then((solution) => {
      const answerCorrectness = solutionService.validate(newAnswer, solution);

      return answerRepository.save({
        id: existingAnswer.id,
        result: AnswerStatus.from(answerCorrectness.result),
        resultDetails: answerCorrectness.resultDetails,
        value: newAnswer.attributes.value,
        timeout: newAnswer.attributes.timeout,
        elapsedTime: newAnswer.attributes['elapsed-time'],
        challengeId: newAnswer.relationships.challenge.data.id,
        assessmentId: newAnswer.relationships.assessment.data.id,
      });
    })
    .then(answerSerializer.serialize);
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
      .catch((error) => errorManager.send(h, error));
  },

  async get(request, h) {
    try {
      const result = await answerRepository.get(request.params.id);
      return answerSerializer.serialize(result);

    } catch(error) {
      return errorManager.send(h, error);
    }
  },

  update(request, h) {

    const updatedAnswer = request.payload.data;
    return answerRepository
      .findByChallengeAndAssessment({
        challengeId: updatedAnswer.relationships.challenge.data.id,
        assessmentId: updatedAnswer.relationships.assessment.data.id
      })
      .then((existingAnswer) => {

        if (!existingAnswer) {
          throw new NotFoundError('Answer does not exit');
        }

        // XXX if assessment is a Smart Placement, then return 204 and do not update answer. If not proceed normally.
        return isAssessmentSmartPlacement(existingAnswer.assessmentId)
          .then((assessmentIsSmartPlacement) => {
            if (assessmentIsSmartPlacement) {
              return null;
            } else {
              return _updateExistingAnswer(existingAnswer, updatedAnswer);
            }
          });

      })
      .catch((error) => errorManager.send(h, error));
  },

  findByChallengeAndAssessment(request, h) {
    return answerRepository
      .findByChallengeAndAssessment({
        challengeId: request.url.query.challenge,
        assessmentId: request.url.query.assessment
      })
      .then(answerSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
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
