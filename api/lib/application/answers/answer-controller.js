const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer');
const correctionSerializer = require('../../infrastructure/serializers/jsonapi/correction-serializer');
const usecases = require('../../domain/usecases/index.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async save(request, h) {
    const answer = answerSerializer.deserialize(request.payload);
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const createdAnswer = await usecases.correctAnswerThenUpdateAssessment({ answer, userId, locale });

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
    const answerId = request.params.id;
    const answer = await usecases.getAnswer({ answerId, userId });

    return answerSerializer.serialize(answer);
  },

  async find(request) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const challengeId = request.query.challengeId;
    const assessmentId = request.query.assessmentId;
    let answers = [];
    if (challengeId && assessmentId) {
      answers = await usecases.findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId });
    }
    if (assessmentId && !challengeId) {
      answers = await usecases.findAnswerByAssessment({ assessmentId, userId });
    }

    return answerSerializer.serialize(answers);
  },

  async getCorrection(request) {
    const userId = requestResponseUtils.extractUserIdFromRequest(request);
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const answerId = request.params.id;

    const correction = await usecases.getCorrectionForAnswer({
      answerId,
      userId,
      locale,
    });

    return correctionSerializer.serialize(correction);
  },
};
