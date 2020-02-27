const Answer = require('../../domain/models/Answer');
const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer');
const correctionSerializer = require('../../infrastructure/serializers/jsonapi/correction-serializer');
const usecases = require('../../domain/usecases');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  async save(request, h) {
    const answer = partialDeserialize(request.payload);
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const createdAnswer = await usecases.correctAnswerThenUpdateAssessment({ answer, userId });

    return h.response(answerSerializer.serialize(createdAnswer)).created();
  },

  async get(request) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const answerId = request.params.id;
    const answer = await usecases.getAnswer({ answerId, userId });

    return answerSerializer.serialize(answer);
  },

  async update(request) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const answerId = parseInt(request.params.id);
    const answer = await usecases.getAnswer({ answerId, userId });

    return answerSerializer.serialize(answer);
  },

  async findByChallengeAndAssessment(request) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const challengeId = request.query.challenge;
    const assessmentId = request.query.assessment;
    const answer = await usecases.findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId });

    return answerSerializer.serialize(answer);
  },

  async getCorrection(request) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);

    const correction = await usecases.getCorrectionForAnswer({
      answerId: parseInt(request.params.id),
      userId
    });

    return correctionSerializer.serialize(correction);
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
