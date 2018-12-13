const Boom = require('boom');
const JSONAPI = require('../../interfaces/jsonapi');

const controllerReplies = require('../../infrastructure/controller-replies');
const logger = require('../../infrastructure/logger');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const infraErrors = require('../../infrastructure/errors');

const { NotFoundError, AssessmentEndedError, AssessmentStartError,
  ObjectValidationError, CampaignCodeError } = require('../../domain/errors');
const assessmentService = require('../../domain/services/assessment-service');
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

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.userId = _extractUserIdFromRequest(request);

    return Promise.resolve()
      .then(() => {
        if (assessment.isSmartPlacementAssessment()) {
          const codeCampaign = request.payload.data.attributes['code-campaign'];
          const participantExternalId = request.payload.data.attributes['participant-external-id'];
          return useCases.createAssessmentForCampaign({
            assessment,
            codeCampaign,
            participantExternalId
          });
        } else if (assessment.isPlacementAssessment()) {
          return useCases.startPlacementAssessment({ assessment, assessmentRepository });
        } else {
          assessment.state = 'started';
          return assessmentRepository.save(assessment);
        }
      })
      .then((assessment) => {
        reply(assessmentSerializer.serialize(assessment)).code(201);
      })
      .catch((err) => {
        if (err instanceof ObjectValidationError) {
          return reply(Boom.badData(err));
        }
        if (err instanceof CampaignCodeError) {
          return reply(Boom.notFound(CampaignCodeError));
        }
        if(err instanceof AssessmentStartError) {
          return controllerReplies(reply).error(new infraErrors.ConflictError(err.message));
        }
        logger.error(err);
        reply(Boom.badImplementation(err));
      });

  },

  get(request, reply) {
    const assessmentId = request.params.id;

    return assessmentService
      .fetchAssessment(assessmentId)
      .then(({ assessmentPix }) => {
        const serializedAssessment = assessmentSerializer.serialize(assessmentPix);
        return reply(serializedAssessment);
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }

        logger.error(err);

        return reply(Boom.badImplementation(err));
      });
  },

  findByFilters(request, reply) {
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

    return assessmentsPromise.then((assessments) => {
      reply(assessmentSerializer.serializeArray(assessments));
    });
  },

  getNextChallenge(request, reply) {

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

        if (assessmentService.isPreviewAssessment(assessment)) {
          return useCases.getNextChallengeForPreview({});
        }

        if (assessmentService.isCertificationAssessment(assessment)) {
          return useCases.getNextChallengeForCertification({
            assessment
          });
        }

        if (assessmentService.isDemoAssessment(assessment)) {
          return useCases.getNextChallengeForDemo({
            assessment,
            challengeId: request.params.challengeId,
          });
        }

        if (assessment.isPlacementAssessment()) {
          return useCases.getNextChallengeForPlacement({
            assessment,
          });
        }

        if (assessment.isSmartPlacementAssessment()) {
          return useCases.getNextChallengeForSmartPlacement({
            assessment,
          });
        }

      })
      .then((challenge) => {
        logContext.challenge = challenge;
        logger.trace(logContext, 'replying with challenge');
        reply(challengeSerializer.serialize(challenge));
      })
      .catch((err) => {
        logContext.err = err;
        logger.trace(logContext, 'catching exception');
        if (err instanceof AssessmentEndedError) {
          return controllerReplies(reply).ok(JSONAPI.emptyDataResponse());
        } else {
          logger.error(err);
          return controllerReplies(reply).error(err);
        }
      });
  }
};
