const Boom = require('boom');

const assessmentSerializer = require('../../infrastructure/serializers/jsonapi/assessment-serializer');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentService = require('../../domain/services/assessment-service');
const tokenService = require('../../domain/services/token-service');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const logger = require('../../infrastructure/logger');

const { NotFoundError, AssessmentEndedError, ObjectValidationError } = require('../../domain/errors');

module.exports = {

  save(request, reply) {

    const assessment = assessmentSerializer.deserialize(request.payload);
    assessment.state = 'started';

    if (request.headers.hasOwnProperty('authorization')) {
      const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
      const userId = tokenService.extractUserId(token);

      assessment.userId = userId;
    }

    return assessmentRepository.save(assessment)
      .then(assessment => {
        reply(assessmentSerializer.serialize(assessment)).code(201);
      })
      .catch((err) => {
        if (err instanceof ObjectValidationError) {
          return reply(Boom.badData(err));
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
      .catch(err => {
        if (err instanceof NotFoundError) {
          return reply(Boom.notFound(err));
        }

        logger.error(err);

        return reply(Boom.badImplementation(err));
      });
  },

  findByFilters(request, reply) {
    const filters = queryParamsUtils.extractFilters(request);

    return assessmentService.findByFilters(filters)
      .then((assessments) => {
        reply(assessmentSerializer.serializeArray(assessments));
      });
  },

  getNextChallenge(request, reply) {

    return assessmentRepository
      .get(request.params.id)
      .then((assessment) => {

        if (assessmentService.isCertificationAssessment(assessment)) {
          return assessmentService
            .getNextChallengeForCertificationCourse(assessment)
            .then((challenge) => challenge.challengeId);
        }

        return assessmentService.getAssessmentNextChallengeId(assessment, request.params.challengeId);
      })
      .then(challengeRepository.get)
      .then((challenge) => {
        reply(challengeSerializer.serialize(challenge));
      })
      .catch((err) => {
        if (err instanceof AssessmentEndedError) {
          return reply(Boom.notFound());
        }

        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  computeCompetenceMarksForAssessmentResult(request, reply) {
    const { assessmentId, assessmentResultId } = request.params;

    return assessmentService.computeMarks(assessmentId, assessmentResultId).then(() => {
      reply();
    }).catch(error => {
      logger.error(error);
      reply(Boom.teapot(error));
    });
  }
};
