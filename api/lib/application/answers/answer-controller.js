const answerSerializer = require('../../infrastructure/serializers/jsonapi/answer-serializer.js');
const answerPix1dSerializer = require('../../infrastructure/serializers/jsonapi/answer-pix1d-serializer.js');
const correctionSerializer = require('../../infrastructure/serializers/jsonapi/correction-serializer.js');
const usecases = require('../../domain/usecases/index.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

module.exports = {
  async save(request, h, dependencies = { answerSerializer, requestResponseUtils }) {
    const answer = dependencies.answerSerializer.deserialize(request.payload);
    const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
    const createdAnswer = await usecases.correctAnswerThenUpdateAssessment({ answer, userId, locale });

    return h.response(dependencies.answerSerializer.serialize(createdAnswer)).created();
  },

  async saveForPix1D(request, h, dependencies = { answerPix1dSerializer }) {
    const answer = dependencies.answerPix1dSerializer.deserialize(request.payload);
    const challengeId = answer.challengeId;
    const createdAnswer = await usecases.correctAnswer({ answer, challengeId });

    return h.response(answerPix1dSerializer.serialize(createdAnswer)).created();
  },

  async get(request, _h, dependencies = { requestResponseUtils }) {
    const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
    const answerId = request.params.id;
    const answer = await usecases.getAnswer({ answerId, userId });

    return answerSerializer.serialize(answer);
  },

  async update(request, _h, dependencies = { requestResponseUtils }) {
    const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
    const answerId = request.params.id;
    const answer = await usecases.getAnswer({ answerId, userId });

    return answerSerializer.serialize(answer);
  },

  async find(request, _h, dependencies = { requestResponseUtils }) {
    const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
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

  async getCorrection(request, _h, dependencies = { correctionSerializer, requestResponseUtils }) {
    const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
    const answerId = request.params.id;

    const correction = await usecases.getCorrectionForAnswer({
      answerId,
      userId,
      locale,
    });

    return dependencies.correctionSerializer.serialize(correction);
  },
};
