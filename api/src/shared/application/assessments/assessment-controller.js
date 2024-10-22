import { Serializer as JSONAPISerializer } from 'jsonapi-serializer';

import { usecases } from '../../../../lib/domain/usecases/index.js';
import { usecases as certificationEvaluationUsecases } from '../../../certification/evaluation/domain/usecases/index.js';
import * as certificationVersionRepository from '../../../certification/results/infrastructure/repositories/certification-version-repository.js';
import { usecases as certificationUsecases } from '../../../certification/session-management/domain/usecases/index.js';
import { SessionVersion } from '../../../certification/shared/domain/models/SessionVersion.js';
import * as certificationChallengeRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-repository.js';
import { usecases as devcompUsecases } from '../../../devcomp/domain/usecases/index.js';
import { Answer } from '../../../evaluation/domain/models/Answer.js';
import { ValidatorAlwaysOK } from '../../../evaluation/domain/models/ValidatorAlwaysOK.js';
import * as competenceEvaluationSerializer from '../../../evaluation/infrastructure/serializers/jsonapi/competence-evaluation-serializer.js';
import {
  extractLocaleFromRequest,
  extractUserIdFromRequest,
} from '../../../shared/infrastructure/utils/request-response-utils.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { AssessmentEndedError } from '../../domain/errors.js';
import { Examiner } from '../../domain/models/Examiner.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as assessmentSerializer from '../../infrastructure/serializers/jsonapi/assessment-serializer.js';
import * as challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer.js';
import { logger } from '../../infrastructure/utils/logger.js';

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
    certificationVersionRepository,
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

const completeAssessment = async function (request) {
  const assessmentId = request.params.id;
  const locale = extractLocaleFromRequest(request);

  await DomainTransaction.execute(async () => {
    const assessment = await usecases.completeAssessment({ assessmentId, locale });
    await usecases.handleBadgeAcquisition({ assessment });
    await usecases.handleStageAcquisition({ assessment });
    await devcompUsecases.handleTrainingRecommendation({ assessment, locale });
  });

  return null;
};

const updateLastChallengeState = async function (request) {
  const assessmentId = request.params.id;
  const lastQuestionState = request.params.state;
  const challengeId = request.payload?.data?.attributes?.['challenge-id'];

  await DomainTransaction.execute(async () => {
    await usecases.updateLastQuestionState({ assessmentId, challengeId, lastQuestionState });
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
  const fakeAnswer = new Answer({
    assessmentId,
    challengeId: assessment.lastChallengeId,
    value: 'FAKE_ANSWER_WITH_AUTO_VALIDATE_NEXT_CHALLENGE',
  });
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
  await certificationUsecases.createCertificationChallengeLiveAlert({ assessmentId, challengeId });
  return h.response().code(204);
};

const assessmentController = {
  save,
  get,
  getLastChallengeId,
  getNextChallenge,
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
    const certificationCourseVersion = await dependencies.certificationVersionRepository.getByCertificationCourseId({
      certificationCourseId: assessment.certificationCourseId,
    });

    // TODO: switch to certif-course version, not session
    if (SessionVersion.isV3(certificationCourseVersion)) {
      return certificationEvaluationUsecases.getNextChallenge({ assessment, locale });
    } else {
      return certificationEvaluationUsecases.getNextChallengeForV2Certification({ assessment, locale });
    }
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
