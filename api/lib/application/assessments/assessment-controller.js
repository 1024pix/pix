import DomainTransaction from '../../infrastructure/DomainTransaction';

import { Serializer as JSONAPISerializer } from 'jsonapi-serializer';
import { AssessmentEndedError } from '../../domain/errors';
import usecases from '../../domain/usecases';
import events from '../../domain/events';
import logger from '../../infrastructure/logger';
import assessmentRepository from '../../infrastructure/repositories/assessment-repository';
import assessmentSerializer from '../../infrastructure/serializers/jsonapi/assessment-serializer';
import challengeSerializer from '../../infrastructure/serializers/jsonapi/challenge-serializer';
import competenceEvaluationSerializer from '../../infrastructure/serializers/jsonapi/competence-evaluation-serializer';
import { extractLocaleFromRequest, extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils';
import Examiner from '../../domain/models/Examiner';
import ValidatorAlwaysOK from '../../domain/models/ValidatorAlwaysOK';

export default {
  async save(request, h) {
    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.userId = extractUserIdFromRequest(request);
    assessment.state = 'started';
    const createdAssessment = await assessmentRepository.save({ assessment });
    return h.response(assessmentSerializer.serialize(createdAssessment)).created();
  },

  async get(request) {
    const assessmentId = request.params.id;
    const locale = extractLocaleFromRequest(request);

    const assessment = await usecases.getAssessment({ assessmentId, locale });

    return assessmentSerializer.serialize(assessment);
  },

  async getLastChallengeId(request, h) {
    const assessmentId = request.params.id;

    const lastChallengeId = await usecases.getLastChallengeIdFromAssessmentId({ assessmentId });

    return h.response(lastChallengeId).code(200);
  },

  async getChallengeForPixAutoAnswer(request, h) {
    const assessmentId = request.params.id;

    const challenge = await usecases.getChallengeForPixAutoAnswer({ assessmentId });

    return h.response(challenge).code(200);
  },

  async getNextChallenge(request) {
    const assessmentId = request.params.id;

    const logContext = {
      zone: 'assessmentController.getNextChallenge',
      type: 'controller',
      assessmentId,
    };
    logger.trace(logContext, 'tracing assessmentController.getNextChallenge()');

    try {
      const assessment = await assessmentRepository.get(assessmentId);
      logContext.assessmentType = assessment.type;
      logger.trace(logContext, 'assessment loaded');

      const challenge = await _getChallenge(assessment, request);
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
  },

  async completeAssessment(request) {
    const assessmentId = request.params.id;
    const locale = extractLocaleFromRequest(request);

    let event;
    await DomainTransaction.execute(async (domainTransaction) => {
      const result = await usecases.completeAssessment({ assessmentId, domainTransaction });
      await usecases.handleBadgeAcquisition({ assessment: result.assessment, domainTransaction });
      await usecases.handleTrainingRecommendation({ assessment: result.assessment, locale, domainTransaction });
      event = result.event;
    });

    await events.eventDispatcher.dispatch(event);

    return null;
  },

  async updateLastChallengeState(request) {
    const assessmentId = request.params.id;
    const lastQuestionState = request.params.state;
    const challengeId = request.payload?.data?.attributes?.['challenge-id'];

    await DomainTransaction.execute(async (domainTransaction) => {
      await usecases.updateLastQuestionState({ assessmentId, challengeId, lastQuestionState, domainTransaction });
    });

    return null;
  },

  async findCompetenceEvaluations(request) {
    const userId = request.auth.credentials.userId;
    const assessmentId = request.params.id;

    const competenceEvaluations = await usecases.findCompetenceEvaluationsByAssessment({ userId, assessmentId });

    return competenceEvaluationSerializer.serialize(competenceEvaluations);
  },

  async autoValidateNextChallenge(request, h) {
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
  },
};

async function _getChallenge(assessment, request) {
  if (assessment.isStarted()) {
    await assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate: new Date() });
  }
  const challenge = await _getChallengeByAssessmentType({ assessment, request });

  if (challenge) {
    if (challenge.id !== assessment.lastChallengeId) {
      await assessmentRepository.updateWhenNewChallengeIsAsked({ id: assessment.id, lastChallengeId: challenge.id });
    }
  }

  return challenge;
}

async function _getChallengeByAssessmentType({ assessment, request }) {
  const locale = extractLocaleFromRequest(request);

  if (assessment.isPreview()) {
    return usecases.getNextChallengeForPreview({});
  }

  if (assessment.isCertification()) {
    return usecases.getNextChallengeForCertification({ assessment });
  }

  if (assessment.isDemo()) {
    return usecases.getNextChallengeForDemo({ assessment });
  }

  if (assessment.isForCampaign()) {
    return usecases.getNextChallengeForCampaignAssessment({ assessment, locale });
  }

  if (assessment.isCompetenceEvaluation()) {
    const userId = extractUserIdFromRequest(request);
    return usecases.getNextChallengeForCompetenceEvaluation({ assessment, userId, locale });
  }

  return null;
}
