import * as answerSerializer from '../../infrastructure/serializers/jsonapi/answer-serializer.js';
import * as correctionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/correction-serializer.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { evaluationUsecases } from '../../domain/usecases/index.js';

import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';

const save = async function (request, h, dependencies = { answerSerializer, requestResponseUtils }) {
  const answer = dependencies.answerSerializer.deserialize(request.payload);
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const createdAnswer = await usecases.correctAnswerThenUpdateAssessment({ answer, userId, locale });

  return h.response(dependencies.answerSerializer.serialize(createdAnswer)).created();
};

const get = async function (request, _h, dependencies = { requestResponseUtils }) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const answerId = request.params.id;
  const answer = await evaluationUsecases.getAnswer({ answerId, userId });

  return answerSerializer.serialize(answer);
};

const update = async function (request, _h, dependencies = { requestResponseUtils }) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const answerId = request.params.id;
  const answer = await evaluationUsecases.getAnswer({ answerId, userId });

  return answerSerializer.serialize(answer);
};

const find = async function (request, _h, dependencies = { requestResponseUtils }) {
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const challengeId = request.query.challengeId;
  const assessmentId = request.query.assessmentId;
  let answers = [];
  if (challengeId && assessmentId) {
    answers = await evaluationUsecases.findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId });
  }
  if (assessmentId && !challengeId) {
    answers = await evaluationUsecases.findAnswerByAssessment({ assessmentId, userId });
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

const answerController = { save, get, update, find, getCorrection };

export { answerController };
