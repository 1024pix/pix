import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { Serializer as JSONAPISerializer } from 'jsonapi-serializer';
import { AssessmentEndedError } from '../../domain/errors.js';
import { usecases } from '../../domain/usecases/index.js';
import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as events from '../../domain/events/index.js';
import { logger } from '../../infrastructure/logger.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentSerializer from '../../infrastructure/serializers/jsonapi/assessment-serializer.js';
import * as activitySerializer from '../../infrastructure/serializers/jsonapi/activity-serializer.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';
import * as competenceEvaluationSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/competence-evaluation-serializer.js';
import {
  extractLocaleFromRequest,
  extractUserIdFromRequest,
} from '../../infrastructure/utils/request-response-utils.js';
import * as certificationChallengeRepository from '../../infrastructure/repositories/certification-challenge-repository.js';

import { Examiner } from '../../domain/models/Examiner.js';
import { ValidatorAlwaysOK } from '../../domain/models/ValidatorAlwaysOK.js';

const save = async function (request, h, dependencies = { assessmentRepository }) {
  const assessment = assessmentSerializer.deserialize(request.payload);
  assessment.userId = extractUserIdFromRequest(request);
  assessment.state = 'started';
  const createdAssessment = await dependencies.assessmentRepository.save({ assessment });
  return h.response(assessmentSerializer.serialize(createdAssessment)).created();
};

const createAssessmentPreviewForPix1d = async function (request, h, dependencies = { assessmentSerializer }) {
  const createdAssessment = await usecases.createPreviewAssessment({});
  return h.response(dependencies.assessmentSerializer.serialize(createdAssessment)).created();
};

const get = async function (request, _, dependencies = { assessmentSerializer }) {
  const assessmentId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  const assessment = await usecases.getAssessment({ assessmentId, locale });

  return dependencies.assessmentSerializer.serialize(assessment);
};

const getLastChallengeId = async function (request, h) {
  const assessmentId = request.params.id;

  const lastChallengeId = await usecases.getLastChallengeIdFromAssessmentId({ assessmentId });

  return h.response(lastChallengeId).code(200);
};

const getNextChallenge = async function (
  request,
  h,
  dependencies = {
    usecases,
    assessmentRepository,
    certificationChallengeRepository,
  },
) {
  const assessmentId = request.params.id;

  const logContext = {
    zone: 'assessmentController.getNextChallenge',
    type: 'controller',
    assessmentId,
  };
  logger.trace(logContext, 'tracing assessmentController.getNextChallenge()');

  try {
    const assessment = await dependencies.assessmentRepository.get(assessmentId);
    logContext.assessmentType = assessment.type;
    logger.trace(logContext, 'assessment loaded');

    const challenge = await _getChallenge(assessment, request, dependencies);
    logContext.challenge = challenge;
    logger.trace(logContext, 'replying with challenge');

    return challengeSerializer.serialize(challenge);
  } catch (error) {
    if (error instanceof AssessmentEndedError) {
      const object = new JSONAPISerializer('', {});
      return object.serialize(null);
    }
    throw error;
  }
};

const getCurrentActivity = async function (request, h, dependencies = { activitySerializer }) {
  const assessmentId = request.params.id;
  const activity = await usecases.getCurrentActivity({ assessmentId });
  return dependencies.activitySerializer.serialize(activity);
};

const completeAssessment = async function (request) {
  const assessmentId = request.params.id;
  const locale = extractLocaleFromRequest(request);
  let event;

  await DomainTransaction.execute(async (domainTransaction) => {
    const result = await usecases.completeAssessment({ assessmentId, domainTransaction, locale });
    await usecases.handleBadgeAcquisition({ assessment: result.assessment, domainTransaction });
    await usecases.handleStageAcquisition({ assessment: result.assessment, domainTransaction });
    await devcompUsecases.handleTrainingRecommendation({ assessment: result.assessment, locale, domainTransaction });
    event = result.event;
  });

  await events.eventDispatcher.dispatch(event);

  return null;
};

const updateLastChallengeState = async function (request) {
  const assessmentId = request.params.id;
  const lastQuestionState = request.params.state;
  const challengeId = request.payload?.data?.attributes?.['challenge-id'];

  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.updateLastQuestionState({ assessmentId, challengeId, lastQuestionState, domainTransaction });
  });

  return null;
};

const findCompetenceEvaluations = async function (request) {
  const userId = request.auth.credentials.userId;
  const assessmentId = request.params.id;

  const competenceEvaluations = await usecases.findCompetenceEvaluationsByAssessment({ userId, assessmentId });

  return competenceEvaluationSerializer.serialize(competenceEvaluations);
};

const autoValidateNextChallenge = async function (request, h) {
  const assessmentId = request.params.id;
  const locale = extractLocaleFromRequest(request);
  const assessment = await usecases.getAssessment({ assessmentId, locale });
  const userId = assessment.userId;
  const fakeAnswer = {
    assessmentId,
    challengeId: assessment.lastChallengeId,
    value: 'FAKE_ANSWER_WITH_AUTO_VALIDATE_NEXT_CHALLENGE',
  };
  const validatorAlwaysOK = new ValidatorAlwaysOK();
  const alwaysTrueExaminer = new Examiner({ validator: validatorAlwaysOK });
  await usecases.correctAnswerThenUpdateAssessment({
    answer: fakeAnswer,
    userId,
    locale,
    examiner: alwaysTrueExaminer,
  });
  return h.response().code(204);
};

const createCertificationChallengeLiveAlert = async function (request, h) {
  const assessmentId = request.params.id;
  const challengeId = request.payload?.data?.attributes?.['challenge-id'];
  await usecases.createCertificationChallengeLiveAlert({ assessmentId, challengeId });
  return h.response().code(204);
};

const assessmentController = {
  save,
  get,
  getLastChallengeId,
  getNextChallenge,
  getCurrentActivity,
  completeAssessment,
  updateLastChallengeState,
  findCompetenceEvaluations,
  autoValidateNextChallenge,
  createAssessmentPreviewForPix1d,
  createCertificationChallengeLiveAlert,
};

export { assessmentController };

async function _getChallenge(assessment, request, dependencies) {
  if (assessment.isStarted()) {
    await dependencies.assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate: new Date() });
  }
  const challenge = await _getChallengeByAssessmentType({ assessment, request, dependencies });

  if (challenge) {
    if (challenge.id !== assessment.lastChallengeId) {
      await dependencies.assessmentRepository.updateWhenNewChallengeIsAsked({
        id: assessment.id,
        lastChallengeId: challenge.id,
      });
    }
  }

  return challenge;
}

async function _getChallengeByAssessmentType({ assessment, request, dependencies }) {
  const locale = extractLocaleFromRequest(request);

  if (assessment.isPreview()) {
    return dependencies.usecases.getNextChallengeForPreview({});
  }

  if (assessment.isCertification()) {
    return dependencies.usecases.getNextChallengeForCertification({ assessment, locale });
  }

  if (assessment.isDemo()) {
    return dependencies.usecases.getNextChallengeForDemo({ assessment });
  }

  if (assessment.isForCampaign()) {
    return dependencies.usecases.getNextChallengeForCampaignAssessment({ assessment, locale });
  }

  if (assessment.isCompetenceEvaluation()) {
    const userId = extractUserIdFromRequest(request);
    return dependencies.usecases.getNextChallengeForCompetenceEvaluation({ assessment, userId, locale });
  }

  return null;
}
