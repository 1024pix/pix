const { AssessmentEndedError } = require('../../domain/errors');
const useCases = require('../../domain/usecases');
const logger = require('../../infrastructure/logger');
const JSONAPI = require('../../interfaces/jsonapi');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const { extractUserIdFromRequest } = require('../../infrastructure/utils/request-utils');

module.exports = {

  save(request, h) {

    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.userId = extractUserIdFromRequest(request);

    return Promise.resolve()
      .then(() => {
        if (assessment.isSmartPlacement()) {
          const codeCampaign = request.payload.data.attributes['code-campaign'];
          const participantExternalId = request.payload.data.attributes['participant-external-id'];
          return useCases.createAssessmentForCampaign({
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
    const assessmentId = request.params.id;

    const assessment = await useCases.getAssessment({ assessmentId });

    return assessmentSerializer.serialize(assessment);
  },

  findByFilters(request) {
    let assessmentsPromise = Promise.resolve([]);
    const userId = extractUserIdFromRequest(request);

    if (userId) {
      const filters = extractParameters(request.query).filter;

      if (filters.codeCampaign) {
        assessmentsPromise = useCases.findSmartPlacementAssessments({ userId, filters });
      } else if (filters.type === 'CERTIFICATION') {
        assessmentsPromise = useCases.findCertificationAssessments({ userId, filters });
      }
    }

    return assessmentsPromise.then(assessmentSerializer.serialize);
  },

  getNextChallenge(request) {

    const logContext = {
      zone: 'assessmentController.getNextChallenge',
      type: 'controller',
      assessmentId: request.params.id,
    };
    logger.trace(logContext, 'tracing assessmentController.getNextChallenge()');

    return assessmentRepository
      .get(request.params.id)
      .then((assessment) => {

        logContext.assessmentType = assessment.type;
        logger.trace(logContext, 'assessment loaded');

        if (assessment.isPreview()) {
          return useCases.getNextChallengeForPreview({});
        }

        if (assessment.isCertification()) {
          return useCases.getNextChallengeForCertification({
            assessment
          });
        }

        if (assessment.isDemo()) {
          return useCases.getNextChallengeForDemo({
            assessment,
          });
        }

        if (assessment.isPlacement()) {
          return useCases.getNextChallengeForPlacement({
            assessment,
          });
        }

        if (assessment.isSmartPlacement()) {
          return useCases.getNextChallengeForSmartPlacement({
            assessment,
          });
        }

        if (assessment.isCompetenceEvaluation()) {
          const userId = extractUserIdFromRequest(request);
          return useCases.getNextChallengeForCompetenceEvaluation({
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
  }
};
