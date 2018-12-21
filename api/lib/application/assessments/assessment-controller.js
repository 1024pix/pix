const Boom = require('boom');
const JSONAPI = require('../../interfaces/jsonapi');

const controllerReplies = require('../../infrastructure/controller-replies');
const logger = require('../../infrastructure/logger');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const infraErrors = require('../../infrastructure/errors');

const {
  NotFoundError,
  AssessmentEndedError,
  AssessmentStartError,
  ObjectValidationError,
  CampaignCodeError
} = require('../../domain/errors');
const InfrastructureNotFoundError = require('../../infrastructure/errors').NotFoundError;
const tokenService = require('../../domain/services/token-service');
const useCases = require('../../domain/usecases');

function _extractUserIdFromRequest(request) {
  if (request.headers && request.headers.authorization) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    return tokenService.extractUserId(token);
  }
  return null;
}

module.exports = {

  save(request, h) {

    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.userId = _extractUserIdFromRequest(request);

    return Promise.resolve()
      .then(() => {
        if (assessment.hasTypeSmartPlacement()) {
          const codeCampaign = request.payload.data.attributes['code-campaign'];
          const participantExternalId = request.payload.data.attributes['participant-external-id'];
          return useCases.createAssessmentForCampaign({
            assessment,
            codeCampaign,
            participantExternalId
          });
        } else if (assessment.hasTypePlacement()) {
          return useCases.startPlacementAssessment({ assessment, assessmentRepository });
        } else {
          assessment.state = 'started';
          return assessmentRepository.save(assessment);
        }
      })
      .then((assessment) => {
        return h.response(assessmentSerializer.serialize(assessment)).code(201);
      })
      .catch((err) => {
        if (err instanceof ObjectValidationError) {
          throw Boom.badData(err);
        }
        if (err instanceof CampaignCodeError) {
          throw Boom.notFound(CampaignCodeError);
        }
        if (err instanceof AssessmentStartError) {
          return controllerReplies(h).error(new infraErrors.ConflictError(err.message));
        }
        logger.error(err);
        throw Boom.badImplementation(err);
      });

  },

  async get(request, h) {
    try {
      const assessmentId = request.params.id;

      const assessment = await useCases.getAssessment({ assessmentId });

      return assessmentSerializer.serialize(assessment);
    } catch (err) {

      if (err instanceof NotFoundError) {
        const error = new InfrastructureNotFoundError(err.message);
        return controllerReplies(h).error(error);
      }

      logger.error(err);
      return controllerReplies(h).error(err);
    }
  },

  findByFilters(request) {
    let assessmentsPromise = Promise.resolve([]);
    const userId = _extractUserIdFromRequest(request);

    if (userId) {
      const filters = queryParamsUtils.extractFilters(request);

      if (filters.codeCampaign) {
        assessmentsPromise = useCases.findSmartPlacementAssessments({ userId, filters });
      } else if (filters.type === 'CERTIFICATION') {
        assessmentsPromise = useCases.findCertificationAssessments({ userId, filters });
      } else if (filters.type === 'PLACEMENT') {
        assessmentsPromise = useCases.findPlacementAssessments({ userId, filters });
      }
    }

    return assessmentsPromise.then((assessments) => assessmentSerializer.serializeArray(assessments));
  },

  getNextChallenge(request, h) {

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

        if (assessment.hasTypePreview()) {
          return useCases.getNextChallengeForPreview({});
        }

        if (assessment.hasTypeCertification()) {
          return useCases.getNextChallengeForCertification({
            assessment
          });
        }

        if (assessment.hasTypeDemo()) {
          return useCases.getNextChallengeForDemo({
            assessment,
            challengeId: request.params.challengeId,
          });
        }

        if (assessment.hasTypePlacement()) {
          return useCases.getNextChallengeForPlacement({
            assessment,
          });
        }

        if (assessment.hasTypeSmartPlacement()) {
          return useCases.getNextChallengeForSmartPlacement({
            assessment,
          });
        }

      })
      .then((challenge) => {
        logContext.challenge = challenge;
        logger.trace(logContext, 'replying with challenge');
        return challengeSerializer.serialize(challenge);
      })
      .catch((err) => {
        logContext.err = err;
        logger.trace(logContext, 'catching exception');
        if (err instanceof AssessmentEndedError) {
          return controllerReplies(h).ok(JSONAPI.emptyDataResponse());
        } else {
          logger.error(err);
          return controllerReplies(h).error(err);
        }
      });
  }
};
