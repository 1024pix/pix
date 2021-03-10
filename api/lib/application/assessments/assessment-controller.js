const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const { AssessmentEndedError } = require('../../domain/errors');
const usecases = require('../../domain/usecases');
const events = require('../../domain/events');
const ChallengeRequested = require('../../domain/events/ChallengeRequested');
const logger = require('../../infrastructure/logger');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const competenceEvaluationSerializer = require('../../infrastructure/serializers/jsonapi/competence-evaluation-serializer');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const { extractLocaleFromRequest, extractUserIdFromRequest } = require('../../infrastructure/utils/request-response-utils');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = {

  async save(request, h) {
    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.userId = extractUserIdFromRequest(request);
    assessment.state = 'started';
    const createdAssessment = await assessmentRepository.save({ assessment });
    return h.response(assessmentSerializer.serialize(createdAssessment)).created();
  },

  async get(request) {
    const assessmentId = parseInt(request.params.id);
    const locale = extractLocaleFromRequest(request);

    const assessment = await usecases.getAssessment({ assessmentId, locale });

    return assessmentSerializer.serialize(assessment);
  },

  async findByFilters(request) {
    let assessments = [];
    const userId = extractUserIdFromRequest(request);

    if (userId) {
      const filters = extractParameters(request.query).filter;

      if (filters.codeCampaign) {
        assessments = await usecases.findCampaignAssessments({ userId, filters });
      }
    }

    return assessmentSerializer.serialize(assessments);
  },

  async getNextChallenge(request) {

    const logContext = {
      zone: 'assessmentController.getNextChallenge',
      type: 'controller',
      assessmentId: parseInt(request.params.id),
    };
    logger.trace(logContext, 'tracing assessmentController.getNextChallenge()');

    try {
      const assessment = await assessmentRepository.get(parseInt(request.params.id));
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
    const assessmentId = parseInt(request.params.id);

    await DomainTransaction.execute(async (domainTransaction) => {
      const event = await usecases.completeAssessment({ domainTransaction, assessmentId });
      await events.eventDispatcher.dispatch(event, domainTransaction);
    });

    return null;
  },

  async findCompetenceEvaluations(request) {
    const userId = request.auth.credentials.userId;
    const assessmentId = parseInt(request.params.id);

    const competenceEvaluations = await usecases.findCompetenceEvaluationsByAssessment({ userId, assessmentId });

    return competenceEvaluationSerializer.serialize(competenceEvaluations);
  },
};

async function _getChallenge(assessment, request) {
  const locale = extractLocaleFromRequest(request);

  await DomainTransaction.execute(async (domainTransaction) => {
    const event = new ChallengeRequested({ assessmentId: assessment.id });
    await events.eventDispatcher.dispatch(event, domainTransaction);
  });

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
    const tryImproving = Boolean(request.query.tryImproving);
    return usecases.getNextChallengeForCampaignAssessment({ assessment, tryImproving, locale });
  }

  if (assessment.isCompetenceEvaluation()) {
    const userId = extractUserIdFromRequest(request);
    return usecases.getNextChallengeForCompetenceEvaluation({ assessment, userId, locale });
  }
}
