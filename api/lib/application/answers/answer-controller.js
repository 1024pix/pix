import * as answerSerializer from '../../infrastructure/serializers/jsonapi/answer-serializer.js';
import * as answerPix1dSerializer from '../../infrastructure/serializers/jsonapi/answer-pix1d-serializer.js';
import * as correctionSerializer from '../../infrastructure/serializers/jsonapi/correction-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { requestResponseUtils } from '../../infrastructure/utils/request-response-utils.js';

const save = async function (request, h, dependencies = { answerSerializer, requestResponseUtils }) {
  const answer = dependencies.answerSerializer.deserialize(request.payload);
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const createdAnswer = await usecases.correctAnswerThenUpdateAssessment({ answer, userId, locale });

  return h.response(dependencies.answerSerializer.serialize(createdAnswer)).created();
};

const saveForPix1D = async function (request, h, dependencies = { answerPix1dSerializer }) {
  const answer = dependencies.answerPix1dSerializer.deserialize(request.payload);
  const challengeId = answer.challengeId;
  const createdAnswer = await usecases.correctAnswer({ answer, challengeId });

  return h.response(answerPix1dSerializer.serialize(createdAnswer)).created();
};

const get = async function (request, _h, dependencies = { requestResponseUtils }) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const answerId = request.params.id;
  const answer = await usecases.getAnswer({ answerId, userId });

  return answerSerializer.serialize(answer);
};

const update = async function (request, _h, dependencies = { requestResponseUtils }) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const answerId = request.params.id;
  const answer = await usecases.getAnswer({ answerId, userId });

  return answerSerializer.serialize(answer);
};

const find = async function (request, _h, dependencies = { requestResponseUtils }) {
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
};

const getCorrection = async function (request, _h, dependencies = { correctionSerializer, requestResponseUtils }) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const answerId = request.params.id;

  const correction = await usecases.getCorrectionForAnswer({
    answerId,
    userId,
    locale,
  });

  return dependencies.correctionSerializer.serialize(correction);
};

export { save, saveForPix1D, get, update, find, getCorrection };
