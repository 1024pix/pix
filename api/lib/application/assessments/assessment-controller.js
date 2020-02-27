const { AssessmentEndedError } = require('../../domain/errors');
const usecases = require('../../domain/usecases');
const logger = require('../../infrastructure/logger');
const JSONAPI = require('../../interfaces/jsonapi');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

module.exports = {

  save(request, h) {

    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.userId = requestResponseUtils.extractUserIdFromRequest(request);

    return Promise.resolve()
      .then(() => {
        if (assessment.isSmartPlacement()) {
          const codeCampaign = request.payload.data.attributes['code-campaign'];
          const participantExternalId = request.payload.data.attributes['participant-external-id'];
          return usecases.createAssessmentForCampaign({
            assessment,
            codeCampaign,
            participantExternalId
          });
        } else {
          assessment.state = 'started';
          return assessmentRepository.save(assessment);
        }
      })
      .then((assessment) => {
        return h.response(assessmentSerializer.serialize(assessment)).created();
      });
  },

  async get(request) {
    const assessmentId = parseInt(request.params.id);

    const assessment = await usecases.getAssessment({ assessmentId });

    return assessmentSerializer.serialize(assessment);
  },

  findByFilters(request) {
    let assessmentsPromise = Promise.resolve([]);
    const userId = requestResponseUtils.extractUserIdFromRequest(request);

    if (userId) {
      const filters = extractParameters(request.query).filter;

      if (filters.codeCampaign) {
        assessmentsPromise = usecases.findSmartPlacementAssessments({ userId, filters });
      }
    }

    return assessmentsPromise.then(assessmentSerializer.serialize);
  },

  getNextChallenge(request) {

    const logContext = {
      zone: 'assessmentController.getNextChallenge',
      type: 'controller',
      assessmentId: parseInt(request.params.id),
    };
    logger.trace(logContext, 'tracing assessmentController.getNextChallenge()');

    return assessmentRepository
      .get(parseInt(request.params.id))
      .then((assessment) => {

        logContext.assessmentType = assessment.type;
        logger.trace(logContext, 'assessment loaded');

        if (assessment.isPreview()) {
          return usecases.getNextChallengeForPreview({});
        }

        if (assessment.isCertification()) {
          return usecases.getNextChallengeForCertification({
            assessment
          });
        }

        if (assessment.isDemo()) {
          return usecases.getNextChallengeForDemo({
            assessment,
          });
        }

        if (assessment.isSmartPlacement()) {
          const tryImproving = Boolean(request.query.tryImproving);
          return usecases.getNextChallengeForSmartPlacement({
            assessment,
            tryImproving
          });
        }

        if (assessment.isCompetenceEvaluation()) {
          const userId = requestResponseUtils.extractUserIdFromRequest(request);
          return usecases.getNextChallengeForCompetenceEvaluation({
            assessment,
            userId
          });
        }
      })
      .then((challenge) => {
        logContext.challenge = challenge;
        logger.trace(logContext, 'replying with challenge');
        return challengeSerializer.serialize(challenge);
      })
      .catch((error) => {
        if (error instanceof AssessmentEndedError) {
          return JSONAPI.emptyDataResponse();
        }

        throw error;
      });
  },

  async completeAssessment(request) {
    const assessmentId = parseInt(request.params.id);

    const completedAssessment = await usecases.completeAssessment({ assessmentId });

    return assessmentSerializer.serialize(completedAssessment);
  },
};
